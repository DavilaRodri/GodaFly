import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import {scale} from 'react-native-size-matters';
import {useBackHandler} from '@react-native-community/hooks';

import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';
import {postServiceCall} from '../../service/Webservices';

import NotificationListComponent from '../../components/NotificationListComponent';
import HeaderComponent from '../../components/HeaderComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, showErrorMessage} from '../../utils/constants';
import {Strings} from '../../utils/strings';
import {ImageView} from '../../utils/imageView';

import Validation from '../../utils/validation';
import {config} from './../../utils/constants';

var limit = 10;
var offSet = 0;

const Notification = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [emptyNotificationData, setEmptyNotificationData] = useState(null);
  const [loadmore, setLoadmore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    offSet = 0;
    setLoading(() => true, getNotificationApiCall('refresh'));
  }, []);

  const getNotificationApiCall = async (type = '') => {
    if (type == 'refresh') {
      offSet = 0;
      setNotificationData([]);
      setEmptyNotificationData(null);
    }
    const data = new FormData();
    data.append(ApiKeys.LIMIT, limit);
    data.append(ApiKeys.OFFSET, offSet);
    postServiceCall(ApiEndpoint.GET_NOTIFICATION, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoadmore(false);
          setLoading(false);
          setTotalCount(res?.total);
          const responseData = Validation.isEmptyValue(res?.data, 'arr');
          if (type == 'refresh') {
            setNotificationData(responseData);
            setEmptyNotificationData(
              Validation.isEmpty(responseData) ? true : false,
            );
          } else {
            const mergeData = [...notificationData, ...responseData];
            setNotificationData(mergeData);
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

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const loadmoreHandler = () => {
    offSet = offSet + limit;
    setLoadmore(() => true, getNotificationApiCall('loadMore'));
  };

  const LoadmoreSpinner = () =>
    loadmore && (
      <View
        style={{
          height: scale(50),
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

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIconPress={() => {
          navigation.goBack();
        }}
        leftIcon={ImageView.backIcon}
        centerTxt={Strings.notifications}
      />
      {emptyNotificationData == null ? null : (
        <NotificationListComponent
          refreshCall={() => {
            setTimeout(() => {
              setLoading(() => true, getNotificationApiCall('refresh'));
            }, 200);
          }}
          onPress={item => {
            config.notificationNavigationHandler(item, navigation);
          }}
          listData={notificationData}
          LoadmoreSpinner={LoadmoreSpinner}
          onEndReachedThreshold={0.05}
          onEndReached={
            totalCount != 0 &&
            notificationData.length < totalCount &&
            !loadmore &&
            loadmoreHandler
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
  },
});

export default Notification;
