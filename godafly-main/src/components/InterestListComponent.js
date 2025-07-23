import {StyleSheet, Text, View, FlatList} from 'react-native';
import React from 'react';

import PropTypes from 'prop-types';
import {moderateScale, scale} from 'react-native-size-matters';

import {Strings} from '../utils/strings';
import appFonts from '../utils/appFonts';
import {colors} from '../utils/constants';

const InterestListComponent = props => {
  const renderIntrestList = ({item}) => (
    <View style={styles.interestItemContainer}>
      <Text style={styles.interestTxt}>{item?.interest?.name}</Text>
    </View>
  );

  return (
    <View style={{}}>
      <Text style={styles.headerTag}>{Strings.interest}</Text>
      <FlatList
        data={props.listData}
        contentContainerStyle={{paddingHorizontal: scale(20)}}
        style={{paddingVertical: scale(15)}}
        keyExtractor={item => item?.id}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        horizontal
        renderItem={renderIntrestList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerTag: {
    paddingHorizontal: scale(20),
    fontSize: moderateScale(16),
    fontFamily: appFonts.ralewayBold,
    color: colors.black,
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

InterestListComponent.propTypes = {
  listData: PropTypes.array,
};
InterestListComponent.defaultProps = {};

export default InterestListComponent;
