import React from 'react';
import {
  FlatList,
  RefreshControl,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import PropTypes from 'prop-types';
import {moderateScale, scale} from 'react-native-size-matters';

import EmptyMessageComponent from './EmptyMessageComponent';

import {colors, config} from '../utils/constants';
import {ImageView} from '../utils/imageView';
import appFonts from '../utils/appFonts';

const NotificationListComponent = props => {
  const renderNotificationList = ({item}) => (
    <Pressable
      onPress={() => props.onPress(item)}
      style={styles.listItemContainer}>
      <View
        style={{
          flex: 0.2,
          alignItems: 'center',
        }}>
        <Image
          resizeMode="contain"
          style={styles.notificationIcon}
          source={ImageView.notificationSecond}
        />
      </View>
      <View
        style={{
          flex: 0.6,
          paddingHorizontal: scale(5),
          justifyContent: 'space-between',
        }}>
        <Text style={styles.titleTxt}>{item?.push_title}</Text>
        <Text style={styles.descTxt}>{item?.push_message}</Text>
      </View>
      <View style={{flex: 0.2}}>
        <Text style={styles.timeTxt}>
          {config.getTimesagoUTCtoLocal(item?.created_at)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      contentContainerStyle={styles.listContentContianer}
      style={{flex: 1}}
      data={props.listData}
      keyExtractor={item => item?.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyMessageComponent />}
      ItemSeparatorComponent={() => <View style={{marginVertical: scale(8)}} />}
      renderItem={renderNotificationList}
      ListFooterComponent={props.LoadmoreSpinner}
      onEndReachedThreshold={0.05}
      onEndReached={props.onEndReached}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={props.refreshCall}
          tintColor={colors.primary_color}
          progressBackgroundColor={colors.appBGColor}
          colors={[colors.primary_color]}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContentContianer: {
    padding: scale(20),
  },
  listItemContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: scale(15),
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
  },
  notificationIcon: {
    width: scale(50),
    height: scale(50),
  },
  titleTxt: {
    fontFamily: appFonts.ralewayBold,
    fontSize: moderateScale(14),
    color: colors.darkBlue,
  },
  descTxt: {
    fontFamily: appFonts.ralewayRegular,
    fontSize: moderateScale(12),
    color: colors.suvaGrey,
  },
  timeTxt: {
    fontFamily: appFonts.ralewayRegular,
    fontSize: moderateScale(10),
    color: colors.suvaGrey,
    top: scale(5),
  },
});

NotificationListComponent.propTypes = {
  listData: PropTypes.any,
  onPress: PropTypes.func,
  LoadmoreSpinner: PropTypes.any,
  refreshCall: PropTypes.any,
  onEndReached: PropTypes.any,
};
NotificationListComponent.defaultProps = {};

export default NotificationListComponent;
