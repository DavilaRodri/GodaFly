import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import PropTypes from 'prop-types';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import {colors} from '../utils/constants';
import appFonts from '../utils/appFonts';

const HeaderComponent = props => {
  return (
    <View style={[styles.headerContainer, props.headerContainer]}>
      <View style={props.leftIconContainer}>
        {props.leftIcon == null ? null : (
          <Pressable
            style={{alignItems: 'center', justifyContent: 'center'}}
            onPress={props.leftIconPress}>
            <Image
              resizeMode="contain"
              style={[styles.iconStyl, props.leftIconStyl]}
              source={props.leftIcon}
            />
          </Pressable>
        )}
      </View>
      {props.centerCustomComponent !== null ? (
        props.centerCustomComponent
      ) : (
        <View style={props.centerContainer}>
          <Text style={[styles.headerTxt, props.headerTxt]}>
            {props.centerTxt}
          </Text>
        </View>
      )}
      <View
        style={{
          flex: 0.15,
          alignItems: 'flex-end',
        }}>
        {props.rightIcon == null ? null : (
          <Pressable
            // style={{alignItems: 'center', justifyContent: 'center'}}
            onPress={props.rightIconPress}>
            <Image
              resizeMode="contain"
              style={[styles.iconStyl, props.rightIconStyl]}
              source={props.rightIcon}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary_color,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: verticalScale(50),
    paddingHorizontal: scale(20),
  },
  iconStyl: {
    width: scale(30),
    height: scale(30),
  },
  headerTxt: {
    textAlign: 'center',
    fontFamily: appFonts.ralewayBold,
    color: colors.white,
    fontSize: moderateScale(18),
  },
  leftIconContainer: {
    flex: 0.15,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

HeaderComponent.propTypes = {
  headerContainer: PropTypes.object,
  leftIconStyl: PropTypes.object,
  rightIconStyl: PropTypes.object,
  headerTxt: PropTypes.object,
  leftIconContainer: PropTypes.object,
  centerContainer: PropTypes.object,
  centerCustomComponent: PropTypes.any,
  leftIcon: PropTypes.any,
  rightIcon: PropTypes.any,
  centerTxt: PropTypes.string,
  leftIconPress: PropTypes.func,
  rightIconPress: PropTypes.func,
};
HeaderComponent.defaultProps = {
  leftIconContainer: styles.leftIconContainer,
  centerContainer: styles.centerContainer,
  centerCustomComponent: null,
};

export default HeaderComponent;
