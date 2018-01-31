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

const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const EventEmitter = Platform.OS === 'android' ? NativeAppEventEmitter :
  new NativeEventEmitter(ReactNativeBluetooth);

const idsAreSame = (set1, set2) => set1 && set2 && ("id" in set1) && ("id" in set2) && set1["id"].toLowerCase() == set2["id"].toLowerCase();

const Configuration = {
  timeout: 3000,
};

const unsubscription = (listener) => {
  return () => {
    listener.remove();
  };
};

const makeBleEventListener = (listenSuccess, listenFailure, listenEventName, ble_event, resultMapper, testPointName) => {
  let timer = null;

  let listener = EventEmitter.addListener(listenEventName, detail => {

/*
    ======= makeCharacteristicEventListener - received event ', { properties: { notify: false, write: true, read: false },
    deviceId: 'F8:F0:05:FD:C9:3B',
    id: 'c40d40d2-aea2-61b7-8a42-0c41142a5395', ****** writeTimeCharacteristic *****
    serviceId: 'c40d40d2-aea2-61b7-8a42-0c41102a5395',
    value: 'CM60xtMF\n' }
*/

    if (!idsAreSame(ble_event, detail)) {
      console.log("======= makeCharacteristicEventListener - event was not the one expected");
      console.log("expected", ble_event);
      console.log("received", detail);
      return;
    } else
      console.log("======= makeCharacteristicEventListener - received expected event");

    if (testPointName) {
      console.log("**************************** DEBUG: NOT PROCESSING RECEIVED EVENT " + listenEventName, 'testPointName:', testPointName);
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    if (listener) {
      listener.remove();
      listener = null;
    }

    if ("error" in detail) {
      console.log("**************************** makeBleEventListener failed", detail);
      listenFailure(new Error(detail.error));
    } else {
      console.log("**************************** makeBleEventListener successful", detail);
      listenSuccess(resultMapper(detail));
    }
  });

  timer = setTimeout(() => {
    if (listener) {
      listener.remove();
      const errText = testPointName || ("Timeout on " + listenEventName + " operation");
      listenFailure(new Error(errText));
    }
  }, Configuration.timeout);
};

export {
  idsAreSame,
  unsubscription,
  makeBleEventListener,
  ReactNativeBluetooth,
  EventEmitter,
  Configuration,
};
