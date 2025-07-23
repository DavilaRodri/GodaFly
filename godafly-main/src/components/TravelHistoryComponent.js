import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {moderateScale, scale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

import ListFlightLayoverComponent from './ListFlightLayoverComponent';

import {Strings} from '../utils/strings';
import appFonts from '../utils/appFonts';
import {colors} from '../utils/constants';
import {ImageView} from '../utils/imageView';

const TravelHistoryComponent = props => {
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
          paddingTop: scale(20),
        }}>
        <Text style={styles.headerTag}>{Strings.travelHistory}</Text>
        <ListFlightLayoverComponent
          onItemPress={() => {}}
          contentContainerStyle={{
            paddingVertical: scale(10),
          }}
          listData={props.listData}
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
    marginHorizontal: scale(20),
    marginBottom: scale(5),
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

TravelHistoryComponent.propTypes = {
  listData: PropTypes.array,
  showSeprator: PropTypes.bool,
};
TravelHistoryComponent.defaultProps = {
  showSeprator: true,
};

export default TravelHistoryComponent;
