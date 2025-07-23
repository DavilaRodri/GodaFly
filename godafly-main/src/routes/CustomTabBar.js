import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Keyboard,
  Platform,
} from 'react-native';

import {moderateScale, scale} from 'react-native-size-matters';

import {colors} from '../utils/constants';
import {ImageView} from '../utils/imageView';
import appFonts from '../utils/appFonts';

const CustomTabBar = ({state, descriptors, navigation}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let keyboardEventListeners;
    if (Platform.OS === 'android') {
      keyboardEventListeners = [
        Keyboard.addListener('keyboardDidShow', () => setVisible(true)),
        Keyboard.addListener('keyboardDidHide', () => setVisible(false)),
      ];
    }
    return () => {
      if (Platform.OS === 'android') {
        keyboardEventListeners &&
          keyboardEventListeners.forEach(eventListener =>
            eventListener.remove(),
          );
      }
    };
  }, []);
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  if (
    focusedOptions?.tabBarStyle?.display === 'none' ||
    (visible && Platform.OS == 'android')
  ) {
    return null;
  }

  return (
    <View style={styles.mainContainer}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        var iconName;
        var tabLabel;
        switch (route.name) {
          case 'Home':
            iconName = focused ? ImageView.activeHome : ImageView.home;
            tabLabel = 'Home';
            break;
          case 'Travels':
            iconName = focused ? ImageView.activeTravels : ImageView.travels;
            tabLabel = 'Travels';
            break;
          case 'Search':
            iconName = ImageView.searchTab;
            break;
          case 'Chat':
            iconName = focused ? ImageView.activeChat : ImageView.chat;
            tabLabel = 'Chat';
            break;
          case 'Profile':
            iconName = focused ? ImageView.activeProfile : ImageView.profile;
            tabLabel = 'Profile';
            break;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(
              route.name == 'Search' ? 'NewSearch' : route.name,
            );
          }
        };

        const TabIconComponent = () => (
          <View style={styles.tabBarIconContainer}>
            <Image
              source={iconName}
              style={{
                top: route.name == 'Search' ? -5 : 0,
                width: route.name == 'Search' ? scale(40) : scale(25),
                height: route.name == 'Search' ? scale(40) : scale(25),
              }}
              resizeMode="contain"
            />
            {route.name == 'Search' ? null : (
              <Text
                numberOfLines={1}
                style={[
                  styles.tabTxt,
                  {
                    color: focused ? colors.primary_color : colors.inActiveTab,
                  },
                ]}>
                {tabLabel}
              </Text>
            )}
          </View>
        );

        return (
          <View key={index} style={[styles.mainItemContainer]}>
            <Pressable onPress={onPress} style={{}}>
              {TabIconComponent()}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    position: 'absolute',
    paddingHorizontal: scale(10),
    backgroundColor: colors.white,
    bottom: 0,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scale(10),
  },
  tabBarIconContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scale(5),
    justifyContent: 'space-between',
  },
  tabTxt: {
    fontFamily: appFonts.ralewayMedium,
    fontSize: moderateScale(12),
    textAlign: 'center',
    paddingTop: scale(5),
  },
});

export default CustomTabBar;
