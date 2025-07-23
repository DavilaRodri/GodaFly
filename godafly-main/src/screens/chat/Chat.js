import React, {useCallback, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';

import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {SwipeListView} from 'react-native-swipe-list-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ActivityIndicator, Avatar} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import TopTabBarComponent from '../../components/TopTabBarComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';
import EmptyMessageComponent from '../../components/EmptyMessageComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, config, showErrorMessage} from '../../utils/constants';
import {Strings} from '../../utils/strings';
import {ImageView} from '../../utils/imageView';
import appFonts from '../../utils/appFonts';
import Validation from '../../utils/validation';

var limit = 10;
var offSet = 0;

const Chat = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [userdata, setUserdata] = useState(null);
  const [selectedTab, setSelectedTab] = useState(true);
  const [requestListData, setRequestListData] = useState([]);
  const [emptyRequestListData, setEmptyRequestListData] = useState(null);
  const [chatThreadsListData, setChatThreadsListData] = useState([]);
  const [emptyChatThreadsListData, setEmptyChatThreadsListData] =
    useState(null);
  const [loadmore, setLoadmore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteItem, setDeleteItem] = useState(null);

  const refRBSheet = useRef();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        global.activeRouteName = 'chat';
        offSet = 0;
        setSelectedTab(global.pushType == 1 ? false : true);
        global.pushType == 1
          ? setLoading(() => true, getRequestListApiCall('refresh'))
          : setLoading(() => true, getChatThreadsListApiCall('refresh'));
        global.pushType = null;
        const getUserData = await config.getUserData();
        setUserdata(getUserData);
      })();
    }, []),
  );

  const getRequestListApiCall = async (type = '') => {
    if (type == 'refresh') {
      offSet = 0;
      setRequestListData([]);
      setEmptyRequestListData(null);
    }
    const data = new FormData();
    data.append(ApiKeys.LIMIT, limit);
    data.append(ApiKeys.OFFSET, offSet);
    postServiceCall(ApiEndpoint.F_REQUEST_LIST, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoadmore(false);
          setLoading(false);
          setTotalCount(res?.total);
          const responseData = Validation.isEmptyValue(res?.data, 'arr');
          if (type == 'refresh') {
            setRequestListData(responseData);
            setEmptyRequestListData(
              !Validation.isEmpty(responseData) ? true : false,
            );
          } else {
            const mergeData = [...requestListData, ...responseData];
            setRequestListData(mergeData);
          }
        }
        setLoading(false);
        setLoadmore(false);
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
        setLoadmore(false);
      });
  };

  const getChatThreadsListApiCall = async (type = '') => {
    if (type == 'refresh') {
      offSet = 0;
      setChatThreadsListData([]);
      setEmptyChatThreadsListData(null);
    }
    const data = new FormData();
    data.append(ApiKeys.LIMIT, limit);
    data.append(ApiKeys.OFFSET, offSet);
    postServiceCall(ApiEndpoint.CHAT_THREADS, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoadmore(false);
          setLoading(false);
          setTotalCount(res?.total);
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          if (type == 'refresh') {
            responseData.map(obj => {
              obj.key = obj?.id;
            });
            setChatThreadsListData(responseData);
            setEmptyChatThreadsListData(
              !Validation.isEmpty(responseData) ? true : false,
            );
          } else {
            responseData.map(obj => {
              obj.key = obj?.id;
            });
            const mergeData = [...chatThreadsListData, ...responseData];
            setChatThreadsListData(mergeData);
          }
        }
        setLoading(false);
        setLoadmore(false);
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
        setLoadmore(false);
      });
  };

  const acepRejeReqApiCall = async (item, type) => {
    const data = new FormData();
    data.append(ApiKeys.ID, item?.id);
    data.append(ApiKeys.STATUS, type);
    postServiceCall(ApiEndpoint.A_R_F_REQUEST, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          const tempData = [...requestListData];
          const updatedData = tempData.filter(f => f?.id !== item?.id);
          setTotalCount(updatedData.length);
          setEmptyRequestListData(
            Validation.isEmpty(updatedData) ? true : false,
          );
          setRequestListData(updatedData);
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

  const deleteChatTradeApiCall = async () => {
    const data = new FormData();
    data.append(ApiKeys.T_ID, deleteItem?.id);

    postServiceCall(ApiEndpoint.DELETE_CHAT, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          const tempData = [...chatThreadsListData];
          const updatedData = tempData.filter(f => f?.id !== deleteItem?.id);
          setTotalCount(updatedData.length);
          setEmptyChatThreadsListData(
            Validation.isEmpty(updatedData) ? true : false,
          );
          setChatThreadsListData(updatedData);
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

  const loadmoreHandler = (type = '') => {
    offSet = offSet + limit;
    setLoadmore(
      () => true,
      type == 'threads'
        ? getChatThreadsListApiCall('loadMore')
        : getRequestListApiCall('loadMore'),
    );
  };

  const LoadmoreSpinner = () =>
    loadmore && (
      <View
        style={{
          height: scale(30),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator
          size="small"
          color={colors.primary_color}
          animating={loadmore}
        />
      </View>
    );

  const ChatsListView = () => (
    <View
      display={emptyChatThreadsListData == null ? 'none' : 'flex'}
      style={{
        flex: 1,
      }}>
      <SwipeListView
        useFlatList={true}
        initialNumToRender={chatThreadsListData.length}
        data={chatThreadsListData}
        contentContainerStyle={{
          paddingBottom: scale(30),
        }}
        renderItem={renderChatList}
        renderHiddenItem={renderDeleteChatComponent}
        ItemSeparatorComponent={() => (
          <View
            style={{
              backgroundColor: '#0000001F',
              marginVertical: scale(1),
              height: 1,
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={false}
            tintColor={colors.primary_color}
            progressBackgroundColor={colors.appBGColor}
            colors={[colors.primary_color]}
            onRefresh={() => {
              setTimeout(() => {
                setLoading(() => true, getChatThreadsListApiCall('refresh'));
              }, 200);
            }}
          />
        }
        disableRightSwipe
        stopRightSwipe={-scale(130)}
        rightOpenValue={-scale(130)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyMessageComponent />}
        ListFooterComponent={LoadmoreSpinner}
        onEndReachedThreshold={0.05}
        onEndReached={() =>
          totalCount != 0 &&
          chatThreadsListData.length < totalCount &&
          !loadmore &&
          loadmoreHandler('threads')
        }
      />
    </View>
  );

  const RequestListView = () => (
    <View
      display={emptyRequestListData == null ? 'none' : 'flex'}
      style={{
        flex: 1,
      }}>
      <FlatList
        data={requestListData}
        contentContainerStyle={{
          paddingBottom: scale(30),
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            tintColor={colors.primary_color}
            progressBackgroundColor={colors.appBGColor}
            colors={[colors.primary_color]}
            onRefresh={() => {
              setTimeout(() => {
                setLoading(() => true, getRequestListApiCall('refresh'));
              }, 200);
            }}
          />
        }
        renderItem={renderRequestList}
        ItemSeparatorComponent={() => (
          <View
            style={{
              backgroundColor: '#0000001F',
              marginVertical: scale(1),
              height: 2,
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyMessageComponent emptyLabel={Strings.noPendingReq} />
        }
        ListFooterComponent={LoadmoreSpinner}
        onEndReachedThreshold={0.05}
        onEndReached={
          totalCount != 0 &&
          requestListData.length < totalCount &&
          !loadmore &&
          loadmoreHandler
        }
      />
    </View>
  );

  const renderChatList = ({item, index}) => (
    <Pressable
      onPress={() => {
        navigation.navigate('ChatHistory', {threadData: item});
      }}
      style={styles.listItemContainer}>
      <View style={{flex: 0.22}}>
        <Avatar.Image
          style={{backgroundColor: colors.pattensBlue}}
          size={60}
          source={{uri: item?.sender_detail?.profile_image}}
        />
      </View>
      <View style={{flex: 0.78}}>
        <View style={styles.firstRowContainer}>
          <Text numberOfLines={1} style={styles.usernameTxt}>
            {item?.sender_detail?.first_name}
          </Text>
          <Text numberOfLines={1} style={styles.timeTxt}>
            {config.getTimesagoUTCtoLocal(item?.message_latest?.created_at)}
          </Text>
        </View>
        <View
          // display={
          //   userdata?.id == item?.message_latest?.receiver_id
          //     ? item?.message_latest?.receiver_msg_status == 'y'
          //       ? 'flex'
          //       : 'none'
          //     : 'none'
          // }
          style={[
            styles.firstRowContainer,
            {
              marginTop: scale(5),
            },
          ]}>
          <Text
            numberOfLines={1}
            style={[
              item?.unread_count != 0 ? styles.unReadMsgTxt : styles.msgTxt,
            ]}>
            {Validation.isEmptyValue(item.message_latest?.message)}
          </Text>
          <View
            display={item?.unread_count != 0 ? 'flex' : 'none'}
            style={styles.countContainer}>
            <Text numberOfLines={1} style={styles.unreadCountTxt}>
              {item?.unread_count}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderDeleteChatComponent = (rowData, rowMap) => (
    <Pressable
      onPress={() => {
        rowMap[rowData.item.key].closeRow();
        setTimeout(() => {
          refRBSheet.current.open();
          setDeleteItem(rowData?.item);
        }, 300);
      }}
      style={styles.hideContianer}>
      <Image style={styles.trashIcon} source={ImageView.trash} />
      <Text style={styles.deltTxt}>{Strings.delete}</Text>
    </Pressable>
  );

  const renderRequestList = ({item, index}) => (
    <View style={styles.listItemContainer}>
      <View style={{flex: 0.22}}>
        <Avatar.Image
          style={{backgroundColor: colors.pattensBlue}}
          size={60}
          source={{uri: item?.user?.profile_image}}
        />
      </View>
      <View style={{flex: 0.78}}>
        <View style={[styles.firstRowContainer, {paddingVertical: scale(5)}]}>
          <View
            style={{
              flex: 0.5,
              flexDirection: 'row',
            }}>
            <Text numberOfLines={1} style={[styles.usernameTxt, {flex: 0.95}]}>
              {item?.user?.first_name}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 0.5,
              alignItems: 'center',
            }}>
            <Pressable
              style={{
                justifyContent: 'center',
                height: scale(30),
              }}
              onPress={() => {
                setLoading(() => true, acepRejeReqApiCall(item, 'Reject'));
              }}>
              <Text numberOfLines={1} style={styles.rejectTxt}>
                {'Reject'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setLoading(() => true, acepRejeReqApiCall(item, 'Accept'));
              }}
              style={styles.acceptContainer}>
              <Text numberOfLines={1} style={styles.acceptTxt}>
                {'Accept'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent centerTxt={Strings.chats} />
      <View style={{paddingBottom: scale(10), padding: scale(20)}}>
        <TopTabBarComponent
          selectedTab={selectedTab}
          titleOne={Strings.friends}
          titleSecond={Strings.requests}
          onTabPress={flag => {
            if (flag == selectedTab) return;
            setSelectedTab(flag);
            if (!flag) {
              setLoading(() => true, getRequestListApiCall('refresh'));
            } else {
              setLoading(() => true, getChatThreadsListApiCall('refresh'));
            }
          }}
        />
      </View>
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
            setLoading(() => true, deleteChatTradeApiCall());
          }}
          nagetiveBtnPress={() => {
            refRBSheet.current.close();
          }}
          titleMessage={Strings.deleteChatMsg}
        />
      </RBSheet>
      {selectedTab ? ChatsListView() : RequestListView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
    paddingBottom: scale(55),
  },
  hideContianer: {
    backgroundColor: '#FF4444',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    height: scale(80),
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemContainer: {
    backgroundColor: colors.appBGColor,
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    height: scale(80),
    alignItems: 'center',
  },
  firstRowContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  trashIcon: {
    width: scale(20),
    height: scale(20),
  },
  deltTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayMedium,
    color: colors.white,
    marginLeft: scale(5),
  },
  usernameTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayBold,
    color: colors.black,
    flex: 0.7,
  },
  timeTxt: {
    fontSize: moderateScale(12),
    fontFamily: appFonts.ralewayRegular,
    color: colors.grey,
    textAlign: 'right',
    flex: 0.3,
  },
  unReadMsgTxt: {
    fontSize: moderateScale(13),
    fontFamily: appFonts.ralewayBold,
    color: colors.primary_color,
    flex: 0.8,
  },
  msgTxt: {
    fontSize: moderateScale(12),
    fontFamily: appFonts.ralewayRegular,
    color: '#0000008C',
    flex: 0.8,
  },
  countContainer: {
    backgroundColor: colors.primary_color,
    alignItems: 'center',
    width: scale(23),
    height: scale(23),
    justifyContent: 'center',
    borderRadius: 100,
  },
  unreadCountTxt: {
    fontSize: moderateScale(12),
    fontFamily: appFonts.promptMedium,
    color: colors.white,
    textAlign: 'center',
  },
  rejectTxt: {
    marginRight: scale(15),
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayRegular,
    color: colors.btnShadowClr,
  },
  acceptContainer: {
    backgroundColor: colors.primary_color,
    width: scale(65),
    height: scale(30),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  acceptTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayBold,
    color: colors.white,
  },
});

export default Chat;
