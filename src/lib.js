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
  timeout: 70000,
};

const unsubscription = (listener) => {
  return () => {
    listener.remove();
  };
};

const makeCharacteristicEventListener = (listenSuccess, listenFailure, listenEventName, characteristic, resultMapper) => {
  let timer = null;

  let listener = EventEmitter.addListener(listenEventName, detail => {
    if (!idsAreSame(characteristic, detail))
      return;

    if (timer) {
      clearTimeout(timer);
    }

    if (listener) {
      listener.remove();
      listener = null;
    }

    if ("error" in detail) {
      listenFailure(new Error(detail.error));
    } else {
      listenSuccess(resultMapper(detail));
    }
  });

  timer = setTimeout(() => {
    if (listener) {
      listener.remove();
      listenFailure(new Error("Timeout on characteristic operation"));
    }
  }, Configuration.timeout);
};

export {
  idsAreSame,
  unsubscription,
  makeCharacteristicEventListener,
  ReactNativeBluetooth,
  EventEmitter,
  Configuration,
};
