import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {scale, moderateScale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

import appFonts from '../utils/appFonts';
import {colors} from '../utils/constants';
import {Strings} from '../utils/strings';

const EmptyMessageComponent = props => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(50),
      }}>
      <Text style={styles.emptyTxt}>{props.emptyLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyTxt: {
    textAlign: 'center',
    lineHeight: scale(20),
    fontSize: moderateScale(15),
    color: colors.black,
    fontFamily: appFonts.ralewayMedium,
  },
});

EmptyMessageComponent.propTypes = {
  emptyLabel: PropTypes.string,
};
EmptyMessageComponent.defaultProps = {
  emptyLabel: Strings.noResult,
};

export default EmptyMessageComponent;
