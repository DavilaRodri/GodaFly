import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import PropTypes from 'prop-types';
import {moderateScale, scale} from 'react-native-size-matters';
import ButtonComponent from './ButtonComponent';
import {colors} from '../utils/constants';
import {Strings} from '../utils/strings';
import appFonts from '../utils/appFonts';

const ConfirmationPopupComponent = props => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.titleTxt}>{props.titleMessage}</Text>
      </View>
      <ButtonComponent
        onBtnPress={props.postiveBtnPress}
        container={styles.positiveBtnContianer}
        btnLabel={props.postiveTxt}
        btnLabelTxt={styles.positiveTxt}
      />
      {props.nagetiveBtnPress == null ? null : (
        <View>
          <Text
            suppressHighlighting
            onPress={props.nagetiveBtnPress}
            style={styles.nagetiveTxt}>
            {props.negativeTxt}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    padding: scale(20),
    paddingTop: 0,
  },
  positiveBtnContianer: {
    backgroundColor: colors.primary_color,
    width: scale(150),
    borderRadius: 10,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  titleTxt: {
    fontSize: moderateScale(20),
    fontFamily: appFonts.ralewayMedium,
    color: colors.black,
    textAlign: 'center',
  },
  positiveTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayMedium,
    color: colors.white,
  },
  nagetiveTxt: {
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayMedium,
    color: colors.black,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

ConfirmationPopupComponent.propTypes = {
  negativeTxt: PropTypes.string,
  positiveTxt: PropTypes.string,
  titleMessage: PropTypes.string,
  postiveBtnPress: PropTypes.func,
  nagetiveBtnPress: PropTypes.func,
};
ConfirmationPopupComponent.defaultProps = {
  negativeTxt: Strings.no,
  postiveTxt: Strings.yes,
};

export default ConfirmationPopupComponent;
