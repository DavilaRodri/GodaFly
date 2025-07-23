import React from 'react';
import {StyleSheet, Pressable, Text} from 'react-native';

import PropTypes from 'prop-types';
import {scale, moderateScale} from 'react-native-size-matters';

import {colors} from '../utils/constants';
import appFonts from '../utils/appFonts';

const ButtonComponent = props => {
  return (
    <Pressable
      onPress={props.onBtnPress}
      style={[styles.container, props.container]}>
      <Text numberOfLines={1} style={[styles.btnLabelTxt, props.btnLabelTxt]}>
        {props.btnLabel}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.goldenPoppy,
    borderRadius: 16,
    height: scale(45),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.btnShadowClr,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: scale(10),
  },
  btnLabelTxt: {
    fontFamily: appFonts.ralewayBold,
    color: colors.darkBlue,
    fontSize: moderateScale(18),
  },
});

ButtonComponent.propTypes = {
  container: PropTypes.object,
  container: PropTypes.object,
  btnLabelTxt: PropTypes.object,
  btnLabel: PropTypes.string,
  onBtnPress: PropTypes.func,
};
ButtonComponent.defaultProps = {
  container: styles.container,
  btnLabelTxt: styles.btnLabelTxt,
};

export default ButtonComponent;
