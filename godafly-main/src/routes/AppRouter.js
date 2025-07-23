import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FlashMessage from 'react-native-flash-message';

import Splash from '../screens/auth/Splash';
import Login from '../screens/auth/Login';
import CreateAccount from './../screens/auth/CreateAccount';
import ForgotPassword from '../screens/auth/ForgotPassword';
import SetupProfile from '../screens/auth/SetupProfile.js';
import BottomTabNavigation from './BottomTabNavigation';

const Stack = createNativeStackNavigator();

export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
        initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="SetupProfile" component={SetupProfile} />
        <Stack.Screen name="Home" component={BottomTabNavigation} />
      </Stack.Navigator>
      <FlashMessage position="bottom" />
    </NavigationContainer>
  );
}
