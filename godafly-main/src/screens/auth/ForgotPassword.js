import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Keyboard,
  Image,
  Pressable,
  ImageBackground,
  SafeAreaView,
} from 'react-native';

import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

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

const ForgotPassword = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [inputFocus, setInputFocus] = useState('');

  const forgotPasswordApiCall = async () => {
    const data = new FormData();
    data.append(ApiKeys.EMAIL, email);

    postServiceCall(ApiEndpoint.FORGOT_PASSWORD, data, true)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          showSuccessMessage(res?.message);
          navigation.goBack();
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
    navigation.goBack();
    return true;
  });

  const checkValidation = () => {
    Keyboard.dismiss();
    switch (true) {
      case Validation.isEmpty(email.trim()):
        showErrorMessage(Strings.plsEnterEmail);
        break;
      case !Validation.validEmail(email):
        showErrorMessage(Strings.plsEnterValidEmail);
        break;
      default:
        setLoading(() => true, forgotPasswordApiCall());
        break;
    }
  };

  const ImageCurveView = () => (
    <ImageBackground
      resizeMode="stretch"
      style={{height: verticalScale(260)}}
      source={ImageView.curveImg}
      imageStyle={{width: '100%', height: '100%'}}>
      <Pressable
        style={styles.backIconContainer}
        onPress={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}>
        <Image
          resizeMode="contain"
          style={styles.backIcon}
          source={ImageView.backIcon}
        />
      </Pressable>
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
          paddingVertical: scale(30),
          paddingHorizontal: scale(30),
        }}>
        <Image
          resizeMode="contain"
          style={styles.pageHeadeImg}
          source={ImageView.forgotPass}
        />
        <Text style={styles.signInTxt}>{Strings.forgotPassword}</Text>
        <View style={styles.heightBox} />
        <Text style={styles.signInMsgTxt}>{Strings.forgotPasswordMsg}</Text>
      </View>
    </ImageBackground>
  );

  const UserActionView = () => (
    <View style={styles.userActionContainer}>
      <TextInputComponent
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
          checkValidation();
        }}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <ButtonComponent
        onBtnPress={() => {
          checkValidation();
        }}
        btnLabel={Strings.send}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <SafeAreaView style={{flex: 0, backgroundColor: colors.primary_color}} />
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
        <KeyboardAwareScrollView
          style={styles.container}
          bounces={false}
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
    width: scale(150),
    height: scale(150),
  },
  backIconContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 1,
    left: 20,
    padding: scale(2),
  },
  backIcon: {
    width: scale(30),
    height: scale(30),
  },
  pageHeadeImg: {
    width: scale(80),
    height: scale(80),
  },
  heightBox: {
    marginVertical: scale(4),
  },
  userActionContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    marginTop: scale(150),
    marginBottom: scale(20),
  },
  signInTxt: {
    fontSize: moderateScale(24),
    fontFamily: appFonts.ralewayBold,
    textAlign: 'center',
    color: colors.darkBlue,
    marginTop: scale(10),
  },
  signInMsgTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayRegular,
    textAlign: 'center',
    color: colors.suvaGrey,
    lineHeight: scale(20),
  },
});

export default ForgotPassword;
