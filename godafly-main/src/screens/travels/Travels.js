import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import {scale, verticalScale} from 'react-native-size-matters';
import {ActivityIndicator} from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';

import {getServiceCall, postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import ListFlightLayoverComponent from '../../components/ListFlightLayoverComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';

import {colors, showErrorMessage} from '../../utils/constants';
import {Strings} from '../../utils/strings';
import Validation from '../../utils/validation';
import {ImageView} from '../../utils/imageView';

var limit = 10;
var offSet = 0;

const Travels = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [travelsData, setTravelsData] = useState([]);
  const [emptyTravelsData, setEmptyTravelsData] = useState(null);
  const [loadmore, setLoadmore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteId, setDeleteId] = useState('');

  const refRBSheet = useRef();

  useEffect(() => {
    offSet = 0;
    setLoading(() => true, getSaveTravelApiCall('refresh'));
  }, []);

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const getSaveTravelApiCall = async (type = '') => {
    if (type == 'refresh') {
      offSet = 0;
      setTravelsData([]);
      setEmptyTravelsData(null);
    }
    const data = new FormData();
    data.append(ApiKeys.LIMIT, limit);
    data.append(ApiKeys.OFFSET, offSet);
    postServiceCall(ApiEndpoint.TRAVELS_HISTORY, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoadmore(false);
          setLoading(false);
          setTotalCount(res?.total);
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
      <HeaderComponent centerTxt={Strings.travels} />
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
      {emptyTravelsData == null ? null : (
        <ListFlightLayoverComponent
          refreshCall={() => {
            setTimeout(() => {
              setLoading(() => true, getSaveTravelApiCall('refresh'));
            }, 200);
          }}
          onItemPress={() => {}}
          listData={travelsData}
          LoadmoreSpinner={LoadmoreSpinner}
          onEndReachedThreshold={0.05}
          onEndReached={
            totalCount != 0 &&
            travelsData.length < totalCount &&
            !loadmore &&
            loadmoreHandler
          }
          onDeletePress={item => {
            setDeleteId(item?.id);
            refRBSheet.current.open();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.appBGColor,
    flex: 1,
    paddingBottom: scale(55),
  },
});

export default Travels;
