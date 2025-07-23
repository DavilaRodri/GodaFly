import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Keyboard,
  Image,
  Pressable,
  ImageBackground,
  Platform,
  SafeAreaView,
  Linking,
} from 'react-native';

import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNExitApp from 'react-native-exit-app';
import {useBackHandler} from '@react-native-community/hooks';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import RBSheet from 'react-native-raw-bottom-sheet';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys, keyPref} from '../../service/ApiKeys';

import TextInputComponent from '../../components/TextInputComponent';
import ButtonComponent from '../../components/ButtonComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';

import {
  colors,
  config,
  logDisplay,
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import {Strings} from '../../utils/strings';
import appFonts from '../../utils/appFonts';
import Validation from '../../utils/validation';

const Login = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passSecure, setPassSecure] = useState(true);
  const [inputFocus, setInputFocus] = useState('');

  const passwordRef = useRef('');
  const refRBUpdateSheet = useRef();

  useBackHandler(() => {
    RNExitApp.exitApp();
    return true;
  });

  useEffect(() => {
    versionCheckerApiCall();
  }, []);

  const loginApiCall = async () => {
    const deviceId = await DeviceInfo?.getDeviceId();
    const deviceType = Platform.OS;
    const fcmToken = (await AsyncStorage.getItem(keyPref.FCM_TOKEN)) ?? '';

    const data = new FormData();
    data.append(ApiKeys.EMAIL, email);
    data.append(ApiKeys.PASSWORD, password);
    data.append(ApiKeys.DEVICE_ID, deviceId);
    data.append(ApiKeys.DEVICE_TYPE, deviceType);
    data.append(ApiKeys.PUSH_TOKEN, fcmToken);

    postServiceCall(ApiEndpoint.LOGIN, data, true)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          const responseData = Validation.isEmptyValue(res?.data, 'arr');
          await AsyncStorage.setItem(
            keyPref.USER_DATA,
            JSON.stringify(responseData),
          );
          showSuccessMessage(res?.message);
          if (responseData?.is_complete_profile == 0) {
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'SetupProfile'}],
              });
            }, 500);
          } else {
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              });
            }, 500);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        switch (error?.status) {
          case 412:
            showErrorMessage(error?.message);
            break;
          case 401:
            showErrorMessage(error?.message);
            break;
        }
        setLoading(false);
      });
  };

  const versionCheckerApiCall = async () => {
    const appVersion = await DeviceInfo?.getVersion();

    const data = new FormData();
    data.append(ApiKeys.TYPE, Platform.OS);
    data.append(ApiKeys.VERSION, appVersion);
    postServiceCall(ApiEndpoint.V_CHECKER, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
        }
      })
      .catch(error => {
        switch (error?.status) {
          case 412:
            if (error.data?.is_force_update == 1) {
              refRBUpdateSheet?.current?.open();
            } else {
              showErrorMessage(error?.message);
            }
            break;
          case 401:
            showErrorMessage(error?.message);
            break;
        }
      });
  };

  const socialCheckApiCall = async (type, socialData) => {
    const deviceId = await DeviceInfo?.getDeviceId();
    const deviceType = Platform.OS;

    const data = new FormData();
    data.append(ApiKeys.S_ID, socialData?.id);
    data.append(ApiKeys.EMAIL, socialData?.email ?? '');
    data.append(ApiKeys.TYPE, type);
    data.append(ApiKeys.DEVICE_ID, deviceId);
    data.append(ApiKeys.DEVICE_TYPE, deviceType);

    postServiceCall(ApiEndpoint.CHECK_SOCIAL, data, true)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          responseData = {
            ...responseData,
            authType: type,
          };
          await AsyncStorage.setItem(
            keyPref.USER_DATA,
            JSON.stringify(responseData),
          );
          showSuccessMessage(res?.message);
          if (responseData?.is_complete_profile == 0) {
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'SetupProfile'}],
              });
            }, 500);
          } else {
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              });
            }, 500);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        switch (error?.status) {
          case 412:
            Keyboard.dismiss();
            navigation.replace('CreateAccount', {
              type,
              socialUserData: socialData,
            });
            break;
          case 401:
            showErrorMessage(error?.message);
            break;
        }
        setLoading(false);
      });
  };

  const facebookAuthSignIn = async () => {
    LoginManager.logInWithPermissions(['public_profile']).then(
      function (result) {
        if (result.isCancelled) {
          console.log('Login cancelled');
        } else {
          console.log(
            'Login success with permissions: ' +
              result.grantedPermissions.toString(),
          );
          AccessToken.getCurrentAccessToken().then(data => {
            console.log(data);
            const processRequest = new GraphRequest(
              '/me?fields=name,email',
              null,
              (error, result) => {
                if (error) {
                  //Alert for the Error
                  console.log('Error fetching data: ' + error.toString());
                } else {
                  //response alert
                  console.log(JSON.stringify(result));
                  setLoading(
                    () => true,
                    socialCheckApiCall('facebook', result),
                  );
                }
              },
            );
            // Start the graph request.
            new GraphRequestManager().addRequest(processRequest).start();
          });
        }
      },
      function (error) {
        console.log('Login fail with error: ' + error);
      },
    );
  };

  const appleAuthSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      logDisplay('>>>>> APPLE AUTH RESPONE  ', appleAuthRequestResponse);
      const updateData = {
        ...appleAuthRequestResponse,
        id: appleAuthRequestResponse?.user,
      };
      setLoading(() => true, socialCheckApiCall('apple', updateData));
    } catch (error) {
      logDisplay('>>>>>>> ERRORR ', error);
    }
  };

  const checkValidation = () => {
    Keyboard.dismiss();
    switch (true) {
      case Validation.isEmpty(email.trim()):
        showErrorMessage(Strings.plsEnterEmail);
        break;
      case !Validation.validEmail(email):
        showErrorMessage(Strings.plsEnterValidEmail);
        break;
      case Validation.isEmpty(password.trim()):
        showErrorMessage(Strings.plsEnterPassword);
        break;
      default:
        setLoading(() => true, loginApiCall());
        break;
    }
  };

  const ImageCurveView = () => (
    <ImageBackground
      resizeMode="stretch"
      style={{height: verticalScale(260)}}
      source={ImageView.curveImg}
      imageStyle={{width: '100%', height: '100%'}}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: verticalScale(200),
        }}>
        <Image
          resizeMode="contain"
          style={styles.centerAppLogo}
          source={ImageView.appLogo}
        />
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: scale(20),
        }}>
        <Text style={styles.signInTxt}>{Strings.signIn}</Text>
        <View style={styles.heightBox} />
        <Text style={styles.signInMsgTxt}>{Strings.plsSignIn}</Text>
      </View>
    </ImageBackground>
  );

  const UserActionView = () => (
    <View style={styles.userActionContainer}>
      <TextInputComponent
        blurOnSubmit={false}
        placeholder={Strings.entEmail}
        value={email}
        container={
          inputFocus == Strings.entEmail
            ? {borderColor: colors.primary_color}
            : null
        }
        inputTxtStyl={{
          color: Validation.isEmpty(email)
            ? colors.darkGreyishNavy2
            : colors.darkGreyishNavy,
          fontSize: Validation.isEmpty(email)
            ? moderateScale(14)
            : moderateScale(16),
        }}
        onFocus={() => {
          setInputFocus(Strings.entEmail);
        }}
        onBlur={() => {
          setInputFocus('');
        }}
        keyboardType="email-address"
        onChangeText={text => setEmail(text)}
        onSubmitEditing={() => {
          passwordRef.current.focus();
        }}
        returnKeyType={'next'}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        inputTxtStyl={{
          color: Validation.isEmpty(password)
            ? colors.darkGreyishNavy2
            : colors.darkGreyishNavy,
          fontSize: Validation.isEmpty(password)
            ? moderateScale(14)
            : moderateScale(16),
        }}
        placeholder={Strings.entPassword}
        value={password}
        container={
          inputFocus == Strings.entPassword
            ? {borderColor: colors.primary_color}
            : null
        }
        onFocus={() => {
          setInputFocus(Strings.entPassword);
        }}
        onBlur={() => {
          setInputFocus('');
        }}
        inputRef={passwordRef}
        onChangeText={text => setPassword(text)}
        onSubmitEditing={() => {
          checkValidation();
        }}
        secureTextEntry={passSecure}
        onRightIconPress={() => setPassSecure(!passSecure)}
        rightIcon={!passSecure ? ImageView.hide : ImageView.show}
      />
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          navigation.navigate('ForgotPassword');
        }}
        style={styles.forgotPassContainer}>
        <Text style={styles.forgotTxt}>{Strings.forgotPassword}</Text>
      </Pressable>
      <ButtonComponent
        onBtnPress={() => {
          checkValidation();
        }}
        btnLabel={Strings.login}
      />
      <View style={styles.forgotPassContainer}>
        <Text style={[styles.forgotTxt, {color: colors.btnShadowClr}]}>
          {Strings.orUseSocial}
        </Text>
      </View>
      <View
        style={[
          styles.socialLoginContainer,
          {
            justifyContent:
              Platform.OS == 'android' ? 'center' : 'space-between',
          },
        ]}>
        {Platform.OS == 'ios' && (
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              appleAuthSignIn();
            }}
            style={styles.socailBoxContainer}>
            <Image
              resizeMode="contain"
              style={styles.socialIcon}
              source={ImageView.apple}
            />
            <Text style={styles.socialTxt}>{Strings.apple}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            facebookAuthSignIn();
          }}
          style={[
            styles.socailBoxContainer,
            {backgroundColor: colors.fbColor},
          ]}>
          <Image
            resizeMode="contain"
            style={styles.socialIcon}
            source={ImageView.facebook}
          />
          <Text style={styles.socialTxt}>{Strings.facebook}</Text>
        </Pressable>
      </View>
    </View>
  );

  const FooterView = () => (
    <View>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          navigation.replace('CreateAccount');
        }}
        style={[
          styles.forgotPassContainer,
          {
            marginVertical: scale(10),
          },
        ]}>
        <Text
          style={[
            styles.forgotTxt,
            {
              textDecorationLine: 'underline',
            },
          ]}>
          {Strings.orCreate}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 0, backgroundColor: colors.primary_color}} />
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
        <LoadingComponent isVisible={loading} />
        <RBSheet
          ref={refRBUpdateSheet}
          height={verticalScale(200)}
          openDuration={250}
          closeOnDragDown={false}
          closeOnPressMask={false}
          closeOnPressBack={false}
          dragFromTopOnly={true}
          customStyles={{
            container: {
              borderTopEndRadius: 20,
              borderTopStartRadius: 20,
            },
          }}>
          <ConfirmationPopupComponent
            postiveBtnPress={() => {
              Platform.OS == 'android'
                ? Linking.openURL(
                    `market://details?id=${config.ANDROID_PACKAGE_NAME}`,
                  )
                : Linking.openURL(
                    `https://apps.apple.com/us/app/apple-store/id${config.IOS_APP_ID}`,
                  );
            }}
            postiveTxt={Strings.update}
            titleMessage={Strings.newVAvailable}
          />
        </RBSheet>
        <KeyboardAwareScrollView
          style={styles.container}
          bounces={false}
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}>
          {ImageCurveView()}
          {UserActionView()}
          {FooterView()}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerAppLogo: {
    width: scale(150),
    height: scale(150),
  },
  heightBox: {
    marginVertical: scale(4),
  },
  userActionContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: scale(30),
  },
  signInTxt: {
    fontSize: moderateScale(24),
    fontFamily: appFonts.ralewayBold,
    textAlign: 'center',
    color: colors.darkBlue,
  },
  signInMsgTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayRegular,
    textAlign: 'center',
    color: colors.suvaGrey,
  },
  forgotPassContainer: {
    alignSelf: 'center',
    marginVertical: scale(20),
    padding: scale(2),
  },
  forgotTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayRegular,
    textAlign: 'center',
    color: colors.darkBlue,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socailBoxContainer: {
    backgroundColor: colors.black,
    padding: scale(13),
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  socialIcon: {
    width: scale(20),
    height: scale(20),
    marginEnd: scale(5),
  },
  socialTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayMedium,
    color: colors.white,
  },
});

export default Login;
