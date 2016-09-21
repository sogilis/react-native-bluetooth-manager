import {
  ReactNativeBluetooth,
  EventEmitter,
  unsubscription,
  Configuration,
} from './lib';

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
      onStartupFailure(new Error("Timeout discovering characteristics"));
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

const callDiscoveryAction = (actionToCall, context, itemIds) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const onDiscovery = items => {
      if (unsubscribe)
        unsubscribe();

      if ("error" in items)
        reject(items["error"]);
      else
        resolve(items);
    };

    actionToCall(context, itemIds, onDiscovery)
      .then(release => {
        unsubscribe = release;
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
};

const discoverServices = (device, serviceIds) => {
  return callDiscoveryAction(discoverServicesAction, device, serviceIds);
};

const discoverCharacteristics = (service, characteristicIds) => {
  return callDiscoveryAction(discoverCharacteristicsAction, service, characteristicIds);
};

export {
  discoverServices,
  discoverCharacteristics,
};
