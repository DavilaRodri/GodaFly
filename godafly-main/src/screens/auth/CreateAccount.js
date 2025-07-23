import React, {useState, useRef, useCallback} from 'react';
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
} from 'react-native';

import {CountryPicker} from 'react-native-country-codes-picker';
import CountryFlag from 'react-native-country-flag';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNExitApp from 'react-native-exit-app';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys, keyPref} from '../../service/ApiKeys';

import TextInputComponent from '../../components/TextInputComponent';
import ButtonComponent from '../../components/ButtonComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {
  colors,
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import {Strings} from '../../utils/strings';
import appFonts from '../../utils/appFonts';
import Validation from '../../utils/validation';

const CreateAccount = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(route.params?.socialUserData?.email ?? '');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [passSecure, setPassSecure] = useState(true);
  const [cPassword, setCPassword] = useState('');
  const [cPassSecure, setCPassSecure] = useState(true);
  const [inputFocus, setInputFocus] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [countrySelectedFalg, setCountrySelectedFalg] = useState('CA');

  const lNameRef = useRef('');
  const emailRef = useRef('');
  const mobileNoRef = useRef('');
  const cPasswordRef = useRef('');
  const passwordRef = useRef('');

  const createAccountApiCall = async () => {
    const deviceId = await DeviceInfo?.getDeviceId();
    const deviceType = Platform.OS;
    const fcmToken = (await AsyncStorage.getItem(keyPref.FCM_TOKEN)) ?? '';

    const data = new FormData();
    data.append(ApiKeys.F_NAME, fName);
    data.append(ApiKeys.L_NAME, lName);
    data.append(ApiKeys.COUNTRY_CODE, countryCode);
    data.append(ApiKeys.COUNTRY_INITIAL_CODE, countrySelectedFalg);
    data.append(ApiKeys.MOBILE, mobileNo);
    data.append(ApiKeys.EMAIL, email);
    if (Validation.isEmpty(route.params?.type))
      data.append(ApiKeys.PASSWORD, password);
    data.append(ApiKeys.DEVICE_ID, deviceId);
    data.append(ApiKeys.DEVICE_TYPE, deviceType);
    data.append(ApiKeys.PUSH_TOKEN, fcmToken);
    data.append(ApiKeys.REGISTER_WITH, route.params?.type ?? 'email');
    data.append(ApiKeys.S_USER_ID, route.params?.socialUserData?.id ?? '');

    postServiceCall(ApiEndpoint.SIGN_UP, data, true)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          showSuccessMessage(res?.message);
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          if (!Validation.isEmpty(route.params?.type)) {
            responseData = {
              ...responseData,
              authType: route.params?.type,
            };
          }
          await AsyncStorage.setItem(
            keyPref.USER_DATA,
            JSON.stringify(responseData),
          );
          setTimeout(() => {
            navigation.replace('SetupProfile');
          }, 500);
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
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
            }, 500);
            break;
        }
        setLoading(false);
      });
  };

  useBackHandler(() => {
    RNExitApp.exitApp();
    return true;
  });

  const checkValidation = () => {
    Keyboard.dismiss();
    switch (true) {
      case Validation.isEmpty(fName.trim()):
        showErrorMessage(Strings.plsEnterFName);
        break;
      case Validation.isEmpty(lName.trim()):
        showErrorMessage(Strings.plsEnterLName);
        break;
      case Validation.isEmpty(mobileNo.trim()):
        showErrorMessage(Strings.plsEnterMobile);
        break;
      case Validation.isEmpty(email.trim()):
        showErrorMessage(Strings.plsEnterEmail);
        break;
      case !Validation.validEmail(email):
        showErrorMessage(Strings.plsEnterValidEmail);
        break;
      case Validation.isEmpty(password.trim()) &&
        Validation.isEmpty(route.params?.type):
        showErrorMessage(Strings.plsEnterPassword);
        break;
      case Validation.isEmpty(cPassword.trim()) &&
        Validation.isEmpty(route.params?.type):
        showErrorMessage(Strings.plsEnterCPassword);
        break;
      case cPassword !== password && Validation.isEmpty(route.params?.type):
        showErrorMessage(Strings.doesNotMatchPassword);
        break;
      default:
        setLoading(() => true, createAccountApiCall());
        break;
    }
  };

  const onSelect = item => {
    setCountryCode(item.dial_code);
    setCountrySelectedFalg(item?.code);
    setShowCountryPicker(false);
  };

  const ImageCurveView = () => (
    <ImageBackground
      resizeMode="stretch"
      style={{height: verticalScale(220)}}
      source={ImageView.curveImg}
      imageStyle={{width: '100%', height: '100%'}}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: verticalScale(170),
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
          paddingVertical: scale(30),
        }}>
        <Text style={styles.signInTxt}>{Strings.createAccount}</Text>
        <View style={styles.heightBox} />
        <Text style={styles.signInMsgTxt}>{Strings.plsCreateAcc}</Text>
      </View>
    </ImageBackground>
  );

  const UserActionView = () => (
    <View style={styles.userActionContainer}>
      <View style={styles.fLNameContainer}>
        <TextInputComponent
          blurOnSubmit={false}
          inputTxtStyl={{
            color: Validation.isEmpty(fName)
              ? colors.darkGreyishNavy2
              : colors.darkGreyishNavy,
            fontSize: Validation.isEmpty(fName)
              ? moderateScale(14)
              : moderateScale(16),
          }}
          placeholder={Strings.entFName}
          value={fName}
          container={[
            {flex: 0.48},
            inputFocus == Strings.entFName
              ? {borderColor: colors.primary_color}
              : null,
          ]}
          onFocus={() => {
            setInputFocus(Strings.entFName);
          }}
          onBlur={() => {
            setInputFocus('');
          }}
          onChangeText={text => setFName(text)}
          onSubmitEditing={() => {
            lNameRef.current.focus();
          }}
          returnKeyType={'next'}
        />
        <TextInputComponent
          blurOnSubmit={false}
          inputTxtStyl={{
            color: Validation.isEmpty(lName)
              ? colors.darkGreyishNavy2
              : colors.darkGreyishNavy,
            fontSize: Validation.isEmpty(lName)
              ? moderateScale(14)
              : moderateScale(16),
          }}
          placeholder={Strings.entLName}
          value={lName}
          container={[
            {flex: 0.48},
            inputFocus == Strings.entLName
              ? {borderColor: colors.primary_color}
              : null,
          ]}
          onFocus={() => {
            setInputFocus(Strings.entLName);
          }}
          onBlur={() => {
            setInputFocus('');
          }}
          onChangeText={text => setLName(text)}
          onSubmitEditing={() => {
            mobileNoRef.current.focus();
          }}
          inputRef={lNameRef}
          returnKeyType={'next'}
        />
      </View>
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        blurOnSubmit={false}
        inputTxtStyl={{
          color: Validation.isEmpty(mobileNo)
            ? colors.darkGreyishNavy2
            : colors.darkGreyishNavy,
          fontSize: Validation.isEmpty(mobileNo)
            ? moderateScale(14)
            : moderateScale(16),
        }}
        placeholder={Strings.entMobileNo}
        value={mobileNo}
        container={
          inputFocus == Strings.entMobileNo
            ? {borderColor: colors.primary_color}
            : null
        }
        onFocus={() => {
          setInputFocus(Strings.entMobileNo);
        }}
        onBlur={() => {
          setInputFocus('');
        }}
        keyboardType="numeric"
        onChangeText={text => setMobileNo(text)}
        onSubmitEditing={() => {
          emailRef.current.focus();
        }}
        inputRef={mobileNoRef}
        returnKeyType={Platform.OS == 'ios' ? 'done' : 'next'}
        leftCustomIcon={LeftCustomIcon()}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        blurOnSubmit={false}
        inputTxtStyl={{
          color: Validation.isEmpty(email)
            ? colors.darkGreyishNavy2
            : colors.darkGreyishNavy,
          fontSize: Validation.isEmpty(email)
            ? moderateScale(14)
            : moderateScale(16),
        }}
        placeholder={Strings.entEmail}
        value={email}
        container={
          inputFocus == Strings.entEmail
            ? {borderColor: colors.primary_color}
            : null
        }
        onFocus={() => {
          setInputFocus(Strings.entEmail);
        }}
        onBlur={() => {
          setInputFocus('');
        }}
        keyboardType="email-address"
        onChangeText={text => setEmail(text)}
        onSubmitEditing={() => {
          Validation.isEmpty(route.params?.type)
            ? passwordRef.current.focus()
            : checkValidation();
        }}
        inputRef={emailRef}
        returnKeyType={Validation.isEmpty(route.params?.type) ? 'next' : 'done'}
      />
      {Validation.isEmpty(route.params?.type) ? (
        <View>
          <View style={styles.heightBox} />
          <View style={styles.heightBox} />
          <TextInputComponent
            blurOnSubmit={false}
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
            secureTextEntry={passSecure}
            onRightIconPress={() => setPassSecure(!passSecure)}
            rightIcon={!passSecure ? ImageView.hide : ImageView.show}
            onSubmitEditing={() => {
              cPasswordRef.current.focus();
            }}
            returnKeyType={'next'}
          />
          <View style={styles.heightBox} />
          <View style={styles.heightBox} />
          <TextInputComponent
            blurOnSubmit={false}
            inputTxtStyl={{
              color: Validation.isEmpty(cPassword)
                ? colors.darkGreyishNavy2
                : colors.darkGreyishNavy,
              fontSize: Validation.isEmpty(cPassword)
                ? moderateScale(14)
                : moderateScale(16),
            }}
            placeholder={Strings.entCPassword}
            value={cPassword}
            container={
              inputFocus == Strings.entCPassword
                ? {borderColor: colors.primary_color}
                : null
            }
            onFocus={() => {
              setInputFocus(Strings.entCPassword);
            }}
            onBlur={() => {
              setInputFocus('');
            }}
            onChangeText={text => setCPassword(text)}
            onSubmitEditing={() => {
              checkValidation();
            }}
            inputRef={cPasswordRef}
            secureTextEntry={cPassSecure}
            onRightIconPress={() => setCPassSecure(!cPassSecure)}
            rightIcon={!cPassSecure ? ImageView.hide : ImageView.show}
          />
        </View>
      ) : null}
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <ButtonComponent
        onBtnPress={() => {
          checkValidation();
        }}
        btnLabel={Strings.signUp}
      />
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          navigation.replace('Login');
        }}
        style={styles.forgotPassContainer}>
        <Text
          style={[
            styles.forgotTxt,
            {
              textDecorationLine: 'underline',
            },
          ]}>
          {Strings.orLogin}
        </Text>
      </Pressable>
    </View>
  );

  const LeftCustomIcon = useCallback(
    () => (
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setShowCountryPicker(true);
        }}
        style={styles.customIconContainer}>
        <View style={styles.flagContainer}>
          <CountryFlag
            style={{
              borderRadius: 3,
            }}
            isoCode={countrySelectedFalg}
            size={15}
          />
        </View>
        <Text style={{marginHorizontal: scale(5)}}>{countryCode}</Text>
        <Image
          resizeMode="contain"
          style={styles.downArrowIcon}
          source={ImageView.downArrow}
        />
      </Pressable>
    ),
    [countryCode, countrySelectedFalg],
  );

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <SafeAreaView style={{flex: 0, backgroundColor: colors.primary_color}} />
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
        <CountryPicker
          enableModalAvoiding
          show={showCountryPicker}
          onBackdropPress={() => {
            setShowCountryPicker(false);
          }}
          onRequestClose={() => {
            setShowCountryPicker(false);
          }}
          pickerButtonOnPress={item => onSelect(item)}
          style={{
            // Styles for whole modal [View]
            modal: {
              height: verticalScale(300),
            },
            // Styles for modal backdrop [View]
            backdrop: {},
            // Styles for bottom input line [View]
            line: {},
            // Styles for list of countries [FlatList]
            itemsList: {},
            // Styles for input [TextInput]
            textInput: {
              height: scale(50),
              borderRadius: 10,
              paddingHorizontal: scale(25),
            },
            // Styles for country button [TouchableOpacity]
            countryButtonStyles: {
              height: scale(50),
              borderRadius: 10,
            },
            // Styles for search message [Text]
            searchMessageText: {},
            // Styles for search message container [View]
            countryMessageContainer: {},
            // Flag styles [Text]
            flag: {},
            // Dial code styles [Text]
            dialCode: {
              fontSize: scale(13),
              fontFamily: appFonts.interRegular,
            },
            // Country name styles [Text]
            countryName: {
              fontSize: scale(13),
              fontFamily: appFonts.interRegular,
            },
          }}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          bounces={false}
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}>
          {ImageCurveView()}
          {UserActionView()}
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
    width: scale(120),
    height: scale(120),
  },
  flagIcon: {
    width: scale(15),
    height: scale(15),
  },
  downArrowIcon: {
    width: scale(10),
    height: scale(10),
  },
  heightBox: {
    marginVertical: scale(4),
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
  userActionContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: scale(60),
  },
  fLNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  socialIcon: {
    width: scale(20),
    height: scale(20),
    marginEnd: scale(10),
  },
  socialTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayMedium,
    color: colors.white,
  },
  customIconContainer: {
    marginEnd: scale(10),
    borderRightWidth: 1,
    borderRightColor: '#0000001A',
    height: scale(25),
    alignItems: 'center',
    paddingEnd: scale(10),
    flexDirection: 'row',
  },
  flagContainer: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 8,
    borderRadius: 3,
  },
});

export default CreateAccount;
