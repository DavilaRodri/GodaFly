import React from 'react';
import {
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Text,
  View,
} from 'react-native';

import PropTypes from 'prop-types';
import {scale, moderateScale} from 'react-native-size-matters';

import {colors} from '../utils/constants';
import appFonts from '../utils/appFonts';

const TextInputComponent = props => {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.container, props.container]}>
      {props.leftCustomIcon != null ? (
        props.leftCustomIcon
      ) : props?.leftIcon == '' ? null : (
        <View style={[styles.leftIconContainer, props.leftIconContainer]}>
          <Pressable onPress={props.onleftIconPress}>
            <Image
              resizeMode="contain"
              style={[styles.leftIconStyl, props.leftIconStyl]}
              source={props?.leftIcon}
            />
          </Pressable>
        </View>
      )}
      <View
        style={[
          styles.inputTextContainer,
          {
            flex:
              props?.leftIcon == '' && props?.rightIcon == ''
                ? 1
                : props?.leftIcon == '' || props?.rightIcon == ''
                ? 0.85
                : 0.7,
          },
          props.inputTextContainer,
        ]}>
        {props.label == null ? null : (
          <Text style={[styles.labelTxt, props.labelTxt]}>{props.label}</Text>
        )}
        {props.customCenterComponent != null ? (
          props.customCenterComponent
        ) : (
          <View style={{flexDirection: 'row'}}>
            {!props?.countrySelection ? null : (
              <Pressable
                onPress={props.onCountrySelectPress}
                style={[
                  styles.countrySelectionContainer,
                  props.countrySelectionContainer,
                ]}>
                <Text style={[styles.codeTxt, props.codeTxt]}>
                  {props.selectedCountryCode}
                </Text>
                {props.downArrow == null ? null : (
                  <Image
                    resizeMode="contain"
                    style={[styles.downArrowIconStyl, props.downArrowIconStyl]}
                    source={props?.downArrow}
                  />
                )}
              </Pressable>
            )}
            {!props.editable && props.editable != null ? (
              <View style={[styles.normalTxtStyl, props.normalTxtStyl]}>
                <Text style={[styles.normalTxt, props.normalTxt]}>
                  {props.value}
                </Text>
              </View>
            ) : (
              <TextInput
                {...props}
                numberOfLines={1}
                ref={props.inputRef}
                placeholderTextColor={colors.darkGreyishNavy}
                style={[styles.inputTxtStyl, props.inputTxtStyl]}
                value={props.value}
                onChangeText={props.onChangeText}
              />
            )}
          </View>
        )}
      </View>
      {props.rightCustomIcon != null ? (
        props.rightCustomIcon
      ) : props?.rightIcon == '' ? null : (
        <View style={[styles.rightIconContainer, props.rightIconContainer]}>
          <Pressable onPress={props.onRightIconPress}>
            <Image
              resizeMode="contain"
              style={[styles.rightIconStyl, props.rightIconStyl]}
              source={props?.rightIcon}
            />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
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
  inputTextContainer: {},
  labelTxt: {
    fontWeight: '600',
    fontFamily: appFonts.InterRegular,
    opacity: 0.6,
    color: colors.black,
    fontSize: scale(13),
  },
  inputTxtStyl: {
    fontFamily: appFonts.ralewayRegular,
    color: colors.darkGreyishNavy,
    fontSize: moderateScale(16),
    height: scale(40),
    flex: 1,
    padding: 0,
    width: '95%',
  },
  normalTxtStyl: {
    height: scale(40),
    flex: 1,
    padding: 0,
    justifyContent: 'center',
  },
  normalTxt: {
    fontFamily: appFonts.ralewayRegular,
    color: colors.darkGreyishNavy,
    fontSize: moderateScale(16),
  },
  rightIconContainer: {
    flex: 0.15,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  leftIconContainer: {
    flex: 0.15,
    justifyContent: 'center',
  },
  rightIconStyl: {
    width: scale(25),
    height: scale(25),
  },
  leftIconStyl: {
    width: scale(25),
    height: scale(25),
  },
  countrySelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  codeTxt: {
    marginRight: scale(5),
    fontFamily: appFonts.interRegular,
    color: colors.gray,
    fontSize: scale(16),
  },
  downArrowIconStyl: {
    width: scale(20),
    height: scale(20),
    marginRight: scale(5),
  },
});

TextInputComponent.propTypes = {
  container: PropTypes.object,
  inputTextContainer: PropTypes.object,
  inputTxtStyl: PropTypes.object,
  normalTxtStyl: PropTypes.object,
  rightIconStyl: PropTypes.object,
  leftIconContainer: PropTypes.object,
  rightIconContainer: PropTypes.object,
  downArrowIconStyl: PropTypes.object,
  countrySelectionContainer: PropTypes.object,
  leftIconStyl: PropTypes.object,
  codeTxt: PropTypes.object,
  normalTxt: PropTypes.string,
  value: PropTypes.string,
  countrySelection: PropTypes.bool,
  label: PropTypes.string,
  selectedCountryCode: PropTypes.string,
  onChangeText: PropTypes.func,
  onCountrySelectPress: PropTypes.func,
  onRightIconPress: PropTypes.func,
  onPress: PropTypes.func,
  onleftIconPress: PropTypes.func,
  editable: PropTypes.bool,
  customCenterComponent: PropTypes.any,
  leftCustomIcon: PropTypes.any,
  rightCustomIcon: PropTypes.any,
  rightIcon: PropTypes.any,
  inputRef: PropTypes.any,
  downArrow: PropTypes.any,
  leftIcon: PropTypes.any,
};
TextInputComponent.defaultProps = {
  container: styles.container,
  inputTextContainer: styles.inputTextContainer,
  inputTxtStyl: styles.inputTxtStyl,
  normalTxtStyl: styles.normalTxtStyl,
  rightIconContainer: styles.rightIconContainer,
  leftIconContainer: styles.leftIconContainer,
  rightIconStyl: styles.rightIconStyl,
  leftIconStyl: styles.leftIconStyl,
  countrySelectionContainer: styles.countrySelectionContainer,
  downArrowIconStyl: styles.downArrowIconStyl,
  codeTxt: styles.codeTxt,
  rightIcon: '',
  leftIcon: '',
  countrySelection: false,
};

export default TextInputComponent;
