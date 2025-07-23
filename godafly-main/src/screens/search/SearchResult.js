import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

import {moderateScale, scale} from 'react-native-size-matters';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import LoadingComponent from '../../components/LoadingComponent';
import OtherUserList from '../../components/OtherUserList';

import {ImageView} from '../../utils/imageView';
import {colors, config, showErrorMessage} from '../../utils/constants';
import {Strings} from '../../utils/strings';
import appFonts from '../../utils/appFonts';
import Validation from '../../utils/validation';
import {events} from '../../App';

const SearchResult = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [userData, setUserData] = useState([]);
  const [emptyUserData, setEmptyUserData] = useState(null);
  const [saveFlag, setSaveFlag] = useState(route.params?.saveFlag);

  useEffect(() => {
    setLoading(() => true, searchPlanLayoverApiCall());
  }, []);

  const searchPlanLayoverApiCall = async (type = '') => {
    const data = new FormData();
    data.append(ApiKeys.DATE, route.params?.userData?.date);
    switch (true) {
      case route.params?.searchType == 'f':
        data.append(
          ApiKeys.FLIGHT_NUMBER,
          route.params?.userData?.fNumber.slice(
            2,
            route.params?.userData?.fNumber.length,
          ),
        );
        data.append(
          ApiKeys.CARRIER_CODE,
          route.params?.userData?.fNumber.slice(0, 2),
        );
        if (type == 'searchByF') {
          data.append(ApiKeys.START_IATA_C, searchData?.start_iata_code);
          data.append(ApiKeys.START_T_Q, searchData?.start_timings_qualifier);
          data.append(ApiKeys.START_T_V, searchData?.start_timings_value);
          data.append(ApiKeys.END_IATA_C, searchData?.end_iata_code);
          data.append(ApiKeys.END_T_Q, searchData?.end_timings_qualifier);
          data.append(ApiKeys.END_T_V, searchData?.end_timings_value);
        }
        break;
      case route.params?.searchType == 'l':
        data.append(ApiKeys.CITY_ID, route.params?.userData?.cityId);
        data.append(ApiKeys.AIR_ID, route.params?.userData?.airId);
        data.append(ApiKeys.ARRI_TIME, route.params?.userData?.arrTime);
        data.append(ApiKeys.DEPA_TIME, route.params?.userData?.depaTime);
        break;
    }
    postServiceCall(
      route.params?.searchType == 'f'
        ? type == 'searchByF'
          ? ApiEndpoint.SAVE_B_FLIGHT
          : ApiEndpoint.SEARCH_B_FLIGHT
        : type == 'searchByL'
        ? ApiEndpoint.SAVE_B_LAYOVER
        : ApiEndpoint.SEARCH_B_LAYOVER,
      data,
    )
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          const responseData = Validation.isEmptyValue(res?.data, 'arr');
          if (type == 'searchByF') {
            events.emit('ChangeData');
            setSaveFlag(false);
          } else if (type == 'searchByL') {
            setSaveFlag(false);
          } else {
            const tempObj =
              route.params?.searchType == 'f'
                ? {
                    start_iata_code: res?.start_point?.iataCode,
                    start_timings_qualifier:
                      res?.start_point?.timings_qualifier,
                    start_timings_value: res?.start_point?.timings_value,
                    end_iata_code: res?.end_point?.iataCode,
                    end_timings_qualifier: res?.end_point?.timings_qualifier,
                    end_timings_value: res?.end_point?.timings_value,
                    flight_number: res?.flight_number,
                  }
                : {
                    airport: res?.airport,
                    arrTime: res?.arrival_time,
                    depaTime: res?.departure_time,
                  };
            setSearchData(tempObj);
            setUserData(responseData);
            setEmptyUserData(Validation.isEmpty(responseData) ? true : false);
          }
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

  const SearchResultView = () => (
    <View style={{flex: 1}}>
      <View
        display={Validation.isEmpty(searchData) ? 'none' : 'flex'}
        style={{
          height: scale(90),
          paddingHorizontal: scale(20),
          backgroundColor: colors.primary_color,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}>
        <View>
          {route.params?.searchType == 'f' ? (
            <Text numberOfLines={1} style={styles.flightNTxt}>
              {searchData?.flight_number}
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.airportTxt, {paddingTop: scale(10)}]}>
              {searchData?.airport}
            </Text>
          )}
        </View>
        <View style={styles.rSbContainer}>
          <View style={styles.sectionContianer}>
            {route.params?.searchType == 'f' ? (
              <>
                <Text
                  numberOfLines={1}
                  style={[styles.flightNTxt, {fontSize: moderateScale(15)}]}>
                  {searchData?.start_iata_code}
                </Text>
                <Text
                  style={[styles.flightCTxt, {fontSize: moderateScale(15)}]}>
                  {config.convertUTCToLocal(
                    searchData?.start_timings_value,
                    null,
                    config.BACKEND_TIME_FORMAT,
                  )}
                </Text>
              </>
            ) : (
              <Text style={[styles.flightCTxt, {fontSize: moderateScale(15)}]}>
                {config.convertUTCToLocal(
                  searchData?.arrTime,
                  config.BACKEND_TIME_FORMAT,
                  config.BACKEND_TIME_FORMAT,
                )}
              </Text>
            )}
          </View>
          <View style={[styles.sectionContianer, {flex: 0.3}]}>
            <Image
              resizeMode="contain"
              style={styles.longArrowStyl}
              source={ImageView.longArrow}
            />
          </View>
          <View style={styles.sectionContianer}>
            {route.params?.searchType == 'f' ? (
              <>
                <Text
                  numberOfLines={1}
                  style={[styles.flightNTxt, {fontSize: moderateScale(15)}]}>
                  {searchData?.end_iata_code}
                </Text>
                <Text
                  style={[styles.flightCTxt, {fontSize: moderateScale(15)}]}>
                  {config.convertUTCToLocal(
                    searchData?.end_timings_value,
                    null,
                    config.BACKEND_TIME_FORMAT,
                  )}
                </Text>
              </>
            ) : (
              <Text style={[styles.flightCTxt, {fontSize: moderateScale(15)}]}>
                {config.convertUTCToLocal(
                  searchData?.depaTime,
                  config.BACKEND_TIME_FORMAT,
                  config.BACKEND_TIME_FORMAT,
                )}
              </Text>
            )}
          </View>
        </View>
      </View>
      {emptyUserData == null ? null : (
        <OtherUserList
          type={route.params?.searchType}
          listData={userData}
          onPress={item => {
            navigation.navigate('OtherUserProfile', {userId: item?.user_id});
          }}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIcon={ImageView.backIcon}
        leftIconPress={() => {
          navigation.goBack();
        }}
        headerTxt={{color: colors.darkBlue}}
        rightIconStyl={{width: scale(20), height: scale(20)}}
        leftIconStyl={{tintColor: colors.darkBlue}}
        rightIcon={saveFlag ? ImageView.saveProfile : null}
        rightIconPress={() => {
          saveFlag
            ? setLoading(
                () => true,
                searchPlanLayoverApiCall(
                  route.params?.searchType == 'f' ? 'searchByF' : 'searchByL',
                ),
              )
            : {};
        }}
        centerTxt={Strings.search}
      />
      {SearchResultView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
  },
  flightNTxt: {
    fontSize: moderateScale(23),
    fontFamily: appFonts.ralewayBold,
    color: colors.darkBlue,
  },
  flightCTxt: {
    fontSize: moderateScale(23),
    fontFamily: appFonts.ralewayRegular,
    color: colors.darkBlue,
    opacity: 0.8,
  },
  airportTxt: {
    fontSize: moderateScale(23),
    fontFamily: appFonts.ralewayBold,
    color: colors.darkBlue,
    textAlign: 'center',
  },
  rSbContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: scale(10),
  },
  sectionContianer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.35,
  },
  longArrowStyl: {
    width: scale(90),
    height: scale(20),
  },
});

export default SearchResult;
