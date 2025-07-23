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

import {moderateScale, scale} from 'react-native-size-matters';
import {useBackHandler} from '@react-native-community/hooks';

import {postServiceCall} from '../../service/Webservices';
import {ApiEndpoint, ApiKeys} from '../../service/ApiKeys';

import HeaderComponent from '../../components/HeaderComponent';
import ButtonComponent from '../../components/ButtonComponent';
import InterestListComponent from '../../components/InterestListComponent';
import GalleryListComponent from '../../components/GalleryListComponent';
import TravelHistoryComponent from '../../components/TravelHistoryComponent';
import LoadingComponent from '../../components/LoadingComponent';

import {colors, config, showErrorMessage} from '../../utils/constants';
import {ImageView} from '../../utils/imageView';
import appFonts from '../../utils/appFonts';
import Validation from '../../utils/validation';

const OtherUserProfile = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState({});
  const [showZoomImg, setShowZoomImg] = useState(null);
  const [showZoomImgModal, setShowZoomImgModal] = useState(false);

  useEffect(() => {
    global.activeRouteName = '';
    setLoading(() => true, getUserDetailApiCall());
  }, []);

  useBackHandler(() => {
    if (showZoomImgModal) setShowZoomImgModal(false);
    else navigation.goBack();
    return true;
  });

  const getUserDetailApiCall = async () => {
    const data = new FormData();
    data.append(ApiKeys.ID, route.params?.userId);
    postServiceCall(ApiEndpoint.USER_DETAIL, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          setLoading(false);
          var responseData = Validation.isEmptyValue(res?.data, 'arr');
          const tempData = [...responseData?.travels];
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
          responseData = {
            ...responseData,
            travels: tempData,
          };
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

  const requestChatApiCall = async () => {
    const data = new FormData();
    data.append(ApiKeys.F_ID, userProfileData?.id);
    postServiceCall(ApiEndpoint.SEND_CHAT_REQUEST, data)
      .then(async response => {
        const res = response;
        if (res?.status == 200) {
          getUserDetailApiCall();
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
    <View style={{paddingVertical: scale(20), flex: 1}}>
      <View style={{paddingHorizontal: scale(20), flexDirection: 'row'}}>
        <View style={{flex: 0.37}}>
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
            flex: 0.63,
            justifyContent: 'space-evenly',
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
          <ButtonComponent
            onBtnPress={() =>
              userProfileData?.request_status == 'Request Chat'
                ? setLoading(() => true, requestChatApiCall())
                : userProfileData?.request_status == 'Chat Now'
                ? navigation.navigate('ChatHistory', {
                    threadData: userProfileData,
                    type: 'OP',
                  })
                : {}
            }
            container={[
              styles.statusBtnContianer,
              {
                backgroundColor:
                  userProfileData?.request_status == 'Requested'
                    ? colors.darkGray
                    : colors.darkBlue,
              },
            ]}
            btnLabelTxt={styles.btnLabelTxt}
            btnLabel={userProfileData?.request_status}
          />
        </View>
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
      {!Validation.isEmpty(userProfileData?.travels) && (
        <TravelHistoryComponent
          showSeprator={!Validation.isEmpty(userProfileData?.user_images)}
          listData={userProfileData?.travels}
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
          <Image
            resizeMode="cover"
            source={ImageView.close}
            style={styles.closeIcon}
          />
        </Pressable>
        <Image
          resizeMode="cover"
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
        leftIcon={ImageView.backIcon}
        leftIconPress={() => {
          navigation.goBack();
        }}
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
  },
  profileImgContainer: {
    backgroundColor: colors.pattensBlue,
    width: scale(100),
    height: scale(120),
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

export default OtherUserProfile;
