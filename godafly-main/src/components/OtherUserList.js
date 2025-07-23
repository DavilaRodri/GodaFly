import React from 'react';
import {StyleSheet, View, FlatList, Pressable, Image, Text} from 'react-native';

import {moderateScale, scale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

import EmptyMessageComponent from './EmptyMessageComponent';

import {ImageView} from '../utils/imageView';
import {colors, config} from '../utils/constants';
import appFonts from '../utils/appFonts';
import {Strings} from '../utils/strings';

const OtherUserList = props => {
  const renderPhotoAlbumListItem = ({item, index}) => (
    <Pressable
      onPress={() => props.onPress(item)}
      style={[
        styles.imgContianer,
        {
          marginLeft: index % 2 != 0 ? scale(10) : 0,
        },
      ]}>
      <View style={{backgroundColor: colors.pattensBlue, borderRadius: 11}}>
        <Pressable style={styles.imgCloseIconContainer} />
        <Pressable
          style={[
            styles.imgCloseIconContainer,
            {
              backgroundColor: colors.transparent,
              opacity: 1,
            },
          ]}>
          <Image
            resizeMode="cover"
            source={
              item?.user?.request_status == 'Chat Now'
                ? ImageView.activeChat
                : ImageView.chat
            }
            style={[styles.closeIcon]}
          />
        </Pressable>
        <Image
          resizeMode="cover"
          source={{uri: item?.user?.profile_image}}
          style={styles.uploadAlbImg}
        />
      </View>
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameTxt}>
          {item?.user?.first_name + ', ' + config.getDobYears(item?.user?.dob)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={props.listData}
      numColumns={2}
      contentContainerStyle={{
        paddingBottom: scale(20),
        paddingTop: scale(30),
        paddingHorizontal: scale(20),
      }}
      columnWrapperStyle={{
        marginBottom: scale(10),
        justifyContent: 'space-between',
      }}
      ListEmptyComponent={
        <EmptyMessageComponent
          emptyLabel={
            props.type == 'f' ? Strings.flightNoResult : Strings.layoverNoResult
          }
        />
      }
      keyExtractor={item => item?.id}
      showsVerticalScrollIndicator={false}
      bounces={false}
      renderItem={renderPhotoAlbumListItem}
    />
  );
};

const styles = StyleSheet.create({
  imgContianer: {
    backgroundColor: colors.white,
    paddingVertical: scale(5),
    width: scale(145),
    alignItems: 'center',
    borderRadius: 11,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
  },
  imgCloseIconContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 8,
    right: 8,
    width: scale(25),
    height: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(30),
    backgroundColor: colors.veryDark,
    opacity: 0.7,
  },
  closeIcon: {
    width: scale(18),
    height: scale(18),
  },
  uploadAlbImg: {
    width: scale(135),
    height: scale(125),
    borderRadius: 11,
  },
  photoAlbImg: {
    width: scale(60),
    height: scale(60),
  },
  usernameContainer: {
    width: '100%',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
  },
  usernameTxt: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(15),
    color: colors.midnight,
  },
});

OtherUserList.propTypes = {
  onPress: PropTypes.func,
  listData: PropTypes.array,
  type: PropTypes.string,
};
OtherUserList.defaultProps = {};

export default OtherUserList;
