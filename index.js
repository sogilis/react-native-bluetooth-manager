'use strict';

import { NativeAppEventEmitter, NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Buffer } from 'buffer';

const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const EventEmitter = Platform.OS === 'android' ? NativeAppEventEmitter :
  new NativeEventEmitter(ReactNativeBluetooth);

const unsubscription = (listener) => {
  return () => {
    listener.remove();
  };
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
  return new Promise((resolve, reject) => {
    let options = Object.assign({}, DefaultScanOptions, customOptions);

    let listener;

    listener = EventEmitter.addListener(ReactNativeBluetooth.ScanStarted, (detail) => {
      if (listener) {
        listener.remove();
      }

      if ("error" in detail) {
        reject(new Error(detail.error));
      } else {
        resolve(Scan);
      }
    });

    ReactNativeBluetooth.startScan(options.uuids);
  });
};

const stopScan = () => {
  return new Promise((resolve, reject) => {
    let listener;

    listener = EventEmitter.addListener(ReactNativeBluetooth.ScanStopped, detail => {
      if (listener) {
        listener.remove();
      }

      if ("error" in detail) {
        reject(new Error(detail.error));
      } else {
        resolve(detail);
      }
    });

    ReactNativeBluetooth.stopScan();
  });
};

const scanDidStop = (callback) => {
  const scanStoppedCaught = detail => {
    callback(detail);
  };

  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.ScanStopped,
    scanStoppedCaught
  );

  return unsubscription(listener);
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
        reject(new Error(detail["error"]));
        return;
      }

      if (startupListener) {
        startupListener.remove();
      }

      resolve(unsubscription(listener));
    };

    startupListener = EventEmitter.addListener(
      ReactNativeBluetooth.ServiceDiscoveryStarted,
      onStartedCaught
    );

    ReactNativeBluetooth.discoverServices(device, serviceIds);
  });
};

const discoverCharacteristics = (service, characteristicIds, callback) => {
  return new Promise((resolve, reject) => {
    // TODO: filter this callback by device
    const listener = EventEmitter.addListener(
      ReactNativeBluetooth.CharacteristicDiscovered,
      callback
    );

    let startupListener;

    const onStartedCaught = detail => {
      if ("error" in detail) {
        reject(new Error(detail["error"]));
        return;
      }

      if (startupListener) {
        startupListener.remove();
      }

      resolve(unsubscription(listener));
    };

    startupListener = EventEmitter.addListener(
      ReactNativeBluetooth.CharacteristicDiscoveryStarted,
      onStartedCaught
    );

    ReactNativeBluetooth.discoverCharacteristics(service, characteristicIds);
  });
};

const readCharacteristicValue = characteristic => {
  return new Promise((resolve, reject) => {
    let listener = EventEmitter.addListener(ReactNativeBluetooth.CharacteristicRead, detail => {
      if (!idsAreSame(characteristic, detail))
        return;

      if (listener) {
        listener.remove();
        listener = null;
      }

      if ("error" in detail) {
        reject(new Error(detail.error));
      } else {
        const mappedDetail = {
          ...detail,
          base64Value: detail.value,
          value: new Buffer(detail.value, 'base64'),
        };
        resolve(mappedDetail);
      }
    });

    setTimeout(() => {
      if (listener) {
        listener.remove();
        reject(new Error("Timeout reading characteristic"));
      }}, 5000);

    ReactNativeBluetooth.readCharacteristicValue(characteristic);
  });
};

const writeCharacteristicValue = (characteristic, buffer, withResponse) => {
  return new Promise((resolve, reject) => {
    if (!withResponse) {
      resolve();
      return;
    }

    let listener = EventEmitter.addListener(ReactNativeBluetooth.CharacteristicWritten, detail => {
      if (!idsAreSame(characteristic, detail))
        return;

      if (listener) {
        listener.remove();
      }

      if ("error" in detail) {
        reject(new Error(detail.error));
      } else {
        resolve(detail);
      }
    });

    setTimeout(() => {
      if (listener) {
        listener.remove();
        reject(new Error("Timeout writing characteristic"));
      }}, 5000);

    ReactNativeBluetooth.writeCharacteristicValue(characteristic, buffer.toString('base64'), withResponse);
  });
};

const idsAreSame = (set1, set2) => ("id" in set1) && ("id" in set2) && set1["id"] == set2["id"];

const characteristicDidNotify = (characteristic, callback) => {

  const onNotifyCaught = notified => {
    if (!idsAreSame(characteristic, notified))
      return;

    const mappedNotified = {
      ...notified,
      value: new Buffer(notified.value, 'base64'),
    };

    callback(mappedNotified);
  };

  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.CharacteristicNotified,
    onNotifyCaught
  );

  ReactNativeBluetooth.subscribeToNotification(characteristic);

  return () => {
    listener.remove();
    ReactNativeBluetooth.unsubscribeFromNotification(characteristic);
  };
};

const deviceDidDisconnect = (device, callback) => {
  const disconnectionCaught = detail => {
    if (!idsAreSame(device, detail))
      return;

    callback(detail);
  };

  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.DeviceDisconnected,
    disconnectionCaught
  );

  return unsubscription(listener);
};

const deviceDidConnect = (device, callback) => {
  const connectionCaught = detail => {
    if (!idsAreSame(device, detail))
      return;

    callback(detail);
  };

  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.DeviceConnected,
    connectionCaught
  );

  return unsubscription(listener);
};


const connect = (device) => {
  return new Promise((resolve, reject) => {
    let listener;

    const onConnectionCaught = connectedDetail => {
      if (!idsAreSame(device, connectedDetail))
        return;

      if ("error" in connectedDetail) {
        reject(new Error(connectedDetail["error"]));
        return;
      }

      resolve(connectedDetail);

      if (listener) {
        listener.remove();
      }
    };

    listener = EventEmitter.addListener(
      ReactNativeBluetooth.DeviceConnected,
      onConnectionCaught
    );

    ReactNativeBluetooth.connect(device);
  });
};

const disconnect = (device) => {
  return new Promise((resolve) => {
    let unsubscribe;

    let disconnectCallback = device => {
      if (unsubscribe) {
        unsubscribe();
      }

      resolve(device);
    };

    unsubscribe = deviceDidDisconnect(device, disconnectCallback);

    ReactNativeBluetooth.disconnect(device);
  });
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
  discoverCharacteristics,
  readCharacteristicValue,
  writeCharacteristicValue,
  characteristicDidNotify,
  connect,
  disconnect,
  deviceDidDisconnect,
  deviceDidConnect,
  scanDidStop,
};
