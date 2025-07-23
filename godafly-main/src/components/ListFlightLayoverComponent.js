import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';

import PropTypes from 'prop-types';
import {moderateScale, scale} from 'react-native-size-matters';

import EmptyMessageComponent from './EmptyMessageComponent';

import {colors, config} from '../utils/constants';
import {ImageView} from '../utils/imageView';
import appFonts from '../utils/appFonts';
import {Strings} from '../utils/strings';
import Validation from '../utils/validation';

const ListFlightLayoverComponent = props => {
  const renderListFlightLayoverItem = ({item, index}) => {
    return (
      <Pressable
        onPress={() => props.onItemPress(item, index)}
        style={[styles.roundContainer, props.roundContainer]}>
        <View style={styles.absoluteContentContainer}>
          <View style={styles.detailsContainer}>
            <Text numberOfLines={2} style={styles.topTxt}>
              {item?.type == 'Plane' ? Strings.flightTo : Strings.layoverIn}
            </Text>
            <Text numberOfLines={2} style={styles.titleTxt}>
              {item?.type == 'Plane'
                ? item?.end_iata_code
                : item?.city?.city_name}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.dateTxt,
                {
                  marginBottom: index == 1 ? scale(10) : 0,
                },
              ]}>
              {config.convertUTCToLocal(
                item?.date,
                config.BACKEND_DATE_FORMAT,
                config.DOB_FORMAT,
              )}
            </Text>
          </View>
        </View>
        {props.onDeletePress == null ? null : (
          <Pressable
            onPress={() => props.onDeletePress(item)}
            style={styles.absoluteDltContainer}>
            <Image style={styles.trashIcon} source={ImageView.trash} />
          </Pressable>
        )}
        <Image
          style={styles.fullImg}
          source={
            Validation.isEmpty(item?.city_image)
              ? item?.randomImg
              : {uri: item?.city_image}
          }
        />
      </Pressable>
    );
  };

  const ItemSeparatorComponent = () => (
    <View style={styles.separatorContainer} />
  );

  return (
    <FlatList
      data={props.listData}
      numColumns={2}
      contentContainerStyle={[
        {
          padding: scale(15),
          paddingBottom: scale(25),
        },
        props.contentContainerStyle,
      ]}
      columnWrapperStyle={{
        justifyContent: 'space-between',
      }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={props.refreshCall}
          tintColor={colors.primary_color}
          progressBackgroundColor={colors.appBGColor}
          colors={[colors.primary_color]}
        />
      }
      ListEmptyComponent={<EmptyMessageComponent />}
      ItemSeparatorComponent={ItemSeparatorComponent()}
      keyExtractor={item => item?.id}
      showsVerticalScrollIndicator={false}
      renderItem={renderListFlightLayoverItem}
      ListFooterComponent={props.LoadmoreSpinner}
      onEndReachedThreshold={0.05}
      onEndReached={props.onEndReached}
    />
  );
};

const styles = StyleSheet.create({
  roundContainer: {
    borderRadius: 16,
    backgroundColor: colors.white,
    flex: 0.49,
    height: scale(230),
    flexDirection: 'row',
    overflow: 'hidden',
  },
  absoluteContentContainer: {
    position: 'absolute',
    top: 15,
    zIndex: 1,
    right: 0,
    left: 0,
    paddingHorizontal: scale(10),
  },
  detailsContainer: {
    backgroundColor: colors.transparent,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  absoluteDltContainer: {
    position: 'absolute',
    zIndex: 1,
    right: 7,
    bottom: 7,
    padding: scale(3),
  },
  trashIcon: {
    width: scale(20),
    height: scale(20),
  },
  fullImg: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.pattensBlue,
  },
  separatorContainer: {
    marginVertical: scale(5),
  },
  topTxt: {
    fontSize: moderateScale(18),
    fontFamily: appFonts.ralewayRegular,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.7,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5,
  },
  titleTxt: {
    fontSize: moderateScale(23),
    fontFamily: appFonts.ralewayBold,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5,
  },
  dateTxt: {
    fontSize: moderateScale(15),
    fontFamily: appFonts.ralewayMedium,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5,
  },
  arrivalDeptTxt: {
    fontSize: moderateScale(13),
    fontFamily: appFonts.ralewayRegular,
    color: colors.white,
  },
});

ListFlightLayoverComponent.propTypes = {
  roundContainer: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  listData: PropTypes.any,
  refreshCall: PropTypes.any,
  img: PropTypes.any,
  LoadmoreSpinner: PropTypes.any,
  onEndReached: PropTypes.any,
  onDeletePress: PropTypes.func,
};
ListFlightLayoverComponent.defaultProps = {};

export default ListFlightLayoverComponent;
