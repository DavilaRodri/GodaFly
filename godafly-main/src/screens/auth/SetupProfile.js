import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  Keyboard,
  SafeAreaView,
} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import RNExitApp from 'react-native-exit-app';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys, keyPref} from '../../service/ApiKeys';

import ButtonComponent from '../../components/ButtonComponent';
import SearchListComponent from '../../components/SearchListComponent';
import HeaderComponent from '../../components/HeaderComponent';
import ProfileImgList from '../../components/ProfileImgList';
import TextInputComponent from '../../components/TextInputComponent';
import LoadingComponent from '../../components/LoadingComponent';

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

const SetupProfile = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [interestData, setInterestData] = useState([]);
  const [searchInterestData, setSearchInterestData] = useState([]);
  const [selectedInterestData, setSelectedInterestData] = useState([]);
  const [search, setSearch] = useState('');
  const [dummyImgList, setDummyImgList] = useState(config.PROFILE_IMG_LIST);
  const [imgObject, setImgObject] = useState(null);
  const [selectedImg, setSelectedImg] = useState('');
  const [DOB, setDOB] = useState('');
  const [bio, setBio] = useState('');
  const [selectedUploadType, setSelectedUploadType] = useState('');

  const refRBSheet = useRef(null);
  const refOptionRBSheet = useRef(null);

  useFocusEffect(
    useCallback(() => {
      getInterestApiCall();
    }, []),
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
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
          setLoading(false);
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          var tempData = [...responseData];
          tempData.map(obj => {
            obj.isSelected = false;
            obj.selected = false;
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

  const setupProfileApiCall = async () => {
    const data = new FormData();
    if (imgObject != null) {
      data.append(ApiKeys.PROFILE_IMG, imgObject);
    }
    data.append(
      ApiKeys.DOB,
      config.convertLocalToUTC(
        DOB,
        config.DOB_FORMAT,
        config.BACKEND_DATE_FORMAT,
      ),
    );
    data.append(ApiKeys.BIO, bio);
    const tempInterestData = [...selectedInterestData];
    tempInterestData.map((obj, ind) => {
      if (obj.selected) {
        data.append(ApiKeys.INTEREST + '[' + ind + ']', obj.id);
      }
    });
    const tempGalleryImgData = [...dummyImgList];
    tempGalleryImgData.map((obj, ind) => {
      if (!Validation.isEmpty(obj.imgUrl)) {
        data.append(ApiKeys.USER_IMG + '[' + ind + ']', obj.imgMultiPartData);
      }
    });
    postServiceCall(ApiEndpoint.SETUP_PROFILE, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          showSuccessMessage(res?.message);
          Keyboard.dismiss();
          let getUserData = await config.getUserData();
          getUserData = {
            ...getUserData,
            is_complete_profile: 1,
          };
          await AsyncStorage.setItem(
            keyPref.USER_DATA,
            JSON.stringify(getUserData),
          );
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          }, 500);
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

  const checkValidation = () => {
    Keyboard.dismiss();
    switch (true) {
      case Validation.isEmpty(DOB.trim()):
        showErrorMessage(Strings.plsEnterDOB);
        break;
      case Validation.isEmpty(bio.trim()):
        showErrorMessage(Strings.plsEnterBio);
        break;
      default:
        setLoading(() => true, setupProfileApiCall());
        break;
    }
  };

  useBackHandler(() => {
    RNExitApp.exitApp();
    return true;
  });

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
            }
          });
          setDummyImgList(tempData);
        }
        refOptionRBSheet.current.close();
      } else {
        logDisplay('User cancelled image picker');
        refOptionRBSheet.current.close();
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
            }
          });
          setDummyImgList(tempData);
        }
        refOptionRBSheet.current.close();
      } else {
        logDisplay('User cancelled image picker');
        refOptionRBSheet.current.close();
      }
    });
  };

  const removeGalleryImgHandler = item => {
    const tempData = [...dummyImgList];
    tempData.map(obj => {
      if (obj?.id == item?.id) {
        obj.imgMultiPartData = null;
        obj.imgUrl = '';
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
      <View style={{marginTop: scale(20)}}>
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
          textAlignVertical="top"
          placeholder={Strings.bio}
          value={bio}
          onChangeText={text => setBio(text)}
          multiline={true}
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
        <View>
          <ProfileImgList
            removeImg={item => removeGalleryImgHandler(item)}
            uploadImg={id => {
              Keyboard.dismiss();
              setSelectedUploadType(id);
              refOptionRBSheet.current.open();
            }}
            listImgData={dummyImgList}
          />
        </View>
        <ButtonComponent
          onBtnPress={() => {
            checkValidation();
          }}
          btnLabel={Strings.continue}
        />
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
            cameraHandler();
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
            galleryHandler();
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
      <SafeAreaView style={{flex: 0, backgroundColor: colors.primary_color}} />
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
        <HeaderComponent
          leftIconPress={() => {
            Keyboard.dismiss();
            RNExitApp.exitApp();
          }}
          leftIcon={ImageView.backIcon}
          centerTxt={Strings.setupProfile}
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
        <KeyboardAwareScrollView
          style={styles.container}
          bounces={false}
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}>
          {ProfileSetupView()}
        </KeyboardAwareScrollView>
      </SafeAreaView>
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
  bioInputTxtStyl: {
    height: scale(150),
    paddingVertical: scale(10),
  },
  downArrowIcon: {
    width: scale(25),
    height: scale(25),
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

export default SetupProfile;
