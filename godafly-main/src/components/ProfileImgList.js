import React, {useState} from 'react';
import {StyleSheet, View, FlatList, Pressable, Image} from 'react-native';

import {scale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

import {ImageView} from '../utils/imageView';
import {colors} from '../utils/constants';
import Validation from '../utils/validation';

const ProfileImgList = props => {
  var getLastImgId = 0;

  const renderPhotoAlbumListItem = ({item, index}) => {
    if (!Validation.isEmpty(item?.imgUrl)) {
      getLastImgId = item?.id;
    }
    return props.showNormalProfile ? (
      <Pressable
        onPress={() => props.onImgPress(item?.image)}
        style={[
          {
            marginLeft: index % 2 != 0 ? scale(10) : 0,
            backgroundColor: colors.pattensBlue,
          },
          styles.uploadAlbImg,
          props.uploadAlbImg,
        ]}>
        <Image
          resizeMode="cover"
          source={{uri: item?.image}}
          style={[styles.uploadAlbImg, props.uploadAlbImg]}
        />
      </Pressable>
    ) : (
      <View>
        {!Validation.isEmpty(item?.imgUrl) ? (
          <View
            style={{
              marginLeft: index % 2 != 0 ? scale(10) : 0,
              backgroundColor: colors.pattensBlue,
              borderRadius: 16,
            }}>
            <Pressable
              onPress={() => props.removeImg(item)}
              style={styles.imgCloseIconContainer}>
              <Image
                resizeMode="cover"
                source={ImageView.closeSecond}
                style={[
                  styles.closeIcon,
                  {
                    padding: scale(10),
                  },
                ]}
              />
            </Pressable>
            <Image
              resizeMode="cover"
              source={{uri: item?.imgUrl}}
              style={[styles.uploadAlbImg, props.uploadAlbImg]}
            />
          </View>
        ) : (
          <Pressable
            onPress={() => props.uploadImg(getLastImgId)}
            style={[
              styles.photoAlbImgContainer,
              {
                marginLeft: index % 2 != 0 ? scale(10) : 0,
              },
            ]}>
            <Image
              resizeMode="contain"
              source={ImageView.addImg}
              style={styles.photoAlbImg}
            />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={props.listImgData}
      extraData={props.listImgData}
      numColumns={2}
      contentContainerStyle={{
        paddingVertical: props.verticalSpace,
      }}
      columnWrapperStyle={{
        marginBottom: scale(10),
        justifyContent: 'space-between',
      }}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      bounces={false}
      renderItem={renderPhotoAlbumListItem}
    />
  );
};

const styles = StyleSheet.create({
  imgCloseIconContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 8,
    right: 8,
  },
  closeIcon: {
    width: scale(15),
    height: scale(15),
  },
  photoAlbImgContainer: {
    width: scale(150),
    height: scale(140),
    backgroundColor: colors.lightGrayishBlue,
    borderWidth: 1,
    borderColor: colors.azureishWhite,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAlbImg: {
    width: scale(150),
    height: scale(140),
    borderRadius: 16,
  },
  photoAlbImg: {
    width: scale(60),
    height: scale(60),
  },
});

ProfileImgList.propTypes = {
  uploadAlbImg: PropTypes.object,
  showNormalProfile: PropTypes.bool,
  listImgData: PropTypes.array,
  verticalSpace: PropTypes.any,
  uploadImg: PropTypes.func,
  removeImg: PropTypes.func,
  onImgPress: PropTypes.func,
};
ProfileImgList.defaultProps = {
  showNormalProfile: false,
  uploadAlbImg: styles.uploadAlbImg,
  verticalSpace: scale(10),
};

export default ProfileImgList;
