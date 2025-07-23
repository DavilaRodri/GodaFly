import React, {useEffect} from 'react';
import {
  LogBox,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  StatusBar,
} from 'react-native';

import {enableScreens} from 'react-native-screens';

import Router from './routes/AppRouter';
import ContextProvider from './contextAPI/contextProvider';

import {colors} from './utils/constants';
var EventEmitter = require('events');

global.pushType;
global.activeRouteName;
export var events = new EventEmitter();

const App = () => {
  useEffect(() => {
    LogBox.ignoreAllLogs();
    if (Platform.OS === 'ios') enableScreens(false);
    // Below code is use solving the font scale issue
    if (Text.defaultProps == null) Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
    if (TextInput.defaultProps == null) TextInput.defaultProps = {};
    TextInput.defaultProps.allowFontScaling = false;
  }, []);

  return (
    <ContextProvider>
      <StatusBar
        backgroundColor={colors.primary_color}
        barStyle="light-content"
      />
      <Router />
    </ContextProvider>
  );
};

const styles = StyleSheet.create({});

export default App;
