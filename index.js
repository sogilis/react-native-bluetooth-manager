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

const DefaultScanOptions = {
  uuids: [],
  timeout: 10000,
};

const Scan = {
  stopAfter: (timeout) => {
    return new Promise(resolve => {
      setTimeout(() => {
        ReactNativeBluetooth.stopScan()
          .then(resolve)
          .catch(console.log.bind(console));
      }, timeout);
    })
  }
}

const startScan = (customOptions = {}) => {
  let options = Object.assign({}, DefaultScanOptions, customOptions);

  return ReactNativeBluetooth.startScan(options.uuids).then(() => Scan);
}

const didDiscoverDevice = (callback) => {
  var subscription = NativeAppEventEmitter.addListener(
    ReactNativeBluetooth.DeviceDiscovered,
    callback
  );

  return function() {
    subscription.remove();
  };
};

export default {
  didChangeState,
  startScan,
  didDiscoverDevice,
};
