import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Keyboard, Text, View} from 'react-native';

import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import MaskInput from 'react-native-mask-input';
import RBSheet from 'react-native-raw-bottom-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import TopTabBarComponent from '../../components/TopTabBarComponent';
import TextInputComponent from '../../components/TextInputComponent';
import ButtonComponent from '../../components/ButtonComponent';
import SearchListComponent from '../../components/SearchListComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, config, showErrorMessage} from '../../utils/constants';
import {Strings} from '../../utils/strings';
import {ImageView} from '../../utils/imageView';
import appFonts from '../../utils/appFonts';
import Validation from './../../utils/validation';
import {events} from '../../App';

const Search = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(true);
  const [searchData, setSearchData] = useState([]);
  const [flightNumber, setFlightNumber] = useState('');
  const [selectDropDownType, setSelectDropDownType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState('');
  const [datePickerType, setDatePickerType] = useState('');
  const [aTime, setATime] = useState('');
  const [dTime, setDTime] = useState('');
  const [cityData, setCityData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [airportData, setAirportData] = useState([]);
  const [search, setSearch] = useState('');
  const [userData, setUserData] = useState(null);

  const refRBSheet = useRef(null);
  const refRBConfimationSheet = useRef(null);

  useEffect(() => {
    (async () => {
      let getUserData = await config.getUserData();
      setUserData(getUserData);
    })();
    getCityApiCall('city');
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (selectDropDownType != '') {
        Keyboard.dismiss();
        setSearch(search);
        setLoading(
          () => false,
          getCityApiCall(selectDropDownType == 'airport' ? 'airport' : 'city'),
        );
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [search]);

  const getCityApiCall = async (mode = 'city', item = selectedCity) => {
    const data = new FormData();
    data.append(ApiKeys.NAME, search);
    if (mode == 'airport') {
      data.append(ApiKeys.CITY_NAME, item?.city_name);
    }

    postServiceCall(
      mode == 'city' ? ApiEndpoint.GET_CITIES : ApiEndpoint.GET_AIRPORTS,
      Validation.isEmpty(data?._parts) ? '' : data,
    )
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          const tempData = [...responseData];
          tempData.map(obj => {
            obj.isSelected = false;
            obj.name = mode == 'city' ? obj?.city_name : obj?.airport_name;
          });
          if (mode == 'city') {
            setCityData(tempData);
          } else {
            setAirportData(tempData);
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

  const searchPlanLayoverApiCall = async (type = '') => {
    const data = new FormData();
    data.append(
      ApiKeys.DATE,
      config.convertLocalToUTC(
        date + moment().format(config.TIME_FORMAT),
        config.DOB_FORMAT + config.TIME_FORMAT,
        config.BACKEND_DATE_FORMAT,
      ),
    );
    switch (true) {
      case selectedTab:
        data.append(ApiKeys.FLIGHT_NUMBER, flightNumber.split(' - ')[1]);
        data.append(ApiKeys.CARRIER_CODE, flightNumber.split(' - ')[0]);
        if (type == 'searchByF') {
          data.append(ApiKeys.START_IATA_C, searchData?.start_iata_code);
          data.append(ApiKeys.START_T_Q, searchData?.start_timings_qualifier);
          data.append(ApiKeys.START_T_V, searchData?.start_timings_value);
          data.append(ApiKeys.END_IATA_C, searchData?.end_iata_code);
          data.append(ApiKeys.END_T_Q, searchData?.end_timings_qualifier);
          data.append(ApiKeys.END_T_V, searchData?.end_timings_value);
        }
        break;
      case !selectedTab:
        data.append(ApiKeys.CITY_ID, selectedCity?.id);
        data.append(ApiKeys.AIR_ID, selectedAirport?.id);
        data.append(
          ApiKeys.ARRI_TIME,
          config.convertLocalToUTC(
            date + ' ' + aTime,
            config.DOB_FORMAT + ' ' + config.TIME_FORMAT,
            config.BACKEND_TIME_FORMAT,
          ),
        );
        data.append(
          ApiKeys.DEPA_TIME,
          config.convertLocalToUTC(
            date + ' ' + dTime,
            config.DOB_FORMAT + ' ' + config.TIME_FORMAT,
            config.BACKEND_TIME_FORMAT,
          ),
        );
        break;
    }

    postServiceCall(
      selectedTab
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
          if (type == 'searchByF') {
            refRBConfimationSheet.current.close();
            events.emit('ChangeData');
            const tempObj = {
              date: config.convertLocalToUTC(
                date + moment().format(config.TIME_FORMAT),
                config.DOB_FORMAT + config.TIME_FORMAT,
                config.BACKEND_DATE_FORMAT,
              ),
              fNumber: res?.flight_number,
            };

            setTimeout(() => {
              navigation.replace('SearchResult', {
                userData: tempObj,
                saveFlag: false,
                searchType: 'f',
              });
            }, 500);
          } else if (type == 'searchByL') {
            refRBConfimationSheet.current.close();
            const tempObj = {
              date: config.convertLocalToUTC(
                date + moment().format(config.TIME_FORMAT),
                config.DOB_FORMAT + config.TIME_FORMAT,
                config.BACKEND_DATE_FORMAT,
              ),
              cityId: selectedCity?.id,
              airId: selectedAirport?.id,
              arrTime: config.convertLocalToUTC(
                date + ' ' + aTime,
                config.DOB_FORMAT + ' ' + config.TIME_FORMAT,
                config.BACKEND_TIME_FORMAT,
              ),
              depaTime: config.convertLocalToUTC(
                date + ' ' + dTime,
                config.DOB_FORMAT + ' ' + config.TIME_FORMAT,
                config.BACKEND_TIME_FORMAT,
              ),
            };
            setTimeout(() => {
              navigation.replace('SearchResult', {
                userData: tempObj,
                saveFlag: false,
                searchType: 'l',
              });
            }, 500);
          } else {
            const tempObj = {
              start_iata_code: res?.start_point?.iataCode,
              start_timings_qualifier: res?.start_point?.timings_qualifier,
              start_timings_value: res?.start_point?.timings_value,
              end_iata_code: res?.end_point?.iataCode,
              end_timings_qualifier: res?.end_point?.timings_qualifier,
              end_timings_value: res?.end_point?.timings_value,
            };
            setSearchData(tempObj);
            setSelectDropDownType('');
            setTimeout(() => {
              refRBConfimationSheet.current.open();
            }, 1000);
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

  const checkValidation = () => {
    Keyboard.dismiss();
    if (selectedTab) {
      switch (true) {
        case Validation.isEmpty(date):
          showErrorMessage(Strings.plsEnterDate);
          break;
        case Validation.isEmpty(flightNumber):
          showErrorMessage(Strings.plsEnterFNumber);
          break;
        default:
          setLoading(() => true, searchPlanLayoverApiCall());
          break;
      }
    } else {
      switch (true) {
        case Validation.isEmpty(selectedCity):
          showErrorMessage(Strings.plsSelectCity);
          break;
        case Validation.isEmpty(selectedAirport):
          showErrorMessage(Strings.plsSelectAirport);
          break;
        case Validation.isEmpty(date):
          showErrorMessage(Strings.plsEnterDate);
          break;
        case Validation.isEmpty(aTime):
          showErrorMessage(Strings.plsSelectATime);
          break;
        case Validation.isEmpty(dTime):
          showErrorMessage(Strings.plsSelectDTime);
          break;
        default:
          setLoading(() => true, searchPlanLayoverApiCall());
          break;
      }
    }
  };

  const datePickerDynamicTitle = type => {
    switch (type) {
      case 'date':
        return Strings.date;
      case 'aTime':
        return Strings.arrivalTime;
      case 'dTime':
        return Strings.departureTime;
    }
  };

  const dynamicDateHandler = date => {
    switch (datePickerType) {
      case 'date':
        setDate(moment(date).format(config.DOB_FORMAT));
        break;
      case 'aTime':
        setATime(moment(date).format(config.TIME_FORMAT));
        break;
      case 'dTime':
        setDTime(moment(date).format(config.TIME_FORMAT));
        break;
    }
    setShowDatePicker(false);
  };

  const NewSearchView = () => (
    <View style={{padding: scale(20)}}>
      <Text
        style={
          styles.headerTxt
        }>{`${Strings.hola} ${userData?.first_name}${Strings.whtLookinFor}`}</Text>
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TopTabBarComponent
        selectedTab={selectedTab}
        titleOne={Strings.plane}
        titleSecond={Strings.layover}
        onTabPress={flag => {
          if (flag == selectedTab) return;
          setDate('');
          setSelectedCity('');
          setSelectedAirport('');
          setATime('');
          setDTime('');
          setFlightNumber('');
          Keyboard.dismiss();
          setSelectedTab(flag);
        }}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      {selectedTab ? PlaneView() : LayoverView()}
    </View>
  );

  const PlaneView = () => (
    <View style={{}}>
      <TextInputComponent
        onPress={() => {
          Keyboard.dismiss();
          setShowDatePicker(true), setDatePickerType('date');
        }}
        editable={false}
        rightIcon={ImageView.calendar}
        value={Validation.isEmpty(date) ? Strings.date : date}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View style={styles.inputMaskedContainer}>
        <MaskInput
          style={styles.maskedInputTextStyl}
          placeholderTextColor={colors.darkGreyishNavy}
          placeholder={Strings.flightNumber}
          value={flightNumber}
          autoCapitalize="characters"
          onChangeText={(masked, unmasked) => {
            setFlightNumber(masked.toUpperCase());
          }}
          onSubmitEditing={() => {
            checkValidation();
          }}
          mask={config.FLIGHT_NUMBER_MASKED}
        />
      </View>
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <ButtonComponent
        onBtnPress={() => {
          checkValidation();
        }}
        container={{backgroundColor: colors.darkBlue}}
        btnLabelTxt={{color: colors.white}}
        btnLabel={Strings.search}
      />
    </View>
  );

  const LayoverView = () => (
    <View style={{}}>
      <TextInputComponent
        editable={false}
        onPress={() => {
          setSelectDropDownType('city');
          refRBSheet.current.open();
        }}
        onRightIconPress={() => {
          setSelectDropDownType('city');
          refRBSheet.current.open();
        }}
        rightIcon={ImageView.dropDown}
        value={
          Validation.isEmpty(selectedCity) ? Strings.city : selectedCity?.name
        }
      />
      {!Validation.isEmpty(selectedCity) && (
        <>
          <View style={styles.heightBox} />
          <View style={styles.heightBox} />
          <TextInputComponent
            editable={false}
            onPress={() => {
              setSelectDropDownType('airport');
              refRBSheet.current.open();
            }}
            onRightIconPress={() => {
              setSelectDropDownType('airport');
              refRBSheet.current.open();
            }}
            rightIcon={ImageView.dropDown}
            value={
              Validation.isEmpty(selectedAirport)
                ? Strings.airport
                : selectedAirport?.name
            }
          />
        </>
      )}
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        onPress={() => {
          Keyboard.dismiss();
          setShowDatePicker(true), setDatePickerType('date');
        }}
        editable={false}
        rightIcon={ImageView.calendar}
        value={Validation.isEmpty(date) ? Strings.date : date}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        onPress={() => {
          Keyboard.dismiss();
          setShowDatePicker(true), setDatePickerType('aTime');
        }}
        editable={false}
        rightIcon={ImageView.time}
        value={Validation.isEmpty(aTime) ? Strings.arrivalTime : aTime}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <TextInputComponent
        onPress={() => {
          Keyboard.dismiss();
          setShowDatePicker(true), setDatePickerType('dTime');
        }}
        editable={false}
        rightIcon={ImageView.time}
        value={Validation.isEmpty(dTime) ? Strings.departureTime : dTime}
      />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <ButtonComponent
        onBtnPress={() => {
          checkValidation();
        }}
        container={{backgroundColor: colors.darkBlue}}
        btnLabelTxt={{color: colors.white}}
        btnLabel={Strings.search}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <RBSheet
        ref={refRBSheet}
        height={verticalScale(500)}
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
        <SearchListComponent
          showRightIcon
          headerTag={
            selectDropDownType == 'airport'
              ? Strings.select + ' ' + Strings.airport
              : Strings.select + ' ' + Strings.city
          }
          searchPlaceHolder={
            selectDropDownType == 'airport'
              ? Strings.search + ' ' + Strings.airport
              : Strings.search + ' ' + Strings.city
          }
          listData={selectDropDownType == 'airport' ? airportData : cityData}
          search={search}
          onPress={item => {
            refRBSheet.current.close();
            setTimeout(() => {
              if (selectDropDownType == 'airport') {
                const tempData = [...airportData];
                tempData.map(obj => {
                  obj?.id == item?.id
                    ? (obj.isSelected = true)
                    : (obj.isSelected = false);
                });
                setAirportData(tempData);
                setSelectedAirport(item);
              } else {
                setSearch('');
                setSelectedAirport('');
                setSelectedCity(item);
                const tempData = [...cityData];
                tempData.map(obj => {
                  obj?.id == item?.id
                    ? (obj.isSelected = true)
                    : (obj.isSelected = false);
                });
                setCityData(tempData);
                setLoading(() => true, getCityApiCall('airport', item));
              }
            }, 500);
          }}
          onSearchChangeText={text => {
            setSearch(text);
          }}
        />
      </RBSheet>
      <RBSheet
        ref={refRBConfimationSheet}
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
            events.emit('ChangeData');
            setLoading(
              () => true,
              searchPlanLayoverApiCall(selectedTab ? 'searchByF' : 'searchByL'),
            );
          }}
          nagetiveBtnPress={() => {
            refRBConfimationSheet.current.close();
            const tempObj = selectedTab
              ? {
                  date: config.convertLocalToUTC(
                    date + moment().format(config.TIME_FORMAT),
                    config.DOB_FORMAT + config.TIME_FORMAT,
                    config.BACKEND_DATE_FORMAT,
                  ),
                  fNumber: flightNumber.replace(' - ', ''),
                }
              : {
                  date: config.convertLocalToUTC(
                    date + moment().format(config.TIME_FORMAT),
                    config.DOB_FORMAT + config.TIME_FORMAT,
                    config.BACKEND_DATE_FORMAT,
                  ),
                  cityId: selectedCity?.id,
                  airId: selectedAirport?.id,
                  arrTime: config.convertLocalToUTC(
                    date + ' ' + aTime,
                    config.DOB_FORMAT + ' ' + config.TIME_FORMAT,
                    config.BACKEND_TIME_FORMAT,
                  ),
                  depaTime: config.convertLocalToUTC(
                    date + ' ' + dTime,
                    config.DOB_FORMAT + ' ' + config.TIME_FORMAT,
                    config.BACKEND_TIME_FORMAT,
                  ),
                };
            setTimeout(() => {
              navigation.replace('SearchResult', {
                userData: tempObj,
                saveFlag: true,
                searchType: selectedTab ? 'f' : 'l',
              });
            }, 500);
          }}
          negativeTxt={Strings.skip}
          titleMessage={Strings.addProfile}
        />
      </RBSheet>
      <DatePicker
        modal
        open={showDatePicker}
        theme="light"
        mode={
          datePickerType == 'aTime' || datePickerType == 'dTime'
            ? 'time'
            : 'date'
        }
        date={
          datePickerType == 'date'
            ? Validation.isEmpty(date)
              ? new Date()
              : new Date(
                  moment(date, config.DOB_FORMAT).format(
                    config.BACKEND_DATE_FORMAT,
                  ),
                )
            : datePickerType == 'aTime'
            ? Validation.isEmpty(aTime)
              ? new Date()
              : new Date(moment(aTime, config.TIME_FORMAT))
            : Validation.isEmpty(dTime)
            ? new Date()
            : new Date(moment(dTime, config.TIME_FORMAT))
        }
        title={datePickerDynamicTitle(datePickerType)}
        androidVariant={'iosClone'}
        onConfirm={date => {
          dynamicDateHandler(date);
        }}
        onCancel={() => {
          setShowDatePicker(false);
          setDatePickerType('');
        }}
      />
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIcon={ImageView.backIcon}
        leftIconPress={() => {
          navigation.goBack();
        }}
        centerTxt={Strings.newSearch}
      />
      <KeyboardAwareScrollView
        style={styles.container}
        bounces={false}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        {NewSearchView()}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
  },
  headerTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayRegular,
    color: colors.black,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: scale(5),
  },
  heightBox: {
    marginVertical: scale(4),
  },
  inputMaskedContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(5),
    borderWidth: 1,
    borderColor: colors.transparent,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
    paddingHorizontal: scale(15),
  },
  maskedInputTextStyl: {
    fontFamily: appFonts.ralewayRegular,
    color: colors.darkGreyishNavy,
    fontSize: moderateScale(16),
    height: scale(40),
    flex: 1,
    padding: 0,
    width: '95%',
  },
});

export default Search;
