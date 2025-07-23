import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Platform, View, Linking} from 'react-native';

import RBSheet from 'react-native-raw-bottom-sheet';
import {scale, verticalScale} from 'react-native-size-matters';
import {useBackHandler} from '@react-native-community/hooks';
import RNExitApp from 'react-native-exit-app';
import {ActivityIndicator} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';

import {getServiceCall, postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import SearchFlightLayoverComponent from '../../components/SearchFlightLayoverComponent';
import ListFlightLayoverComponent from '../../components/ListFlightLayoverComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, config, showErrorMessage} from '../../utils/constants';
import {Strings} from '../../utils/strings';
import {ImageView} from '../../utils/imageView';
import Validation from '../../utils/validation';
import {events} from '../../App';

var limit = 10;
var offSet = 0;

const Home = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [travelsData, setTravelsData] = useState([]);
  const [emptyTravelsData, setEmptyTravelsData] = useState(null);
  const [loadmore, setLoadmore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [userData, setUserData] = useState(null);

  const refRBSheet = useRef();
  const refRBUpdateSheet = useRef();

  useEffect(() => {
    (async () => {
      offSet = 0;
      setLoading(() => true, getSaveTravelApiCall('refresh'));
      versionCheckerApiCall();
      let getUserData = await config.getUserData();
      setUserData(getUserData);
    })();
    events.on('ChangeData', eventsHandler);
    () => {
      events.removeListener('ChangeData', eventsHandler);
    };
  }, []);
  const getSaveTravelApiCall = async (type = '') => {
    if (type == 'refresh') {
      offSet = 0;
      setTravelsData([]);
      setEmptyTravelsData(null);
    }
    const data = new FormData();
    data.append(ApiKeys.LIMIT, limit);
    data.append(ApiKeys.OFFSET, offSet);
    postServiceCall(ApiEndpoint.SAVE_TRAVELS, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoadmore(false);
          setTotalCount(res?.total);
          setLoading(false);
          const responseData = Validation.isEmptyValue(res?.data, 'arr');
          if (type == 'refresh') {
            const tempData = [...responseData];
            tempData.map(item => {
              if (Validation.isEmpty(item?.city_image)) {
                if (item?.type == 'Plane') {
                  const getRandomNumber = Math.floor(Math.random() * 11 + 1);
                  item.randomImg = ImageView['travel_' + getRandomNumber];
                } else {
                  const getRandomNumber = Math.floor(Math.random() * 11 + 1);
                  item.randomImg = ImageView['layover_' + getRandomNumber];
                }
              }
            });
            setTravelsData(tempData);
            setEmptyTravelsData(
              !Validation.isEmpty(responseData) ? true : false,
            );
          } else {
            const tempData = [...responseData];
            tempData.map(item => {
              if (Validation.isEmpty(item?.city_image)) {
                if (item?.type == 'Plane') {
                  const getRandomNumber = Math.floor(Math.random() * 11 + 1);
                  item.randomImg = ImageView['travel_' + getRandomNumber];
                } else {
                  const getRandomNumber = Math.floor(Math.random() * 11 + 1);
                  item.randomImg = ImageView['layover_' + getRandomNumber];
                }
              }
            });
            const mergeData = [...travelsData, ...tempData];
            setTravelsData(mergeData);
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

  const deleteTravelApiCall = async () => {
    getServiceCall(ApiEndpoint.DELETE_TRAVEL + '/' + deleteId, '')
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          const tempData = [...travelsData];
          const updatedData = tempData.filter(filter => filter.id != deleteId);
          setEmptyTravelsData(Validation.isEmpty(updatedData) ? true : false);
          setTravelsData(updatedData);
          setTotalCount(updatedData.length);
          setDeleteId('');
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
    RNExitApp.exitApp();
    return true;
  });

  const eventsHandler = () => {
    getSaveTravelApiCall('refresh');
  };

  const loadmoreHandler = () => {
    offSet = offSet + limit;
    setLoadmore(() => true, getSaveTravelApiCall('loadMore'));
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
        leftIconContainer={{flex: 0}}
        centerContainer={{alignItems: 'flex-start', flex: 1}}
        centerTxt={Strings.hello + userData?.first_name}
        rightIcon={ImageView.notfication}
        rightIconPress={() => {
          navigation.navigate('Notification');
        }}
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
              setLoading(() => true, deleteTravelApiCall());
            }, 500);
          }}
          nagetiveBtnPress={() => {
            refRBSheet.current.close();
          }}
          titleMessage={Strings.deleteMessage}
        />
      </RBSheet>
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
      {emptyTravelsData == null ? null : travelsData &&
        travelsData.length == 0 ? (
        <SearchFlightLayoverComponent
          leftImg={ImageView.searchFlightBanner}
          rightImg={ImageView.searchLayoverBanner}
          onSearchPress={() => {
            navigation.navigate('NewSearch');
          }}
        />
      ) : (
        <ListFlightLayoverComponent
          refreshCall={() => {
            setTimeout(() => {
              setLoading(() => true, getSaveTravelApiCall('refresh'));
            }, 200);
          }}
          onItemPress={item => {
            const tempObj =
              item?.type == 'Plane'
                ? {
                    date: item?.date,
                    fNumber: item?.flight_number,
                  }
                : {
                    date: item?.date,
                    cityId: item?.city_id,
                    airId: item?.airport_id,
                    arrTime: item?.arrival_time,
                    depaTime: item?.departure_time,
                  };
            navigation.navigate('SearchResult', {
              userData: tempObj,
              saveFlag: false,
              searchType: item?.type == 'Plane' ? 'f' : 'l',
            });
          }}
          listData={travelsData}
          onDeletePress={item => {
            setDeleteId(item?.id);
            refRBSheet.current.open();
          }}
          LoadmoreSpinner={LoadmoreSpinner}
          onEndReachedThreshold={0.05}
          onEndReached={
            totalCount != 0 &&
            travelsData.length < totalCount &&
            !loadmore &&
            loadmoreHandler
          }
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.appBGColor,
    flex: 1,
    paddingBottom: scale(55),
  },
});
