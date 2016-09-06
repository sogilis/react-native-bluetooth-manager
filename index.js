'use strict';

import { NativeAppEventEmitter, NativeModules } from 'react-native';
const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const unsubscription = (listener) => {
  return () => listener.remove();
};

const didChangeState = (callback) => {
  var listener = NativeAppEventEmitter.addListener(
    ReactNativeBluetooth.StateChanged,
    callback
  );

  ReactNativeBluetooth.notifyCurrentState();

  return unsubscription(listener);
};

const DefaultScanOptions = {
  uuids: [],
};

const Scan = {
  stopAfter: (timeout) => {
    return new Promise(resolve => {
      setTimeout(() => {
        ReactNativeBluetooth.stopScan()
          .then(resolve)
          .catch(console.log.bind(console));
      }, timeout);
    });
  },
};

const startScan = (customOptions = {}) => {
  let options = Object.assign({}, DefaultScanOptions, customOptions);

  return ReactNativeBluetooth.startScan(options.uuids).then(() => Scan);
};

const didDiscoverDevice = (callback) => {
  return unsubscription(NativeAppEventEmitter.addListener(
    ReactNativeBluetooth.DeviceDiscovered,
    callback
  ));
};

export default {
  didChangeState,
  startScan,
  didDiscoverDevice,
};
