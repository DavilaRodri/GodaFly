import React from 'react';
import {FlatList, Image, StyleSheet, Text, View, Pressable} from 'react-native';

import {moderateScale, scale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

import ButtonComponent from './ButtonComponent';
import TextInputComponent from './TextInputComponent';

import {Strings} from '../utils/strings';
import {ImageView} from '../utils/imageView';
import appFonts from '../utils/appFonts';
import {colors} from '../utils/constants';

const SearchListComponent = props => {
  const renderModalIntrestList = ({item, index}) => (
    <Pressable
      onPress={() => props.onPress(item)}
      style={styles.listItemContainer}>
      <Text style={styles.tagTxt}>{item?.name}</Text>
      {props.showRightIcon && (
        <Image
          resizeMode="contain"
          style={styles.checkedIcon}
          source={
            item?.isSelected ? ImageView.roundChecked : ImageView.roundUnchecked
          }
        />
      )}
    </Pressable>
  );

  return (
    <View style={{flex: 1}}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitleTxt}>{props.headerTag}</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <TextInputComponent
          value={props.search}
          onChangeText={props.onSearchChangeText}
          placeholder={props.searchPlaceHolder}
          rightIcon={ImageView.search}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.listContentContianer}
        style={{flex: 1}}
        data={props.listData}
        keyExtractor={item => item?.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{marginVertical: scale(8)}} />
        )}
        bounces={false}
        renderItem={renderModalIntrestList}
      />
      <View
        display={props.showBottomBtn ? 'flex' : 'none'}
        style={styles.btnContainer}>
        <ButtonComponent
          onBtnPress={() => props.bottomBtnPress(props.listData)}
          btnLabel={Strings.continue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    height: null,
    minHeight: scale(45),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(5),
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
  headerContainer: {
    paddingHorizontal: scale(20),
    alignItems: 'center',
    marginVertical: scale(10),
  },
  headerTitleTxt: {
    fontFamily: appFonts.ralewayBold,
    fontSize: moderateScale(18),
    textAlign: 'center',
    color: colors.black,
  },
  searchBarContainer: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
  },
  listContentContianer: {
    padding: scale(20),
    paddingVertical: scale(30),
  },
  btnContainer: {
    paddingBottom: scale(20),
    paddingHorizontal: scale(20),
  },
  checkedIcon: {
    width: scale(20),
    height: scale(20),
  },
  tagTxt: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(14),
    color: colors.darkGreyishNavy,
  },
});

SearchListComponent.propTypes = {
  showBottomBtn: PropTypes.bool,
  showRightIcon: PropTypes.bool,
  searchPlaceHolder: PropTypes.string,
  search: PropTypes.string,
  headerTag: PropTypes.string,
  listData: PropTypes.array,
  onPress: PropTypes.func,
  bottomBtnPress: PropTypes.func,
  onSearchChangeText: PropTypes.func,
};
SearchListComponent.defaultProps = {};

export default SearchListComponent;
