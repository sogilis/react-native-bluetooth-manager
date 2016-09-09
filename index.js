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
        stopScan()
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

const discoverServices = (device, serviceIds, callback) => {
  return new Promise((resolve, reject) => {
    const listener = EventEmitter.addListener(
      ReactNativeBluetooth.ServiceDiscovered,
      callback
    );

    let startupListener;

    const onStartedCaught = detail => {
      if ("error" in detail) {
        reject(detail["error"]);
        return;
      }

      if (startupListener) {
        startupListener.remove();
      }
    }

    startupListener = EventEmitter.addListener(
      ReactNativeBluetooth.ServiceDiscoveryStarted,
      onStartedCaught
    );

    ReactNativeBluetooth.discoverServices(device, serviceIds);

    resolve(unsubscription(listener));
  });
}

const idsAreSame = (set1, set2) => ("id" in set1) && ("id" in set2) && set1["id"] == set2["id"];

const connect = (device) => {
  return new Promise((resolve, reject) => {
    let listener;

    const onConnectionCaught = connectedDetail => {
      if (!idsAreSame(device, connectedDetail))
        return;

      if ("error" in connectedDetail) {
        reject(connectedDetail["error"]);
        return;
      }

      resolve(connectedDetail);

      if (listener) {
        listener.remove();
      }
    }

    listener = EventEmitter.addListener(
      ReactNativeBluetooth.DeviceConnected,
      onConnectionCaught
    );

    ReactNativeBluetooth.connect(device);
  })
}

const disconnect = (device) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const onDisconnectionCaught = detail => {
      if (!idsAreSame(device, detail))
        return;

      if ("error" in detail) {
        reject(detail["error"]);
        return;
      }

      resolve(detail);

      if (unsubscribe) {
        unsubscribe();
      }
    }

    unsubscribe = deviceDidDisconnect(onDisconnectionCaught);

    ReactNativeBluetooth.disconnect(device);
  })
}

const deviceDidDisconnect = (callback) => {
  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.DeviceDisconnected,
    callback
  );

  return unsubscription(listener);
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
  stopScan,
  didDiscoverDevice,
  discoverServices,
  connect,
  disconnect,
};
