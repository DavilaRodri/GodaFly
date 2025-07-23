import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Keyboard,
  Image,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
} from 'react-native';

import {Avatar} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import {getBottomInset} from 'rn-iphone-helper';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import TextInputComponent from '../../components/TextInputComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';
import ButtonComponent from '../../components/ButtonComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, showErrorMessage} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import appFonts from '../../utils/appFonts';
import {Strings} from '../../utils/strings';
import Validation from '../../utils/validation';
import {config} from './../../utils/constants';
import {events} from '../../App';

var offset = 0;
var focusInput = false;

const ChatHistory = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [seletedType, setSeletedType] = useState('');
  const [chatHistoryData, setChatHistoryData] = useState([]);
  const [message, setMessage] = useState('');
  const [desc, setDesc] = useState('');
  const [userDetail, setUserDetail] = useState(null);
  const [firstLayout, setFirstLayout] = useState(true);
  const [disableSendBtn, setDisableSendBtn] = useState(false);

  const refRBSheet = useRef();
  const refRBReportSheet = useRef();
  const chatHistoryListRef = useRef();

  useEffect(() => {
    offset = 0;
    events.on('receivedChatHistory', eventsHandler);
    () => {
      events.removeListener('receivedChatHistory', eventsHandler);
    };
  }, []);

  // scroll to the bottom of the list whenever the chat history changes, but only after the first layout
  useEffect(() => {
    if (!firstLayout) {
      chatHistoryListRef.current.scrollToEnd();
    }
  }, [firstLayout]);

  useFocusEffect(
    useCallback(() => {
      global.activeRouteName = 'chatHistory';
      getChatHistoryApiCall();
    }, []),
  );

  const eventsHandler = () => {
    getChatHistoryApiCall('stopScroll');
  };

  const getChatHistoryApiCall = async (type = '') => {
    const data = new FormData();
    data.append(
      ApiKeys.T_ID,
      route.params?.type == 'OP'
        ? route.params?.threadData?.thread_id
        : route.params?.type == 'N'
        ? route.params?.threadData?.object_id
        : route.params?.threadData?.id,
    );

    postServiceCall(ApiEndpoint.CHAT_HISTORY, data)
      .then(async response => {
        const res = response;
        const responseData = Validation.isEmptyValue(res?.data, 'arr');
        if (res?.status == 200) {
          setChatHistoryData(responseData);
          setUserDetail(res?.user_detail);
        }
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
      });
  };

  const sendChatApiCall = async () => {
    temporarySendMessageHandler();
    const data = new FormData();
    data.append(ApiKeys.T_USER_ID, userDetail?.id);
    data.append(ApiKeys.TYPE, config.CHAT_TYPE);
    data.append(ApiKeys.MESSAGE, message);

    postServiceCall(ApiEndpoint.SEND_CHAT, data)
      .then(async response => {
        const res = response;
        const responseData = Validation.isEmptyValue(res?.data, 'arr');
        if (res?.status == 200) {
          getChatHistoryApiCall();
          if (!Validation.isEmpty(responseData)) {
            // chatHistoryListRef?.current.scrollToIndex({
            //   animated: true,
            //   index: responseData.length - 1,
            // });
          }
        }
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
      });
  };

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const temporarySendMessageHandler = () => {
    const tempData = [...chatHistoryData];
    const getLastMessageListLength =
      tempData[tempData.length - 1]?.all_message?.length;

    if (
      getLastMessageListLength == 0 ||
      getLastMessageListLength == undefined
    ) {
      tempData.push({
        created_at: moment(),
        all_message: [
          {
            id: Math.random() + new Date().getTime(),
            sender_id: userDetail?.id + 1,
            message: message,
            created_at: moment(),
          },
        ],
      });
    } else if (
      moment(tempData[tempData.length - 1]?.created_at).format(
        config.CHAT_DATE_FORMAT,
      ) != moment().format(config.CHAT_DATE_FORMAT)
    ) {
      tempData.push({
        created_at: moment(),
        all_message: [
          {
            id: Math.random() + new Date().getTime(),
            sender_id: userDetail?.id + 1,
            message: message,
            created_at: moment(),
          },
        ],
      });
    } else {
      tempData[tempData.length - 1]?.all_message.push({
        id: Math.random() + new Date().getTime(),
        sender_id: userDetail?.id + 1,
        message: message,
        created_at: moment(),
      });
    }
    setChatHistoryData(tempData);
    setMessage('');
  };

  const deleteChatHistoryApiCall = async () => {
    const data = new FormData();
    data.append(
      ApiKeys.T_ID,
      route.params?.type == 'OP'
        ? route.params?.threadData?.thread_id
        : route.params?.type == 'N'
        ? route.params?.threadData?.object_id
        : route.params?.threadData?.id,
    );

    postServiceCall(ApiEndpoint.DELETE_CHAT_THREAD, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          getChatHistoryApiCall();
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

  const reportUserApiCall = async () => {
    const data = new FormData();
    data.append(ApiKeys.BLOCK_U_ID, userDetail?.id);
    data.append(ApiKeys.REASON, getDynamicReasonType());
    data.append(ApiKeys.DESC, desc);

    postServiceCall(ApiEndpoint.REPORT_USER, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          setSeletedType('');
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

  const getDynamicReasonType = () => {
    switch (seletedType) {
      case '1':
        return 'Spam account';
      case '2':
        return 'Bullying or harassment';
      case '3':
        return 'False information';
      case '4':
        return 'Other';
    }
  };

  const CenterCustomComponent = () => (
    <Pressable
      onPress={() => {
        Keyboard.dismiss();
        setShowPopup(false);
        navigation.navigate('OtherUserProfile', {
          userId: userDetail?.id,
        });
      }}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scale(10),
      }}>
      <Avatar.Image
        style={{backgroundColor: colors.pattensBlue}}
        size={40}
        source={{
          uri: userDetail?.profile_image,
        }}
      />
      <Text numberOfLines={1} style={styles.usernameTxt}>
        {userDetail?.first_name}
      </Text>
    </Pressable>
  );

  const PopupView = () => (
    <View style={styles.morePopupContianer}>
      <Pressable
        onPress={() => {
          setShowPopup(false);
          setTimeout(() => {
            refRBSheet.current.open();
          }, 200);
        }}
        style={styles.sectionContainer}>
        <Image
          resizeMode="contain"
          style={styles.popupIcon}
          source={ImageView.deleteChat}
        />
        <Text style={styles.popupTxt}>{'Delete chat'}</Text>
      </Pressable>
      <View style={styles.popupSeparator} />
      <Pressable
        onPress={() => {
          setShowPopup(false);
          setTimeout(() => {
            refRBReportSheet.current.open();
          }, 200);
        }}
        style={styles.sectionContainer}>
        <Image
          resizeMode="contain"
          style={styles.popupIcon}
          source={ImageView.report}
        />
        <Text style={styles.popupTxt}>{'Report'}</Text>
      </Pressable>
    </View>
  );

  const ReportReasonView = () => (
    <View style={{flex: 1, padding: scale(20)}}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitleTxt}>{Strings.reportReason}</Text>
      </View>
      <View style={{flex: 1}}>
        <TextInputComponent
          rightIcon={
            seletedType == '1'
              ? ImageView.roundDotChecked
              : ImageView.roundDotUnchecked
          }
          rightIconStyl={styles.rightIconStyl}
          onPress={() => {
            setSeletedType('1');
          }}
          editable={false}
          inputTxtStyl={styles.inputTxtStyl}
          value={Strings.spamAccount}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          rightIcon={
            seletedType == '2'
              ? ImageView.roundDotChecked
              : ImageView.roundDotUnchecked
          }
          rightIconStyl={styles.rightIconStyl}
          onPress={() => {
            setSeletedType('2');
          }}
          editable={false}
          inputTxtStyl={styles.inputTxtStyl}
          value={Strings.bullyingHarassment}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          rightIcon={
            seletedType == '3'
              ? ImageView.roundDotChecked
              : ImageView.roundDotUnchecked
          }
          rightIconStyl={styles.rightIconStyl}
          onPress={() => {
            setSeletedType('3');
          }}
          editable={false}
          inputTxtStyl={styles.inputTxtStyl}
          value={Strings.falseInformation}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          rightIcon={
            seletedType == '4'
              ? ImageView.roundDotChecked
              : ImageView.roundDotUnchecked
          }
          rightIconStyl={styles.rightIconStyl}
          onPress={() => {
            setSeletedType('4');
          }}
          editable={false}
          inputTxtStyl={styles.inputTxtStyl}
          value={Strings.other}
        />
        {seletedType == '4' ? (
          <>
            <View style={styles.heightBox} />
            <View style={styles.heightBox} />
            <TextInputComponent
              value={desc}
              onChangeText={text => setDesc(text)}
              textAlignVertical="top"
              placeholder={Strings.writeReportReason}
              multiline={true}
              inputTxtStyl={styles.reasonInputTxtStyl}
            />
          </>
        ) : null}
      </View>
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <ButtonComponent
        container={{backgroundColor: colors.darkBlue}}
        btnLabelTxt={{color: colors.white}}
        onBtnPress={() => {
          refRBReportSheet.current.close();
          setTimeout(() => {
            setLoading(() => true, reportUserApiCall());
          }, 500);
        }}
        btnLabel={Strings.submit}
      />
    </View>
  );

  const RightCustomIcon = () => (
    <Pressable
      disabled={disableSendBtn}
      onPress={() => {
        if (!disableSendBtn && !Validation.isEmpty(message)) {
          sendChatApiCall();
          setDisableSendBtn(true);
          setTimeout(() => {
            setDisableSendBtn(false);
          }, 1000);
        }
      }}
      style={styles.customIconContainer}>
      <Image
        resizeMode="contain"
        style={styles.sendIcon}
        source={ImageView.send}
      />
    </Pressable>
  );

  const ItemSeparatorComponent = () => (
    <View style={styles.separatorContainer} />
  );

  const ChatHistoryView = () => (
    <ScrollView
      ref={chatHistoryListRef}
      onContentSizeChange={() => {
        chatHistoryListRef.current.scrollToEnd();
      }}
      onScroll={event => {
        var currentOffset = event.nativeEvent.contentOffset.y;
        var direction = currentOffset > offset ? 'down' : 'up';
        offset = currentOffset;
        if (direction == 'up' && !focusInput) {
          Keyboard.dismiss();
        }
      }}
      onLayout={() => setFirstLayout(false)}
      style={styles.container}
      contentContainerStyle={{flexGrow: 1, paddingBottom: scale(100)}}
      // refreshControl={
      //   <RefreshControl
      //     refreshing={false}
      //     tintColor={colors.primary_color}
      //     progressBackgroundColor={colors.appBGColor}
      //     colors={[colors.primary_color]}
      //   />
      // }
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}>
      {chatHistoryData.map((item, index) => renderChatHistoryItem(item))}
    </ScrollView>
  );

  const ChatDateView = item => (
    <View style={styles.chatDateContainer}>
      <Text style={styles.chatDateTxt}>
        {config.convertUTCToLocal(
          item?.created_at,
          undefined,
          config.CHAT_DATE_FORMAT,
        )}
      </Text>
    </View>
  );

  const SenderChatView = item => (
    <View style={styles.senderContainer}>
      <View style={styles.senderMsgContainer}>
        <View style={styles.talkBubbleSenderTriangle} />
        <Text style={styles.senderMsgTxt}>{item?.message}</Text>
      </View>
      <View style={{alignSelf: 'flex-end'}}>
        <Text
          style={[
            styles.dateTxt,
            {
              textAlign: 'right',
            },
          ]}>
          {config.convertUTCToLocal(
            item?.created_at,
            undefined,
            config.TIME_FORMAT,
          )}
        </Text>
      </View>
    </View>
  );

  const ReceiverChatView = item => (
    <View style={styles.receiverContainer}>
      <View style={styles.receiverMsgContainer}>
        <View style={styles.talkBubbleTriangle} />
        <Text style={styles.receiverMsgTxt}>{item?.message}</Text>
      </View>
      <View style={{}}>
        <Text
          style={[
            styles.dateTxt,
            {
              textAlign: 'left',
            },
          ]}>
          {config.convertUTCToLocal(
            item?.created_at,
            undefined,
            config.TIME_FORMAT,
          )}
        </Text>
      </View>
    </View>
  );

  const renderChatHistoryItem = item => {
    return (
      <View>
        <FlatList
          contentContainerStyle={{
            paddingBottom: scale(0),
            padding: scale(20),
          }}
          initialNumToRender={item?.all_message.length}
          ListHeaderComponent={ChatDateView(item)}
          bounces={false}
          data={item?.all_message}
          ItemSeparatorComponent={ItemSeparatorComponent()}
          keyExtractor={item => item?.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderChatSubHistoryItem}
        />
      </View>
    );
  };

  const renderChatSubHistoryItem = ({item}) => {
    return (
      <View>
        {userDetail?.id != item?.sender_id
          ? SenderChatView(item)
          : ReceiverChatView(item)}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      behavior={Platform.OS == 'ios' ? 'height' : undefined}
      keyboardVerticalOffset={
        Platform.OS == 'ios' ? getBottomInset() + moderateScale(10) : 0
      }>
      <LoadingComponent isVisible={loading} />
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
              setLoading(() => true, deleteChatHistoryApiCall());
            }, 500);
          }}
          nagetiveBtnPress={() => {
            refRBSheet.current.close();
          }}
          titleMessage={Strings.deleteChatMsg}
        />
      </RBSheet>
      <RBSheet
        ref={refRBReportSheet}
        height={verticalScale(550)}
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
        <KeyboardAwareScrollView
          style={{flex: 1}}
          bounces={false}
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}>
          {ReportReasonView()}
        </KeyboardAwareScrollView>
      </RBSheet>
      <HeaderComponent
        leftIconPress={() => {
          Keyboard.dismiss();
          setShowPopup(false);
          navigation.goBack();
        }}
        rightIconPress={() => {
          Keyboard.dismiss();
          setShowPopup(!showPopup);
        }}
        leftIcon={ImageView.backIcon}
        rightIcon={ImageView.more}
        centerCustomComponent={CenterCustomComponent()}
      />
      {showPopup && PopupView()}

      {ChatHistoryView()}
      <View
        onTouchEndCapture={() => {
          setShowPopup(false);
        }}
        style={styles.writeMessageContainer}>
        <TextInputComponent
          onFocus={() => {
            focusInput = true;
            setTimeout(() => {
              chatHistoryListRef.current?.scrollToEnd();
            }, 100);
            setTimeout(() => {
              focusInput = false;
            }, 500);
          }}
          multiline={true}
          onSubmitEditing={() => {
            if (!disableSendBtn && !Validation.isEmpty(message)) {
              sendChatApiCall();
              setDisableSendBtn(true);
              setTimeout(() => {
                setDisableSendBtn(false);
              }, 1000);
            }
          }}
          KeyboardType={'done'}
          value={message}
          inputTxtStyl={{
            height: null,
            maxHeight: scale(60),
          }}
          onChangeText={text => setMessage(text)}
          rightCustomIcon={RightCustomIcon()}
          placeholder={Strings.writeYourMassage}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
  },
  morePopupContianer: {
    zIndex: 1,
    position: 'absolute',
    right: scale(20),
    top: scale(45),
    backgroundColor: colors.white,
    paddingVertical: scale(15),
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  sectionContainer: {
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    paddingVertical: scale(5),
    alignItems: 'center',
  },
  usernameTxt: {
    fontSize: moderateScale(18),
    fontFamily: appFonts.ralewayBold,
    color: colors.white,
    marginLeft: scale(10),
  },
  popupIcon: {
    width: scale(25),
    height: scale(25),
    marginEnd: scale(10),
  },
  popupSeparator: {
    height: 0.4,
    marginHorizontal: scale(10),
    backgroundColor: colors.gray81,
    marginVertical: scale(10),
  },
  popupTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayMedium,
    color: colors.myrtle,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: scale(20),
  },
  headerTitleTxt: {
    fontFamily: appFonts.ralewayBold,
    fontSize: moderateScale(18),
    textAlign: 'center',
    color: colors.black,
  },
  heightBox: {
    marginVertical: scale(4),
  },
  inputTxtStyl: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(14),
  },
  rightIconStyl: {
    width: scale(20),
    height: scale(20),
  },
  reasonInputTxtStyl: {
    height: scale(170),
    paddingVertical: scale(10),
  },
  customIconContainer: {
    flex: 0.15,
    justifyContent: 'center',
    backgroundColor: colors.darkBlue,
    borderRadius: 9,
    width: scale(40),
    height: scale(35),
    marginLeft: scale(10),
    alignItems: 'center',
  },
  sendIcon: {
    width: scale(15),
    height: scale(15),
  },
  separatorContainer: {
    marginVertical: scale(5),
  },
  chatDateContainer: {
    borderColor: '#00000033',
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(7),
    marginBottom: scale(15),
    paddingHorizontal: scale(15),
    borderRadius: 100,
  },
  chatDateTxt: {
    fontSize: moderateScale(12),
    fontFamily: appFonts.ralewayRegular,
    color: colors.black,
    opacity: 0.7,
    textAlign: 'center',
  },
  senderContainer: {
    alignSelf: 'flex-end',
    maxWidth: '70%',
  },
  senderMsgContainer: {
    borderRadius: 20,
    borderBottomEndRadius: 0,
    backgroundColor: colors.senderBgColor,
    padding: scale(20),
  },
  senderMsgTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayRegular,
    color: colors.black,
  },
  dateTxt: {
    fontSize: moderateScale(11),
    fontFamily: appFonts.ralewayRegular,
    color: colors.springRain,
    marginTop: scale(5),
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  receiverMsgContainer: {
    borderRadius: 20,
    borderBottomStartRadius: 0,
    backgroundColor: colors.receiverBgColor,
    padding: scale(20),
  },
  talkBubbleTriangle: {
    position: 'absolute',
    left: -scale(4),
    bottom: 0,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderTopWidth: scale(5),
    borderRightWidth: scale(4),
    borderRightColor: colors.receiverBgColor,
    borderBottomWidth: 0,
    zIndex: 1,
    borderBottomColor: 'transparent',
  },
  talkBubbleSenderTriangle: {
    position: 'absolute',
    right: -scale(7.5),
    bottom: 0,
    width: 0,
    zIndex: -10,
    height: 0,
    borderTopColor: 'transparent',
    borderTopWidth: scale(5),
    borderLeftWidth: scale(7),
    borderLeftColor: colors.senderBgColor,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  receiverMsgTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayRegular,
    color: colors.btnShadowClr,
  },
  writeMessageContainer: {
    position: 'absolute',
    right: 20,
    left: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatHistory;
