import {showMessage, hideMessage} from 'react-native-flash-message';
import appFonts from './appFonts';
import {moderateScale, scale} from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {keyPref} from '../service/ApiKeys';
import moment from 'moment';

export const showErrorMessage = message => {
  showMessage({
    message: message,
    type: 'error',
    backgroundColor: colors.suvaGrey,
    titleStyle: {
      fontFamily: appFonts.ralewayBold,
      fontSize: moderateScale(15),
    },
    color: colors.white,
  });
};

// For common log display function
export const logDisplay = function (key, value) {
  let isLog = true;
  if (isLog) {
    return console.log(key, value);
  }
  return null;
};

export const showSuccessMessage = message => {
  showMessage({
    message: message,
    type: 'success',
    backgroundColor: colors.primary_color,
    titleStyle: {
      fontFamily: appFonts.ralewayBold,
      fontSize: moderateScale(15),
    },
    color: colors.white,
  });
};

//API Base URL
export const API_URL =
  'https://us-west-2.aws.realm.mongodb.com/api/client/v2.0/app/graphqlgateway-jyavr/graphql';
export const API_KEY =
  '2Bt5eopsNUtKQ3DoYZUC95k3LgrAnmIsUXAtNEqMQFqRM50Y96oYyFM0qoOv43UT';
export const API_URL1 =
  'https://us-central1-merakulus-332f3.cloudfunctions.net/';
export const template_discription =
  'We created a unique lifestyle template based on your your interests, needs and goals. Your guided shopping experience is based on this. You can change or create a new one anytime.';

//API End Points
export const api = {
  //API_URL
  LOGIN: `${API_URL}/api/dsa/free/login`,
};
export const POPUP_TYPE = {
  SUCCESS: 'SUCCESS',
  CONFIRM: 'CONFIRM',
};

export const colors = {
  transparent: 'transparent',
  primary_color: '#25D097',
  senderBgColor: 'rgba(37,208,151,0.1)',
  white: '#FFFFFF',
  receiverBgColor: 'rgba(43,58,66,0.1)',
  goldenPoppy: '#FFC200',
  btnShadowClr: '#3F5765',
  appBGColor: '#FAFAFA',
  black: '#000000',
  fbColor: '#3B5998',
  darkBlue: '#2B3A42',
  suvaGrey: '#909090 ',
  darkGreyishNavy: '#222939',
  darkGreyishNavy2: '#22293A',
  pattensBlue: '#CCE9DF',
  whiteSmoke: '#EFEFEF',
  lightGrayishBlue: '#F2F3F8',
  azureishWhite: '#E1E4F4',
  gray85: '#D9D9D9',
  inActiveTab: '#A6A6A6',
  suvaGrey: '#8E8E8E',
  whisper: '#E7E7E7',
  lightRed: '#F6F6F6',
  veryDark: '#130F26',
  midnight: '#070D1E',
  darkGray: '#A9A9A9',
  separator: '#D7D7D7',
  grey: '#868686',
  myrtle: '#0F0A22',
  gray81: '#CFCFCF',
  springRain: '#AAA6B9',
};

export const config = {
  ANDROID_PACKAGE_NAME: 'com.app.godafly',
  IOS_APP_ID: '9ZR77KRSWG', 
  CHAT_TYPE: 'message',
  FLIGHT_NUMBER_MASKED: [
    /[A-Za-z0-9]/,
    /[A-Za-z0-9]/,
    ' ',
    '-',
    ' ',
    /[A-Za-z 0-9]/,
    /[A-Za-z0-9]/,
    /[A-Za-z0-9]/,
    /[A-Za-z0-9]/,
    /[A-Za-z0-9]/,
    /[A-Za-z0-9]/,
  ],
  PROFILE_IMG_LIST: [
    {
      id: 1,
      imgMultiPartData: null,
      imgUrl: '',
      imgUploaded: false,
    },
    {
      id: 2,
      imgMultiPartData: null,
      imgUrl: '',
      imgUploaded: false,
    },
    {
      id: 3,
      imgMultiPartData: null,
      imgUrl: '',
      imgUploaded: false,
    },
    {
      id: 4,
      imgMultiPartData: null,
      imgUrl: '',
      imgUploaded: false,
    },
    {
      id: 5,
      imgMultiPartData: null,
      imgUrl: '',
      imgUploaded: false,
    },
    {
      id: 6,
      imgMultiPartData: null,
      imgUrl: '',
      imgUploaded: false,
    },
  ],
  DOB_FORMAT: 'DD, MMM YYYY',
  CHAT_DATE_FORMAT: 'D MMM YYYY',
  TIME_FORMAT: 'hh:mm A',
  BACKEND_TIME_FORMAT: 'HH:mm',
  BACKEND_DATE_FORMAT: 'YYYY-MM-DD',
  commonDateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  getTimesagoUTCtoLocal: dateTime => {
    const getTimesAgo = moment
      .utc(dateTime)
      .local()
      .startOf('seconds')
      .fromNow();
    return getTimesAgo;
  },
  notificationNavigationHandler: (item, navigation) => {
    global.pushType = item?.push_type;
    switch (item?.push_type + '') {
      case '1':
        navigation.navigate('Chat');
        break;
      case '2':
        navigation.navigate('Chat');
        break;
      case '3':
        navigation.navigate('ChatHistory', {
          threadData: item,
          type: 'N',
        });
        break;
    }
  },
  getUserData: async () => {
    let getData = await AsyncStorage.getItem(keyPref.USER_DATA);
    // logDisplay('>>>>>>>>> USER LOGIN DATA ', getData);
    return JSON.parse(getData);
  },
  getDobYears: dob => {
    const dobYear = moment().diff(
      config.convertUTCToLocal(
        dob,
        config.BACKEND_DATE_FORMAT,
        config.BACKEND_DATE_FORMAT,
      ),
      'years',
    );
    return dobYear;
  },
  convertUTCToLocal: (dateTime, passFormat, getBackFormat) => {
    // logDisplay('>>>>>> DATE TIME WITH FORMAT ', dateTime + ' ' + passFormat); // 2015-09-13 03:39:27
    var utcDate = moment
      .utc(dateTime, passFormat)
      .format(config.commonDateTimeFormat);
    var stillUtc = moment.utc(utcDate).toDate();
    // logDisplay('>>>>>> UTC ', stillUtc); // 2015-09-13 09:39:27
    var local = moment(stillUtc).local().format(config.commonDateTimeFormat);
    // logDisplay('>>>>>> LOCAL ', local); // 2015-09-13 09:39:27
    const convertedDateTime = moment(local).format(getBackFormat);
    // logDisplay('>>>>>> CONVERT DATE OR TIME ', convertedDateTime); // 2015-09-13 09:39:27
    return convertedDateTime;
  },
  convertLocalToUTC: (dateTime, passFormat, getBackFormat) => {
    // logDisplay('>>>>>> DATE TIME WITH FORMAT ', dateTime + ' ' + passFormat); // 2015-09-13 03:39:27
    const UTCDateTime = moment(dateTime, passFormat)
      .utc()
      .format(config.commonDateTimeFormat);
    // logDisplay('>>>>>> UTC ', UTCDateTime); // 2015-09-13 09:39:27
    const convertedDateTime = moment(UTCDateTime).format(getBackFormat);
    // logDisplay('>>>>>> CONVERTED UTC DATE TIME FORMATE ', convertedDateTime); // 2015-09-13 09:39:27
    return convertedDateTime;
  },
};

export default {
  colors,
  config,
};
