'use strict';

import { NativeAppEventEmitter, NativeModules, NativeEventEmitter, Platform } from 'react-native';
const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const EventEmitter = Platform.OS === 'android' ? NativeAppEventEmitter :
  new NativeEventEmitter(ReactNativeBluetooth);

const unsubscription = (listener) => {
  return () => listener.remove();
};

const didChangeState = (callback) => {
  const listener = EventEmitter.addListener(
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
        // TODO: Check for connection first
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

const stopScan = () => {
  return ReactNativeBluetooth.stopScan();
};

const discoverServices = (device, callback) => {
  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.ServiceDiscovered,
    callback
  );

  ReactNativeBluetooth.discoverServices(device);

  return unsubscription(listener);
}

const connect = (device) => {
  return ReactNativeBluetooth.connect(device);
}

const disconnect = (device) => {
  return ReactNativeBluetooth.disconnect(device);
}

const didDiscoverDevice = (callback) => {
  return unsubscription(NativeAppEventEmitter.addListener(
    ReactNativeBluetooth.DeviceDiscovered,
    callback
  ));
};

export default {
  didChangeState,
  startScan,
  stopScan,
  didDiscoverDevice,
  discoverServices,
  connect,
  disconnect,
};
