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

import { Platform } from 'react-native';
import {
  ReactNativeBluetooth,
  EventEmitter,
  unsubscription,
  Configuration,
} from './lib';
import { getTestPointName } from './testPoints';

import * as _ from 'lodash';

const findItemsByIds = (idsToLookFor, itemsToSearchIn) => {
  if (itemsToSearchIn == null) {
    return [];
  }

  const lowerCaseIds = (idsToLookFor || []).map(id => id.toLowerCase());

  return idsToLookFor == null || idsToLookFor.length == 0 ?
    itemsToSearchIn :
    itemsToSearchIn.filter(item => _.includes(lowerCaseIds, item.id.toLowerCase()));
};

const listenToStartupAndDiscoveryEvents = (onStartup, onStartupFailure, onDiscoveryAction,
  discoveryCallbackName, discoveryStartedCallbackName) => {

  const listener = EventEmitter.addListener(
    discoveryCallbackName,
    onDiscoveryAction
  );

  let startupListener;
  let timer;

  const onStartedCaught = detail => {
    if (timer) {
      clearTimeout(timer);
    }

    if ("error" in detail) {
      onStartupFailure(new Error(detail["error"]));
      return;
    }

    if (startupListener) {
      startupListener.remove();
    }

    onStartup(unsubscription(listener));
  };

  startupListener = EventEmitter.addListener(
    discoveryStartedCallbackName,
    onStartedCaught
  );

  timer = setTimeout(() => {
    if (startupListener) {
      listener.remove();
      onStartupFailure(new Error("Timeout discovering services or characteristics"));
    }
  }, Configuration.timeout);
};

const createOnDiscoveryHandler = (requiredIds, onDiscoveredCallback, itemKey) => {
  return itemMap => {
    if ("error" in itemMap) {
      onDiscoveredCallback(itemMap);
      return;
    }

    const items = findItemsByIds(requiredIds, itemMap[itemKey]);

    onDiscoveredCallback(items);
  };
};

const discoverServicesAction = (device, serviceIds, callback) => {
  return new Promise((resolve, reject) => {
    const onServicesDiscovered = createOnDiscoveryHandler(serviceIds, callback, "services");

    listenToStartupAndDiscoveryEvents(resolve, reject, onServicesDiscovered,
      ReactNativeBluetooth.ServiceDiscovered, ReactNativeBluetooth.ServiceDiscoveryStarted);

    if (Platform.OS === 'android')
      // using the ble stack for android is discouraged while it is filling its cache with device information 
      setTimeout(function(){ ReactNativeBluetooth.discoverServices(device, serviceIds || []); }, 2000);
    else
      ReactNativeBluetooth.discoverServices(device, serviceIds || []);
  });
};

const discoverCharacteristicsAction = (service, characteristicIds, callback) => {
  return new Promise((resolve, reject) => {
    const onCharacteristicsDiscovered = createOnDiscoveryHandler(characteristicIds, callback, "characteristics");

    listenToStartupAndDiscoveryEvents(resolve, reject, onCharacteristicsDiscovered,
      ReactNativeBluetooth.CharacteristicDiscovered, ReactNativeBluetooth.CharacteristicDiscoveryStarted);

    ReactNativeBluetooth.discoverCharacteristics(service, characteristicIds || []);
  });
};

const callDiscoveryAction = (actionToCall, context, itemIds, testPointName) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;
console.log('callDiscoveryAction 1')
    const onDiscovery = items => {
console.log('callDiscoveryAction 2', items)
      if (unsubscribe)
        unsubscribe();

      if ("error" in items)
        reject(new Error(items["error"]));
      else if (testPointName)
        reject(new Error(testPointName));
      else
        resolve(items);
    };

    actionToCall(context, itemIds, onDiscovery)
      .then(release => {
console.log('callDiscoveryAction 3', release)
        unsubscribe = release;
      })
      .catch(error => {
console.log('callDiscoveryAction 4 ERROR', error)
        console.log(error);
        reject(error);
      });
  });
};

const discoverServices = (device, serviceIds) => {
  return callDiscoveryAction(discoverServicesAction, device, serviceIds, getTestPointName('discoverServices'));
};

const discoverCharacteristics = (service, characteristicIds) => {
  return callDiscoveryAction(discoverCharacteristicsAction, service, characteristicIds, getTestPointName('discoverCharacteristics'));
};

export {
  discoverServices,
  discoverCharacteristics,
};
