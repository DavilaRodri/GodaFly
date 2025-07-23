import React, {useState, useRef} from 'react';
import {StyleSheet, View, Keyboard} from 'react-native';

import {moderateScale, scale} from 'react-native-size-matters';

import HeaderComponent from '../../components/HeaderComponent';
import TextInputComponent from '../../components/TextInputComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

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

const ChangePassword = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passSecure, setPassSecure] = useState(true);
  const [nPassword, setNPassword] = useState('');
  const [nPassSecure, setNPassSecure] = useState(true);
  const [cPassword, setCPassword] = useState('');
  const [cPassSecure, setCPassSecure] = useState(true);
  const [inputFocus, setInputFocus] = useState('');

  const nPasswordRef = useRef('');
  const cPasswordRef = useRef('');

  const changePasswordApiCall = async () => {
    const data = new FormData();
    data.append(ApiKeys.O_PASSWORD, password);
    data.append(ApiKeys.N_PASSWORD, nPassword);
    data.append(ApiKeys.C_PASSWORD, cPassword);

    postServiceCall(ApiEndpoint.CHANGE_PASSWORD, data)
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
      case Validation.isEmpty(password.trim()):
        showErrorMessage(Strings.plsEnterOldPassword);
        break;
      case Validation.isEmpty(nPassword.trim()):
        showErrorMessage(Strings.plsEnterNewPassword);
        break;
      case Validation.isEmpty(cPassword.trim()):
        showErrorMessage(Strings.plsEnterCPassword);
        break;
      case cPassword !== nPassword:
        showErrorMessage(Strings.doesNotMatchPassword);
        break;
      default:
        setLoading(() => true, changePasswordApiCall());
        break;
    }
  };

  const ChangePasswordListView = () => (
    <View style={{flex: 1, paddingBottom: scale(55), padding: scale(20)}}>
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
        placeholder={Strings.entCurrentPassword}
        value={password}
        container={
          inputFocus == Strings.entCurrentPassword
            ? {borderColor: colors.primary_color}
            : null
        }
        onFocus={() => {
          setInputFocus(Strings.entCurrentPassword);
        }}
        onBlur={() => {
          setInputFocus('');
        }}
        onChangeText={text => setPassword(text)}
        secureTextEntry={passSecure}
        onRightIconPress={() => setPassSecure(!passSecure)}
        rightIcon={!passSecure ? ImageView.hide : ImageView.show}
        onSubmitEditing={() => {
          nPasswordRef.current.focus();
        }}
        returnKeyType={'next'}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        blurOnSubmit={false}
        inputTxtStyl={{
          color: Validation.isEmpty(nPassword)
            ? colors.darkGreyishNavy2
            : colors.darkGreyishNavy,
          fontSize: Validation.isEmpty(nPassword)
            ? moderateScale(14)
            : moderateScale(16),
        }}
        placeholder={Strings.entNewPassword}
        value={nPassword}
        container={
          inputFocus == Strings.entNewPassword
            ? {borderColor: colors.primary_color}
            : null
        }
        onFocus={() => {
          setInputFocus(Strings.entNewPassword);
        }}
        onBlur={() => {
          setInputFocus('');
        }}
        onChangeText={text => setNPassword(text)}
        secureTextEntry={nPassSecure}
        onRightIconPress={() => setNPassSecure(!nPassSecure)}
        rightIcon={!nPassSecure ? ImageView.hide : ImageView.show}
        onSubmitEditing={() => {
          cPasswordRef.current.focus();
        }}
        inputRef={nPasswordRef}
        returnKeyType={'next'}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
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
        secureTextEntry={cPassSecure}
        onRightIconPress={() => setCPassSecure(!cPassSecure)}
        rightIcon={!cPassSecure ? ImageView.hide : ImageView.show}
        onSubmitEditing={() => {
          checkValidation();
        }}
        inputRef={cPasswordRef}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <ButtonComponent
        container={{backgroundColor: colors.darkBlue}}
        btnLabelTxt={{color: colors.white}}
        onBtnPress={() => {
          checkValidation();
        }}
        btnLabel={Strings.cPassword}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIcon={ImageView.backIcon}
        leftIconPress={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}
        centerTxt={Strings.cPassword}
      />
      <KeyboardAwareScrollView
        style={styles.container}
        bounces={false}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        {ChangePasswordListView()}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
  },
  heightBox: {
    marginVertical: scale(4),
  },
  inputTxtStyl: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(15),
  },
});

export default ChangePassword;
