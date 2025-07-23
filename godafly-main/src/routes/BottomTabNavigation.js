import React from 'react';
import {SafeAreaView} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

import CustomTabBar from './CustomTabBar';
import Home from './../screens/home/Home';
import Travels from '../screens/travels/Travels';
import Profile from '../screens/profile/Profile';
import Chat from '../screens/chat/Chat';
import Search from '../screens/search/Search';
import Notification from '../screens/home/Notification';
import SearchResult from '../screens/search/SearchResult';
import OtherUserProfile from '../screens/search/OtherUserProfile';
import Settings from '../screens/profile/Settings';
import EditProfile from './../screens/profile/EditProfile';
import ChangePassword from './../screens/profile/ChangePassword';
import ChatHistory from '../screens/chat/ChatHistory';

import {colors} from '../utils/constants';

const Stack = createNativeStackNavigator();

const HomeStackScreen = ({navigation, route}) => {
  return (
    <Stack.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="NewSearch" component={Search} />
      <Stack.Screen name="SearchResult" component={SearchResult} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfile} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} />
    </Stack.Navigator>
  );
};

const TravelsStackScreen = ({navigation, route}) => {
  return (
    <Stack.Navigator
      initialRouteName={'Travels'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Travels" component={Travels} />
      <Stack.Screen name="NewSearch" component={Search} />
      <Stack.Screen name="SearchResult" component={SearchResult} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfile} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} />
    </Stack.Navigator>
  );
};

const SearchStackScreen = ({navigation, route}) => {
  return null;
};

const ChatStackScreen = ({navigation, route}) => {
  return (
    <Stack.Navigator
      initialRouteName={'Chat'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="NewSearch" component={Search} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} />
      <Stack.Screen name="SearchResult" component={SearchResult} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfile} />
    </Stack.Navigator>
  );
};

const ProfileStackScreen = ({navigation, route}) => {
  return (
    <Stack.Navigator
      initialRouteName={'Profile'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="NewSearch" component={Search} />
      <Stack.Screen name="SearchResult" component={SearchResult} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfile} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

export default function BottomTabNavigation({navigation}) {
  return (
    <>
      <SafeAreaView style={{flex: 0, backgroundColor: colors.primary_color}} />
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          initialRouteName="Home"
          screenOptions={({route}) => ({
            headerShown: false,
            tabBarShowLabel: false,
            unmountOnBlur: false,
            tabBarHideOnKeyboard: true,
          })}>
          <Tab.Screen
            name="Home"
            component={HomeStackScreen}
            options={({route}) => ({
              tabBarStyle: (route => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
                if (routeName !== 'Home') {
                  return {display: 'none'};
                }
                return {display: 'flex'};
              })(route),
              unmountOnBlur: true,
            })}
          />
          <Tab.Screen
            name="Travels"
            component={TravelsStackScreen}
            options={({route}) => ({
              tabBarStyle: (route => {
                const routeName =
                  getFocusedRouteNameFromRoute(route) ?? 'Travels';
                if (routeName !== 'Travels') {
                  return {display: 'none'};
                }
                return {display: 'flex'};
              })(route),
            })}
          />
          <Tab.Screen
            name="Search"
            component={SearchStackScreen}
            options={({route}) => ({
              tabBarStyle: (route => {
                return {display: 'none'};
              })(route),
            })}
          />
          <Tab.Screen
            name="Chat"
            component={ChatStackScreen}
            options={({route}) => ({
              tabBarStyle: (route => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? 'Chat';
                if (routeName !== 'Chat') {
                  return {display: 'none'};
                }
                return {display: 'flex'};
              })(route),
            })}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileStackScreen}
            options={({route}) => ({
              tabBarStyle: (route => {
                const routeName =
                  getFocusedRouteNameFromRoute(route) ?? 'Profile';
                if (routeName !== 'Profile') {
                  return {display: 'none'};
                }
                return {display: 'flex'};
              })(route),
            })}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </>
  );
}
