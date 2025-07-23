import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  ScrollView,
  View,
  Image,
  Pressable,
} from 'react-native';

import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import {getServiceCall} from '../../service/Webservices';
import {ApiEndpoint} from '../../service/ApiKeys';
import {useBackHandler} from '@react-native-community/hooks';

import HeaderComponent from '../../components/HeaderComponent';
import InterestListComponent from '../../components/InterestListComponent';
import GalleryListComponent from '../../components/GalleryListComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, config, showErrorMessage} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import appFonts from '../../utils/appFonts';
import {Strings} from '../../utils/strings';
import Validation from '../../utils/validation';

const Profile = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [showZoomImg, setShowZoomImg] = useState(null);
  const [showZoomImgModal, setShowZoomImgModal] = useState(false);

  useEffect(() => {
    setLoading(() => false, getProfileApiCall());
  }, []);

  useBackHandler(() => {
    if (showZoomImgModal) setShowZoomImgModal(false);
    else navigation.goBack();
    return true;
  });

  const getProfileApiCall = async () => {
    getServiceCall(ApiEndpoint.GET_PROFILE, '')
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          var responseData = Validation.isEmptyValue(res?.data, 'obj');
          setUserProfileData(responseData);
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

  const OtherUserDetailsView = () => (
    <View style={{flex: 1}}>
      <View
        style={{
          backgroundColor: colors.primary_color,
          height: verticalScale(150),
        }}>
        <View style={styles.profileImgMainContainer}>
          <View style={{flex: 0.45}}>
            <Pressable
              onPress={() => {
                setShowZoomImg(userProfileData?.profile_image);
                setShowZoomImgModal(true);
              }}
              style={styles.profileImgContainer}>
              <Image
                style={styles.profileIcon}
                source={{uri: userProfileData?.profile_image}}
              />
            </Pressable>
          </View>
          <View
            display={
              Validation.isEmpty(userProfileData?.first_name) ? 'none' : 'flex'
            }
            style={{
              flex: 0.55,
              paddingVertical: scale(35),
              justifyContent: 'flex-end',
            }}>
            <Text style={styles.usernameTxt}>
              {userProfileData?.first_name + ','}
              <Text
                style={[
                  styles.usernameTxt,
                  {fontFamily: appFonts.ralewayRegular},
                ]}>
                {' ' + config.getDobYears(userProfileData?.dob)}
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.roundBoxContianer} />
      </View>
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      <View
        display={Validation.isEmpty(userProfileData?.bio) ? 'none' : 'flex'}
        style={{paddingLeft: scale(20), paddingRight: scale(50)}}>
        <Text style={styles.userBioTxt}>{userProfileData?.bio}</Text>
      </View>
      <View style={styles.heightBox} />
      <View style={styles.heightBox} />
      {!Validation.isEmpty(userProfileData?.user_interests) && (
        <InterestListComponent listData={userProfileData?.user_interests} />
      )}
      {!Validation.isEmpty(userProfileData?.user_images) && (
        <GalleryListComponent
          onImgPress={img => {
            setShowZoomImg(img);
            setShowZoomImgModal(true);
          }}
          showSeprator={!Validation.isEmpty(userProfileData?.user_interests)}
          listData={userProfileData?.user_images}
        />
      )}
    </View>
  );

  const ZoomImgView = () => (
    <View style={styles.modalContainer}>
      <View
        style={[
          styles.uploadAlbImg,
          {
            borderRadius: 16,
            overflow: 'hidden',
          },
        ]}>
        <Pressable
          onPress={() => setShowZoomImgModal(false)}
          style={styles.imgCloseIconContainer}>
          <Image source={ImageView.close} style={styles.closeIcon} />
        </Pressable>
        <Image
          resizeMode="contain"
          source={{uri: showZoomImg}}
          style={styles.uploadAlbImg}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingComponent isVisible={loading} />
      <HeaderComponent
        leftIcon={ImageView.setting}
        leftIconPress={() => {
          navigation.navigate('Settings', {
            userProfileData,
            goBackHandler: () => {
              setLoading(() => true, getProfileApiCall());
            },
          });
        }}
        rightIcon={ImageView.editProfile}
        rightIconPress={() => {
          navigation.navigate('EditProfile', {
            userProfileData,
            goBackHandler: () => {
              setLoading(() => false, getProfileApiCall());
            },
          });
        }}
        centerTxt={Strings.profile}
      />
      <Modal
        transparent
        animationType="fade"
        visible={showZoomImgModal}
        onRequestClose={() => {
          setShowZoomImgModal(false);
        }}>
        {ZoomImgView()}
      </Modal>
      <ScrollView
        style={styles.container}
        bounces={false}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        {OtherUserDetailsView()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBGColor,
    paddingBottom: scale(55),
  },
  profileImgMainContainer: {
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'row',
    margin: scale(25),
    marginBottom: 0,
    bottom: 0,
  },
  profileImgContainer: {
    backgroundColor: colors.pattensBlue,
    width: scale(110),
    height: scale(130),
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.21,
    shadowRadius: 7.68,
    elevation: 10,
  },
  profileIcon: {
    borderRadius: 21,
    width: '100%',
    height: '100%',
  },
  usernameTxt: {
    fontSize: moderateScale(21),
    fontFamily: appFonts.ralewayBold,
    color: colors.black,
  },
  statusBtnContianer: {
    width: scale(120),
    height: scale(40),
    borderRadius: 16,
  },
  btnLabelTxt: {
    color: colors.white,
    fontSize: moderateScale(14),
  },
  heightBox: {
    marginVertical: scale(4),
  },
  userBioTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayRegular,
    color: colors.darkBlue,
    lineHeight: moderateScale(24),
  },
  roundBoxContianer: {
    position: 'absolute',
    bottom: -15,
    right: 0,
    left: 0,
    height: '70%',
    backgroundColor: colors.appBGColor,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAlbImg: {
    width: scale(300),
    height: scale(300),
    backgroundColor: colors.pattensBlue,
  },
  imgCloseIconContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 8,
    right: 8,
    backgroundColor: colors.primary_color,
    width: scale(25),
    height: scale(25),
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    tintColor: colors.white,
    width: scale(10),
    height: scale(10),
  },
});

export default Profile;
