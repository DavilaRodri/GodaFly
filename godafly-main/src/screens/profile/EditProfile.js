import React, {useRef, useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  Keyboard,
} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import RBSheet from 'react-native-raw-bottom-sheet';
import {CountryPicker} from 'react-native-country-codes-picker';
import CountryFlag from 'react-native-country-flag';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useBackHandler} from '@react-native-community/hooks';

import {getServiceCall, postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import ButtonComponent from '../../components/ButtonComponent';
import SearchListComponent from '../../components/SearchListComponent';
import HeaderComponent from '../../components/HeaderComponent';
import ProfileImgList from '../../components/ProfileImgList';
import TextInputComponent from '../../components/TextInputComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ConfirmationPopupComponent from '../../components/ConfirmationPopupComponent';

import {
  colors,
  config,
  logDisplay,
  showErrorMessage,
  showSuccessMessage,
} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import {Strings} from '../../utils/strings';
import appFonts from '../../utils/appFonts';
import Validation from '../../utils/validation';

const EditProfile = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [fName, setFName] = useState(route.params?.userProfileData?.first_name);
  const [lName, setLName] = useState(route.params?.userProfileData?.last_name);
  const [mobileNo, setMobileNo] = useState(
    route.params?.userProfileData?.mobile,
  );
  const [email, setEmail] = useState(route.params?.userProfileData?.email);
  const [inputFocus, setInputFocus] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState(
    route.params?.userProfileData?.country_code,
  );
  const [countrySelectedFalg, setCountrySelectedFalg] = useState(
    route.params?.userProfileData?.country_initial_code ?? 'IN',
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [DOB, setDOB] = useState(
    config.convertUTCToLocal(
      route.params?.userProfileData?.dob,
      config.BACKEND_DATE_FORMAT,
      config.DOB_FORMAT,
    ),
  );
  const [bio, setBio] = useState(route.params?.userProfileData?.bio);
  const [interestData, setInterestData] = useState([]);
  const [searchInterestData, setSearchInterestData] = useState([]);
  const [selectedInterestData, setSelectedInterestData] = useState([]);
  const [search, setSearch] = useState(null);
  const [dummyImgList, setDummyImgList] = useState([
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
  ]);
  const [selectedUploadType, setSelectedUploadType] = useState('');
  const [imgObject, setImgObject] = useState(null);
  const [selectedImg, setSelectedImg] = useState(
    route.params?.userProfileData?.profile_image,
  );

  const refRBSheet = useRef(null);
  const refDiscardRBSheet = useRef(null);
  const lNameRef = useRef('');
  const emailRef = useRef('');
  const mobileNoRef = useRef('');
  const refOptionRBSheet = useRef(null);

  useEffect(() => {
    getInterestApiCall();
    editGalleryImgHandler();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search == null) return;
      if (search.length == 0) {
        setInterestData(searchInterestData);
      } else {
        const newData = searchInterestData.filter(function (item) {
          const itemData = item?.name
            ? item?.name.toUpperCase()
            : ''.toUpperCase();
          const textData = search.toUpperCase();
          return itemData.indexOf(textData) > -1;
        });
        setInterestData(newData);
        setSearch(search);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [search]);

  const getInterestApiCall = async () => {
    postServiceCall(ApiEndpoint.GET_INTEREST, '')
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          var tempData = [...responseData];
          var tempEditDataIds = [];
          route.params?.userProfileData?.user_interests.map(obj => {
            tempEditDataIds.push(obj?.interest?.id);
          });
          tempData.map(obj => {
            if (tempEditDataIds.includes(obj.id)) {
              obj.isSelected = true;
              obj.selected = true;
            } else {
              obj.isSelected = false;
              obj.selected = false;
            }
          });
          setSelectedInterestData(tempData);
          setInterestData(tempData);
          setSearchInterestData(tempData);
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

  const deleteImgApICall = async item => {
    getServiceCall(ApiEndpoint.DELETE_IMAGES + '/' + item?.deleteId, '')
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          removeGalleryImgHandler(item);
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
        setLoading(false);
      });
  };

  const editProfileApiCall = async () => {
    const data = new FormData();
    if (imgObject != null) {
      data.append(ApiKeys.PROFILE_IMG, imgObject);
    }
    data.append(ApiKeys.F_NAME, fName);
    data.append(ApiKeys.L_NAME, lName);
    data.append(ApiKeys.COUNTRY_CODE, countryCode);
    data.append(ApiKeys.COUNTRY_INITIAL_CODE, countrySelectedFalg);
    data.append(ApiKeys.MOBILE, mobileNo);
    data.append(ApiKeys.EMAIL, email);
    data.append(ApiKeys.BIO, bio);
    data.append(
      ApiKeys.DOB,
      config.convertLocalToUTC(
        DOB,
        config.DOB_FORMAT,
        config.BACKEND_DATE_FORMAT,
      ),
    );
    const tempInterestData = [...selectedInterestData];
    tempInterestData.map((obj, ind) => {
      if (obj.selected) {
        data.append(ApiKeys.INTEREST + '[' + ind + ']', obj.id);
      }
    });
    const tempGalleryImgData = [...dummyImgList];
    tempGalleryImgData.map((obj, ind) => {
      if (!Validation.isEmpty(obj.imgUrl) && obj.imgUploaded) {
        data.append(ApiKeys.USER_IMG + '[' + ind + ']', obj.imgMultiPartData);
      }
    });
    postServiceCall(ApiEndpoint.EDIT_PROFILE, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          showSuccessMessage(res?.message);
          route.params?.goBackHandler();
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

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const checkValidation = () => {
    Keyboard.dismiss();
    switch (true) {
      case Validation.isEmpty(fName.trim()):
        showErrorMessage(Strings.plsEnterFName);
        break;
      case Validation.isEmpty(lName.trim()):
        showErrorMessage(Strings.plsEnterLName);
        break;
      case Validation.isEmpty(email.trim()):
        showErrorMessage(Strings.plsEnterEmail);
        break;
      case !Validation.validEmail(email):
        showErrorMessage(Strings.plsEnterValidEmail);
        break;
      case Validation.isEmpty(mobileNo.trim()):
        showErrorMessage(Strings.plsEnterMobile);
        break;
      case Validation.isEmpty(DOB.trim()):
        showErrorMessage(Strings.plsEnterDOB);
        break;
      case Validation.isEmpty(bio.trim()):
        showErrorMessage(Strings.plsEnterBio);
        break;
      default:
        setLoading(() => true, editProfileApiCall());
        break;
    }
  };

  const editGalleryImgHandler = () => {
    const tempData = [...dummyImgList];
    const editGalleryData = [...route.params?.userProfileData?.user_images];
    tempData.map((obj, ind) => {
      if (ind <= editGalleryData.length - 1) {
        obj.deleteId = editGalleryData[ind]?.id;
        obj.imgUrl = editGalleryData[ind]?.image;
      }
    });
    setDummyImgList(tempData);
  };

  const selectHandler = item => {
    const tempData = [...interestData];
    tempData.map(obj => {
      if (obj.id == item.id) {
        obj.isSelected = !obj.isSelected;
      } else {
        obj.isSelected = obj.isSelected;
      }
    });
    setInterestData(tempData);
  };

  const deSelectHandler = item => {
    const tempData = [...selectedInterestData];
    tempData.map(obj => {
      if (obj.id == item.id) {
        obj.selected = false;
      }
    });
    setSelectedInterestData(tempData);
    setInterestData(tempData);
    setSearchInterestData(tempData);
  };

  const continuePressHandler = item => {
    refRBSheet?.current?.close();
    const tempData = item.map(obj => {
      obj.selected = obj.isSelected;
      return obj;
    });
    setSelectedInterestData(tempData);
  };

  const openInterestList = () => {
    setSearch('');
    const tempData = [...selectedInterestData];
    tempData.map(obj => {
      obj.isSelected = obj.selected;
      return obj;
    });
    setInterestData(tempData);
    setSearchInterestData(tempData);
    refRBSheet.current.open();
  };

  const cameraHandler = () => {
    let options = {
      mediaType: 'photo',
      quality: 0.5,
    };
    launchCamera(options, response => {
      if ('assets' in response) {
        if (selectedUploadType == 'profile') {
          const tempObj = {
            uri: response?.assets[0]?.uri,
            type: response?.assets[0]?.type,
            name: response?.assets[0]?.fileName,
          };
          setImgObject(tempObj);
          setSelectedImg(response?.assets[0]?.uri);
        } else {
          const tempData = [...dummyImgList];
          tempData.map(obj => {
            if (obj?.id == Number(selectedUploadType + 1)) {
              const tempObj = {
                uri: response?.assets[0]?.uri,
                type: response?.assets[0]?.type,
                name: response?.assets[0]?.fileName,
              };
              obj.imgMultiPartData = tempObj;
              obj.imgUrl = response?.assets[0]?.uri;
              obj.imgUploaded = true;
            }
          });
          setDummyImgList(tempData);
        }
      } else {
        logDisplay('User cancelled image picker');
      }
    });
  };

  const galleryHandler = () => {
    let options = {
      mediaType: 'photo',
      quality: 0.5,
    };
    launchImageLibrary(options, response => {
      if ('assets' in response) {
        if (selectedUploadType == 'profile') {
          const tempObj = {
            uri: response?.assets[0]?.uri,
            type: response?.assets[0]?.type,
            name: response?.assets[0]?.fileName,
          };
          setImgObject(tempObj);
          setSelectedImg(response?.assets[0]?.uri);
        } else {
          const tempData = [...dummyImgList];
          tempData.map(obj => {
            if (obj?.id == Number(selectedUploadType + 1)) {
              const tempObj = {
                uri: response?.assets[0]?.uri,
                type: response?.assets[0]?.type,
                name: response?.assets[0]?.fileName,
              };
              obj.imgMultiPartData = tempObj;
              obj.imgUrl = response?.assets[0]?.uri;
              obj.imgUploaded = true;
            }
          });
          setDummyImgList(tempData);
        }
      } else {
        logDisplay('User cancelled image picker');
      }
    });
  };

  const removeGalleryImgHandler = item => {
    const tempData = [...dummyImgList];
    tempData.map(obj => {
      if (obj?.id == item?.id) {
        obj.imgMultiPartData = null;
        obj.imgUrl = '';
        obj.imgUploaded = false;
      }
    });
    tempData
      .sort(
        (a, b) => Validation.isEmpty(a.imgUrl) - Validation.isEmpty(b.imgUrl),
      )
      .map((obj, ind) => {
        obj.id = ind + 1;
      });
    setDummyImgList(tempData);
  };

  const onSelect = item => {
    setCountryCode(item.dial_code);
    setCountrySelectedFalg(item?.code);
    setShowCountryPicker(false);
  };

  const LeftCustomIcon = useCallback(
    () => (
      <Pressable
        onPress={() => setShowCountryPicker(true)}
        style={styles.customIconContainer}>
        <View style={styles.flagContainer}>
          <CountryFlag
            style={{
              borderRadius: 3,
            }}
            isoCode={countrySelectedFalg}
            size={15}
          />
        </View>
        <Text style={{marginHorizontal: scale(5)}}>{countryCode}</Text>
        <Image
          resizeMode="contain"
          style={styles.downArrowPickerIcon}
          source={ImageView.downArrow}
        />
      </Pressable>
    ),
    [countryCode, countrySelectedFalg],
  );

  const ProfileSetupView = () => (
    <View style={{flex: 1, padding: scale(20)}}>
      <View style={styles.profileUploadContainer}>
        <View>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setSelectedUploadType('profile');
              refOptionRBSheet.current.open();
            }}
            style={styles.cameraIconContainer}>
            <Image
              resizeMode="contain"
              style={styles.cameraIcon}
              source={ImageView.camera}
            />
          </Pressable>
          {Validation.isEmpty(selectedImg) ? (
            <View style={styles.profileImgContainer}>
              <Image
                resizeMode="contain"
                style={styles.profileIcon}
                source={ImageView.profileSecond}
              />
            </View>
          ) : (
            <Image
              style={styles.profileImgContainer}
              source={{uri: selectedImg}}
            />
          )}
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors.separator,
          height: 0.5,
        }}
      />
      <View style={{marginTop: scale(20)}}>
        <View style={styles.fLNameContainer}>
          <TextInputComponent
            blurOnSubmit={false}
            inputTxtStyl={{
              color: Validation.isEmpty(fName)
                ? colors.darkGreyishNavy2
                : colors.darkGreyishNavy,
              fontSize: Validation.isEmpty(fName)
                ? moderateScale(14)
                : moderateScale(16),
            }}
            placeholder={Strings.entFName}
            value={fName}
            container={[
              {flex: 0.48},
              inputFocus == Strings.entFName
                ? {borderColor: colors.primary_color}
                : null,
            ]}
            onFocus={() => {
              setInputFocus(Strings.entFName);
            }}
            onBlur={() => {
              setInputFocus('');
            }}
            onChangeText={text => setFName(text)}
            onSubmitEditing={() => {
              lNameRef.current.focus();
            }}
            returnKeyType={'next'}
          />
          <TextInputComponent
            blurOnSubmit={false}
            inputTxtStyl={{
              color: Validation.isEmpty(lName)
                ? colors.darkGreyishNavy2
                : colors.darkGreyishNavy,
              fontSize: Validation.isEmpty(lName)
                ? moderateScale(14)
                : moderateScale(16),
            }}
            placeholder={Strings.entLName}
            value={lName}
            container={[
              {flex: 0.48},
              inputFocus == Strings.entLName
                ? {borderColor: colors.primary_color}
                : null,
            ]}
            onFocus={() => {
              setInputFocus(Strings.entLName);
            }}
            onBlur={() => {
              setInputFocus('');
            }}
            onChangeText={text => setLName(text)}
            onSubmitEditing={() => {
              emailRef.current.focus();
            }}
            inputRef={lNameRef}
            returnKeyType={'next'}
          />
        </View>
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          blurOnSubmit={false}
          inputTxtStyl={{
            color: Validation.isEmpty(email)
              ? colors.darkGreyishNavy2
              : colors.darkGreyishNavy,
            fontSize: Validation.isEmpty(email)
              ? moderateScale(14)
              : moderateScale(16),
          }}
          placeholder={Strings.entEmail}
          value={email}
          container={
            inputFocus == Strings.entEmail
              ? {borderColor: colors.primary_color}
              : null
          }
          onFocus={() => {
            setInputFocus(Strings.entEmail);
          }}
          onBlur={() => {
            setInputFocus('');
          }}
          keyboardType="email-address"
          onChangeText={text => setEmail(text)}
          onSubmitEditing={() => {
            mobileNoRef.current.focus();
          }}
          inputRef={emailRef}
          returnKeyType={'next'}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          inputTxtStyl={{
            color: Validation.isEmpty(mobileNo)
              ? colors.darkGreyishNavy2
              : colors.darkGreyishNavy,
            fontSize: Validation.isEmpty(mobileNo)
              ? moderateScale(14)
              : moderateScale(16),
          }}
          placeholder={Strings.entMobileNo}
          value={mobileNo}
          container={
            inputFocus == Strings.entMobileNo
              ? {borderColor: colors.primary_color}
              : null
          }
          onFocus={() => {
            setInputFocus(Strings.entMobileNo);
          }}
          onBlur={() => {
            setInputFocus('');
          }}
          keyboardType="number-pad"
          onChangeText={text => setMobileNo(text)}
          inputRef={mobileNoRef}
          returnKeyType={'done'}
          leftCustomIcon={LeftCustomIcon()}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          onPress={() => {
            Keyboard.dismiss();
            setShowDatePicker(true);
          }}
          editable={false}
          rightIcon={ImageView.calendar}
          value={Validation.isEmpty(DOB) ? Strings.DOB : DOB}
          placeholder={Strings.DOB}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <TextInputComponent
          inputTxtStyl={[
            styles.bioInputTxtStyl,
            {
              color: Validation.isEmpty(bio)
                ? colors.darkGreyishNavy2
                : colors.darkGreyishNavy,
              fontSize: Validation.isEmpty(bio)
                ? moderateScale(14)
                : moderateScale(16),
            },
          ]}
          textAlignVertical="top"
          placeholder={Strings.bio}
          value={bio}
          onChangeText={text => setBio(text)}
          multiline={true}
        />
        <View style={styles.heightBox} />
        <View style={styles.heightBox} />
        <View
          display={interestData && interestData.length == 0 ? 'none' : 'flex'}
          style={styles.interestContainer}>
          <FlatList
            data={selectedInterestData}
            style={{flex: 1, marginEnd: scale(10)}}
            keyExtractor={item => item?.id}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            horizontal
            renderItem={renderIntrestList}
          />
          <Pressable onPress={() => openInterestList()}>
            <Image
              resizeMode="contain"
              style={styles.downArrowIcon}
              source={ImageView.dropDown}
            />
          </Pressable>
        </View>
        <View style={styles.heightBox} />
        <View
          style={{
            backgroundColor: colors.separator,
            height: 0.5,
            marginTop: scale(10),
            marginBottom: scale(5),
          }}
        />
        <View>
          <ProfileImgList
            removeImg={item => setLoading(() => true, deleteImgApICall(item))}
            uploadImg={id => {
              Keyboard.dismiss();
              setSelectedUploadType(id);
              refOptionRBSheet.current.open();
            }}
            listImgData={dummyImgList}
          />
        </View>
        {/* <ButtonComponent
          container={{backgroundColor: colors.darkBlue}}
          btnLabelTxt={{color: colors.white}}
          onBtnPress={() => {
            checkValidation();
          }}
          btnLabel={Strings.update}
        /> */}
      </View>
    </View>
  );

  const renderIntrestList = ({item}) =>
    item?.selected && (
      <Pressable
        onPress={() => {
          deSelectHandler(item);
        }}
        style={styles.interestItemContainer}>
        <Text style={styles.interestTxt}>{item?.name}</Text>
        <Image
          resizeMode="contain"
          style={styles.closeIcon}
          source={ImageView.close}
        />
      </Pressable>
    );

  const ModalContentView = () => (
    <View
      style={{
        flexDirection: 'row',
        alignSelf: 'center',
        flex: 1,
      }}>
      <View
        style={{
          width: scale(100),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Pressable
          onPress={() => {
            refOptionRBSheet.current.close();
            setTimeout(() => {
              cameraHandler();
            }, 500);
          }}
          style={styles.modalcIcon}>
          <Image
            resizeMode="contain"
            source={ImageView.chooseCamera}
            style={styles.cameraGalleryIcon}
          />
        </Pressable>
        <Text style={styles.choseTxt}>{'Camera'}</Text>
      </View>
      <View
        style={{
          width: scale(100),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Pressable
          onPress={() => {
            refOptionRBSheet.current.close();
            setTimeout(() => {
              galleryHandler();
            }, 500);
          }}
          style={styles.modalcIcon}>
          <Image
            resizeMode="contain"
            source={ImageView.chooseGallery}
            style={styles.cameraGalleryIcon}
          />
        </Pressable>
        <Text style={styles.choseTxt}>{'Gallery'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIconPress={() => {
          Keyboard.dismiss();
          refDiscardRBSheet.current.open();
        }}
        leftIcon={ImageView.backIcon}
        rightIconPress={() => {
          checkValidation();
        }}
        rightIcon={ImageView.roundChecked}
        rightIconStyl={{tintColor: colors.white}}
        centerTxt={Strings.editProfile}
      />
      <CountryPicker
        enableModalAvoiding
        show={showCountryPicker}
        onBackdropPress={() => {
          setShowCountryPicker(false);
        }}
        onRequestClose={() => {
          setShowCountryPicker(false);
        }}
        pickerButtonOnPress={onSelect}
        style={{
          // Styles for whole modal [View]
          modal: {
            height: verticalScale(300),
          },
          // Styles for modal backdrop [View]
          backdrop: {},
          // Styles for bottom input line [View]
          line: {},
          // Styles for list of countries [FlatList]
          itemsList: {},
          // Styles for input [TextInput]
          textInput: {
            height: scale(50),
            borderRadius: 10,
            paddingHorizontal: scale(25),
          },
          // Styles for country button [TouchableOpacity]
          countryButtonStyles: {
            height: scale(50),
            borderRadius: 10,
          },
          // Styles for search message [Text]
          searchMessageText: {},
          // Styles for search message container [View]
          countryMessageContainer: {},
          // Flag styles [Text]
          flag: {},
          // Dial code styles [Text]
          dialCode: {
            fontSize: scale(13),
            fontFamily: appFonts.interRegular,
          },
          // Country name styles [Text]
          countryName: {
            fontSize: scale(13),
            fontFamily: appFonts.interRegular,
          },
        }}
      />
      <DatePicker
        modal
        theme="light"
        open={showDatePicker}
        mode={'date'}
        date={
          Validation.isEmpty(DOB)
            ? new Date()
            : new Date(
                moment(DOB, config.DOB_FORMAT).format(
                  config.BACKEND_DATE_FORMAT,
                ),
              )
        }
        maximumDate={new Date()}
        title={Strings.DOB}
        androidVariant={'iosClone'}
        onConfirm={date => {
          setDOB(moment(date).format(config.DOB_FORMAT));
          setShowDatePicker(false);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
      />
      <RBSheet
        ref={refDiscardRBSheet}
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
            refDiscardRBSheet.current.close();
            setTimeout(() => {
              navigation.goBack();
            }, 500);
          }}
          nagetiveBtnPress={() => {
            refDiscardRBSheet.current.close();
          }}
          titleMessage={Strings.discardChangesMsg}
        />
      </RBSheet>
      <RBSheet
        ref={refOptionRBSheet}
        height={verticalScale(150)}
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
        {ModalContentView()}
      </RBSheet>
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
          onPress={item => selectHandler(item)}
          bottomBtnPress={data => continuePressHandler(data)}
          search={search}
          onSearchChangeText={text => {
            setSearch(text);
          }}
          headerTag={Strings.interest}
          searchPlaceHolder={Strings.interest}
          listData={interestData}
          showBottomBtn
          showRightIcon
        />
      </RBSheet>
      <KeyboardAwareScrollView
        style={styles.container}
        bounces={false}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        {ProfileSetupView()}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  profileUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(20),
  },
  cameraIconContainer: {
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
    right: 0,
  },
  profileImgContainer: {
    backgroundColor: colors.pattensBlue,
    width: scale(100),
    height: scale(120),
    margin: scale(10),
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.19,
    shadowRadius: 5.62,
    elevation: 6,
  },
  profileIcon: {
    width: scale(50),
    height: scale(50),
  },
  cameraIcon: {
    width: scale(40),
    height: scale(40),
  },
  heightBox: {
    marginVertical: scale(4),
  },
  fLNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bioInputTxtStyl: {
    height: scale(150),
    paddingVertical: scale(10),
  },
  downArrowIcon: {
    width: scale(25),
    height: scale(25),
  },
  downArrowPickerIcon: {
    width: scale(10),
    height: scale(10),
  },
  interestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(55),
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    padding: scale(5),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
    paddingHorizontal: scale(10),
  },
  interestItemContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.whiteSmoke,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginEnd: scale(5),
    padding: scale(10),
    flexDirection: 'row',
    borderRadius: 12,
  },
  interestTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayMedium,
    color: colors.darkGreyishNavy,
    marginEnd: scale(5),
  },
  closeIcon: {
    width: scale(12),
    height: scale(12),
  },
  customIconContainer: {
    marginEnd: scale(10),
    borderRightWidth: 1,
    borderRightColor: '#0000001A',
    height: scale(25),
    alignItems: 'center',
    paddingEnd: scale(10),
    flexDirection: 'row',
  },
  flagContainer: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 8,
    borderRadius: 3,
  },
  modalcIcon: {
    width: scale(50),
    height: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(15),
  },
  cameraGalleryIcon: {
    width: scale(50),
    height: scale(50),
  },
  choseTxt: {
    fontFamily: appFonts.ralewayBold,
    color: colors.black,
    textAlign: 'center',
    fontSize: moderateScale(14),
    marginTop: scale(5),
  },
});

export default EditProfile;
