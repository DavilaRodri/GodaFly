import React from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';

import {moderateScale, scale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

import {colors} from '../utils/constants';
import appFonts from '../utils/appFonts';

const TopTabBarComponent = props => {
  return (
    <View style={props.container}>
      <View style={styles.roundContainer}>
        <Pressable
          onPress={() => props.onTabPress(true)}
          style={[
            styles.tabContainer,
            {backgroundColor: props.selectedTab ? colors.darkBlue : null},
          ]}>
          <Text
            style={
              !props.selectedTab ? styles.deSelectedTxt : styles.selectedTxt
            }>
            {props.titleOne}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => props.onTabPress(false)}
          style={[
            styles.tabContainer,
            {backgroundColor: !props.selectedTab ? colors.darkBlue : null},
          ]}>
          <Text
            style={
              !props.selectedTab ? styles.selectedTxt : styles.deSelectedTxt
            }>
            {props.titleSecond}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roundContainer: {
    backgroundColor: colors.lightRed,
    borderColor: colors.whisper,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: scale(15),
    paddingVertical: scale(5),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  tabContainer: {
    marginVertical: scale(2),
    flex: 0.45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(10),
  },
  selectedTxt: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(14),
    textAlign: 'center',
    color: colors.white,
  },
  deSelectedTxt: {
    fontFamily: appFonts.ralewayRegular,
    fontSize: moderateScale(14),
    textAlign: 'center',
    color: colors.black,
    opacity: 0.5,
  },
});

TopTabBarComponent.propTypes = {
  container: PropTypes.object,
  onTabPress: PropTypes.func,
  titleOne: PropTypes.string,
  titleSecond: PropTypes.string,
  selectedTab: PropTypes.bool,
};
TopTabBarComponent.defaultProps = {};

export default TopTabBarComponent;
