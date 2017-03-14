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
  idsAreSame,
  ReactNativeBluetooth,
  EventEmitter,
  unsubscription,
  Configuration,
} from './lib';

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
    let timer = null;

    const onConnectionCaught = connectedDetail => {
      if (!idsAreSame(device, connectedDetail))
        return;

      if (timer) {
        clearTimeout(timer);
      }

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
    timer = setTimeout(() => {
      if (listener) {
        listener.remove();
      }
      reject(new Error('CONNECTION_TIMEOUT'));
    }, 2 * Configuration.timeout);
  });
};

const disconnect = (device) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    let disconnectCallback = callBackInfo => {
      if (unsubscribe) {
        unsubscribe();
      }

      if ("error" in callBackInfo) {
        reject(new Error(callBackInfo.error));
      }

      resolve(callBackInfo);
    };

    unsubscribe = deviceDidDisconnect(device, disconnectCallback);

    ReactNativeBluetooth.disconnect(device);
  });
};

export {
  connect,
  disconnect,
  deviceDidDisconnect,
  deviceDidConnect,
};
