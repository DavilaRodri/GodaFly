import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import PropTypes from 'prop-types';
import {moderateScale, scale} from 'react-native-size-matters';

import ProfileImgList from './ProfileImgList';

import {Strings} from '../utils/strings';
import appFonts from '../utils/appFonts';
import {colors} from '../utils/constants';

const GalleryListComponent = props => {
  return (
    <>
      <View
        display={props.showSeprator ? 'flex' : 'none'}
        style={{
          marginHorizontal: scale(20),
          backgroundColor: colors.separator,
          height: 0.5,
        }}
      />
      <View
        style={{
          padding: scale(20),
        }}>
        <Text style={styles.headerTag}>{Strings.gallery}</Text>
        <ProfileImgList
          uploadAlbImg={{
            height: scale(170),
            borderRadius: 20,
          }}
          onImgPress={props.onImgPress}
          verticalSpace={0}
          showNormalProfile
          listImgData={props.listData}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerTag: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayBold,
    color: colors.black,
    marginBottom: scale(20),
  },
  interestItemContainer: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.gray85,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginEnd: scale(15),
    height: scale(40),
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    borderRadius: 10,
  },
  interestTxt: {
    fontSize: moderateScale(14),
    fontFamily: appFonts.ralewayRegular,
    color: colors.black,
    opacity: 0.7,
  },
});

GalleryListComponent.propTypes = {
  listData: PropTypes.array,
  showSeprator: PropTypes.bool,
  onImgPress: PropTypes.func,
};
GalleryListComponent.defaultProps = {
  showSeprator: true,
};

export default GalleryListComponent;
