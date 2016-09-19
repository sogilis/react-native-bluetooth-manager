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

let scanInProgress = false;

const Scan = {
  stopAfter: (timeout) => {
    return new Promise((resolve, reject)=> {
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
        // TODO: Check for connection first
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

const startScanWithDiscovery = (customOptions, onDeviceFound) => {
  let unsubscribeFromDiscovery = didDiscoverDevice(onDeviceFound);
  let scanDidStopUnsubscribe = null;

  scanDidStopUnsubscribe = scanDidStop(() => {
    if (scanDidStopUnsubscribe) {
      scanDidStopUnsubscribe();
    }

    unsubscribeFromDiscovery();
  });

  return startScan(customOptions);
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

const discoverServices = (device, serviceIds, callback) => {
  return new Promise((resolve, reject) => {
    const onServicesDiscovered = serviceMap => {
      console.assert("deviceId" in serviceMap,
        "Missing deviceId in service found event");
      console.assert("services" in serviceMap || "service" in serviceMap,
        "Missing services in service found event");

      if (serviceMap.deviceId != device.id) return;

      callback(serviceMap.services || [serviceMap.service]);
    };

    const listener = EventEmitter.addListener(
      ReactNativeBluetooth.ServiceDiscovered,
      onServicesDiscovered
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

    ReactNativeBluetooth.discoverServices(device, null);
  });
};

const discoverCharacteristics = (service, characteristicIds, callback) => {
  return new Promise((resolve, reject) => {
    const onCharacteristicsDiscovered = characteristicMap => {
      console.assert("deviceId" in characteristicMap,
        "Missing deviceId in characteristic found event");
      console.assert("serviceId" in characteristicMap,
        "Missing deviceId in characteristic found event");
      console.assert("characteristics" in characteristicMap || "characteristic" in characteristicMap,
        "Missing characteristics in characteristic found event");

      if (characteristicMap.deviceId != service.deviceId) return;
      if (characteristicMap.serviceId != service.id) return;

      callback(characteristicMap.characteristics || [characteristicMap.characteristic]);
    };

    const listener = EventEmitter.addListener(
      ReactNativeBluetooth.CharacteristicDiscovered,
      onCharacteristicsDiscovered
    );

    let startupListener;
    let timer;

    const onStartedCaught = detail => {
      if (timer) {
        clearTimeout(timer);
      }

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

    timer = setTimeout(() => {
      if (startupListener) {
        listener.remove();
        reject(new Error("Timeout discovering characteristics"));
      }}, 15000);

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

const discoverCharacteristicsOnce  = (service, characteristicIds) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const onDiscovery = characteristic => {
      if (unsubscribe)
        unsubscribe();
      resolve(characteristic);
    };

    discoverCharacteristics(service, characteristicIds, onDiscovery)
    .then( release => unsubscribe = release )
    .catch(reject);
  });
};

const discoverServicesOnce = (device, serviceIds) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const onDiscovery = services => {
      if (unsubscribe)
        unsubscribe();
      resolve(services);
    };

    discoverServices(device, serviceIds, onDiscovery)
    .then( release => unsubscribe = release )
    .catch(reject);
  });
};

const findAndReadFromCharacteristic = (device, serviceId, characteristicId) => {
  console.assert("id" in device, "Valid device must be specified");
  console.assert(serviceId, "Device id must be specified");
  console.assert(characteristicId, "Valid characteristic must be specified");

  const service = {
    id: serviceId,
    deviceId: device.id,
  };

  return connect(device)
    .then(() => discoverServicesOnce(device, [serviceId]))
    .then(() => discoverCharacteristicsOnce(service, [characteristicId]))
    .then(characteristics => {
      if ("error" in characteristics) {
        Promise.reject(characteristics.error);
        return;
      }
      if (characteristics.length != 1) {
        Promise.reject("Error in characteristic discovery. Wrong number of characteristics.");
        return;
      }
      return readCharacteristicValue(characteristics[0]);
    });
};

const findAndWriteToCharacteristic = (device, serviceId, characteristicId,  buffer, withResponse = false) => {
  console.assert("id" in device, "Valid device must be specified");
  console.assert(serviceId, "Device id must be specified");
  console.assert(characteristicId, "Valid characteristic must be specified");

  const service = {
    id: serviceId,
    deviceId: device.id,
  };

  return connect(device)
    .then(() => discoverServicesOnce(device, [serviceId]))
    .then(() => discoverCharacteristicsOnce(service, [characteristicId]))
    .then(characteristic => {
      if ("error" in characteristic) {
        Promise.reject(characteristic.error);
        return;
      }
      return writeCharacteristicValue(characteristic, buffer, withResponse);
    });
};

export default {
  didChangeState,
  startScan,
  startScanWithDiscovery,
  stopScan,
  didDiscoverDevice,
  discoverServices,
  discoverCharacteristics,
  discoverCharacteristicsOnce,
  readCharacteristicValue,
  writeCharacteristicValue,
  characteristicDidNotify,
  connect,
  disconnect,
  deviceDidDisconnect,
  deviceDidConnect,
  scanDidStop,
  findAndReadFromCharacteristic,
  findAndWriteToCharacteristic,
};
