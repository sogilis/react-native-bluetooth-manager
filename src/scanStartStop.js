/**
 * Copyright (c) 2016-present, Sogilis SARL
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  stopAfter: (stopInfo) => { // stopInfo = { timeout: timeoutInMs, cancel: null }
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

      stopInfo.cancel = () => {
        console.log('Tikee scan terminated by device found');
        stopScan()
      };

      timer = setTimeout(() => {
        timeoutReached = true;
        console.log('Tikee scan terminated by timeout');
        stopScan()
        .catch(error => reject(error));
      }, stopInfo.timeout);
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
