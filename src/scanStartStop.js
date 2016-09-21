import {
  NativeAppEventEmitter,
  NativeModules,
  NativeEventEmitter,
  Platform
} from 'react-native';

import {
  unsubscription,
} from './lib';

const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const EventEmitter = Platform.OS === 'android' ? NativeAppEventEmitter :
  new NativeEventEmitter(ReactNativeBluetooth);

const DefaultScanOptions = {
  uuids: [],
};

let scanInProgress = false;

const Scan = {
  stopAfter: (timeout) => {
    return new Promise((resolve, reject) => {
      let timeoutReached = false;
      let timer = null;
      let stopSubscription = null;

      stopSubscription = scanDidStop(() => {
        if (timer) {
          clearTimeout(timer);
        }

        if (stopSubscription) {
          stopSubscription();
        }

        resolve(timeoutReached);
      });

      timer = setTimeout(() => {
        timeoutReached = true;

        stopScan()
          .catch(error => reject(error));
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

      scanInProgress = true;

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
    if (!scanInProgress) {
      resolve();
      return;
    }

    let listener;

    listener = EventEmitter.addListener(ReactNativeBluetooth.ScanStopped, detail => {
      if (listener) {
        listener.remove();
      }
      scanInProgress = false;

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

export {
  startScan,
  stopScan,
  scanDidStop,
};
