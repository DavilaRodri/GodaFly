import React from 'react';
import {StyleSheet, Text, View, Image, Pressable} from 'react-native';

import PropTypes from 'prop-types';
import {moderateScale, scale} from 'react-native-size-matters';

import {colors} from '../utils/constants';
import {ImageView} from '../utils/imageView';
import {Strings} from '../utils/strings';
import appFonts from '../utils/appFonts';

const SearchFlightLayoverComponent = props => {
  return (
    <View style={{padding: scale(20)}}>
      <View style={styles.roundContainer}>
        <View style={styles.absoluteSearchContainer}>
          <Pressable
            onPress={props.onSearchPress}
            style={styles.newSearchContainer}>
            <Image
              resizeMode="cover"
              source={ImageView.searchSecond}
              style={styles.searchIcon}
            />
            <Text style={styles.searchTxt}>{Strings.newSearch}</Text>
          </Pressable>
        </View>
        {props.leftImg == null ? null : (
          <Image style={styles.halfImg} source={props.leftImg} />
        )}
        {props.rightImg == null ? null : (
          <Image style={styles.halfImg} source={props.rightImg} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roundContainer: {
    borderRadius: 16,
    backgroundColor: colors.white,
    height: scale(150),
    flexDirection: 'row',
    overflow: 'hidden',
  },
  absoluteSearchContainer: {
    position: 'absolute',
    bottom: 15,
    zIndex: 1,
    right: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newSearchContainer: {
    backgroundColor: colors.primary_color,
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(40),
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfImg: {
    width: '50%',
    height: '100%',
  },
  searchIcon: {
    width: scale(30),
    height: scale(30),
    marginEnd: scale(5),
  },
  searchTxt: {
    fontSize: moderateScale(20),
    fontFamily: appFonts.ralewayBold,
    color: colors.white,
  },
});

SearchFlightLayoverComponent.propTypes = {
  leftImg: PropTypes.any,
  rightImg: PropTypes.any,
  onSearchPress: PropTypes.func,
};
SearchFlightLayoverComponent.defaultProps = {};

export default SearchFlightLayoverComponent;
