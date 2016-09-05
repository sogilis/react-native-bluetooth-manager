'use strict';

import { NativeAppEventEmitter, NativeModules } from 'react-native';
const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const didChangeState = (callback) => {
  var subscription = NativeAppEventEmitter.addListener(
    ReactNativeBluetooth.StateChanged,
    callback
  );

  ReactNativeBluetooth.notifyCurrentState();

  return function() {
    subscription.remove();
  };
};

export default {
  didChangeState,
};
