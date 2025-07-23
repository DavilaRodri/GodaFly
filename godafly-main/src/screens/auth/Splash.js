import React, {useEffect} from 'react';
import {
  StyleSheet,
  PermissionsAndroid,
  StatusBar,
  ImageBackground,
} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import {moderateScale} from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';

import {colors, config, logDisplay} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import {keyPref} from '../../service/ApiKeys';
import appFonts from '../../utils/appFonts';
import {events} from '../../App';

const Splash = ({navigation}) => {
  useEffect(() => {
    setTimeout(async () => {
      const getUserData = await config.getUserData();
      const token = getUserData?.token ?? null;
      if (getUserData?.is_complete_profile == 0) {
        navigation.replace('SetupProfile');
      } else {
        navigation.replace(token != null ? 'Home' : 'Login');
      }
    }, 3000);
    pushNotificationPermission();
    notificationGetStatusWatcher();
  }, []);

  const pushNotificationPermission = async () => {
    try {
      requestUserPermission();
    } catch (error) {
      logDisplay('ERROR: ' + error);
    }
  };

  const requestUserPermission = async () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    var token = await AsyncStorage.getItem(keyPref.FCM_TOKEN);
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      if (token == null) getFCMToken();
    } else {
      console.log('Please enable Permision');
    }
  };

  const getFCMToken = async () => {
    messaging()
      .getToken()
      .then(async token => {
        logDisplay('FCM TOKEN: ', token);
        await AsyncStorage.setItem(keyPref.FCM_TOKEN, token);
      });
  };

  const notificationGetStatusWatcher = () => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          setTimeout(() => {
            config.notificationNavigationHandler(
              remoteMessage?.data,
              navigation,
            );
          }, 3000);
          logDisplay('>>>>>>>>> GET INITIAL NOTIFICATON ', remoteMessage);
        }
      });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage) {
        config.notificationNavigationHandler(remoteMessage?.data, navigation);
        logDisplay('>>>>>>>>> ON NOTIFICATON TAP AND OPEN APP ', remoteMessage);
      }
    });

    messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        logDisplay('>>>>>>>>> GET FOREGROUND NOTIFICATON ', remoteMessage);
        if (global.activeRouteName == 'chatHistory') {
          events.emit('receivedChatHistory');
        } else {
          showMessage({
            message: remoteMessage?.data?.push_title,
            description: remoteMessage?.data?.body,
            animated: true,
            floating: true,
            position: 'top',
            type: 'success',
            autoHide: true,
            hideOnPress: true,
            duration: 5000,
            onPress: () => {
              config.notificationNavigationHandler(
                remoteMessage?.data,
                navigation,
              );
            },
            backgroundColor: colors.white,
            titleStyle: {
              fontFamily: appFonts.ralewayBold,
              fontSize: moderateScale(15),
            },
            color: colors.primary_color,
          });
        }
      }
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      logDisplay('>>>>>>>>> NOTIFICATON HANDLE IN BACKGROUND ', remoteMessage);
    });
  };

  return (
    <ImageBackground source={ImageView.splashImg} style={styles.container}>
      <StatusBar translucent backgroundColor={colors.transparent} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary_color,
  },
  centerAppIcon: {
    width: '100%',
    height: '100%',
  },
});

export default Splash;
