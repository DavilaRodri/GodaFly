import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import {Switch} from 'react-native-paper';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useBackHandler} from '@react-native-community/hooks';
import {LoginManager} from 'react-native-fbsdk';

import {getServiceCall, postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys, keyPref} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import TextInputComponent from '../../components/TextInputComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {
  colors,
  config,
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import {Strings} from '../../utils/strings';
import appFonts from '../../utils/appFonts';

var changeToggle = false;
const Settings = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [notificationSwitch, setNotificationSwitch] = useState(
    route.params?.userProfileData?.is_notification == 0 ? false : true,
  );
  const [showAccountContentType, setShowAccountContentType] = useState('');

  const refRBSheet = useRef();

  useEffect(() => {
    changeToggle = false;
  }, []);

  const logoutDeleteApiCall = async () => {
    getServiceCall(getDynamicEndpoint(), '')
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          showSuccessMessage(res?.message);
          logoutHandler();
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

  const updateNotificationStatusApiCall = async () => {
    onToggleSwitch();
    var data = new FormData();
    data.append(ApiKeys.STATUS, notificationSwitch ? 0 : 1);

    postServiceCall(ApiEndpoint.UPDATE_NOTIFICATION_STATUS, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
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

  const getDynamicEndpoint = () => {
    switch (showAccountContentType) {
      case 'logout':
        return ApiEndpoint.USER_LOGOUT;
      case 'delete':
        return ApiEndpoint.USER_DELETE;
    }
  };

  useBackHandler(() => {
    if (changeToggle) route.params?.goBackHandler();
    navigation.goBack();
    return true;
  });

  const onToggleSwitch = () => {
    changeToggle = true;
    setNotificationSwitch(!notificationSwitch);
  };

  const logoutHandler = async () => {
    const getUserData = await config.getUserData();
    switch (getUserData?.authType) {
      case 'facebook':
        try {
          await LoginManager.logOut();
        } catch (error) {
          console.error(error);
        }
        break;
    }
    await AsyncStorage.removeItem(keyPref.USER_DATA);
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }, 500);
  };

  const RightCustomIcon = () => (
    <View
      style={{
        alignItems: 'flex-end',
        justifyContent: 'center',
        flex: 0.2,
      }}>
      <Switch
        trackColor={{true: colors.primary_color, false: colors.gray85}}
        thumbColor={colors.white}
        value={notificationSwitch}
        onValueChange={() => updateNotificationStatusApiCall()}
      />
    </View>
  );

  const SettingsListView = () => (
    <View style={{flex: 1, padding: scale(20)}}>
      <TextInputComponent
        rightIcon={ImageView.dropDown}
        onPress={() => {
          navigation.navigate('ChangePassword');
        }}
        onRightIconPress={() => {
          navigation.navigate('ChangePassword');
        }}
        rightIconStyl={{transform: [{rotate: '-90deg'}]}}
        leftIcon={ImageView.lock}
        editable={false}
        inputTxtStyl={styles.inputTxtStyl}
        value={Strings.cPassword}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        inputTextContainer={{flex: 0.65}}
        rightCustomIcon={RightCustomIcon()}
        leftIcon={ImageView.notificationSettings}
        editable={false}
        inputTxtStyl={styles.inputTxtStyl}
        value={Strings.notification}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        onPress={() => {
          setShowAccountContentType('logout');
          refRBSheet.current.open();
        }}
        leftIcon={ImageView.logout}
        editable={false}
        inputTxtStyl={styles.inputTxtStyl}
        value={Strings.logout}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        onPress={() => {
          setShowAccountContentType('delete');
          refRBSheet.current.open();
        }}
        leftIcon={ImageView.deleteAccount}
        editable={false}
        inputTxtStyl={styles.inputTxtStyl}
        value={Strings.deleteAccount}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIcon={ImageView.backIcon}
        leftIconPress={() => {
          if (changeToggle) route.params?.goBackHandler();
          navigation.goBack();
        }}
        centerTxt={Strings.settings}
      />
      <RBSheet
        ref={refRBSheet}
        height={verticalScale(200)}
        keyboardAvoidingViewEnabled={true}
        dragFromTopOnly
        closeOnDragDown
        openDuration={250}
        customStyles={{
          container: {
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
          },
          draggableIcon: {
            backgroundColor: colors.gray85,
            height: 3,
            width: scale(60),
          },
        }}>
        <ConfirmationPopupComponent
          postiveBtnPress={() => {
            refRBSheet.current.close();
            setTimeout(() => {
              setLoading(() => true, logoutDeleteApiCall());
            }, 500);
          }}
          nagetiveBtnPress={() => {
            refRBSheet.current.close();
          }}
          titleMessage={
            showAccountContentType == 'logout'
              ? Strings.logoutAccountMsg
              : Strings.deleteAccountMsg
          }
        />
      </RBSheet>
      {SettingsListView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
    paddingBottom: scale(55),
  },
  heightBox: {
    marginVertical: scale(4),
  },
  inputTxtStyl: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(15),
  },
});

export default Settings;
