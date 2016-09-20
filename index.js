'use strict';

import { NativeAppEventEmitter, NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Buffer } from 'buffer';
import * as _ from 'lodash';

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

const discoverServicesInternal = (device, _serviceIds, callback) => {
  const serviceIds = _serviceIds.map(id => id.toLowerCase());
  return new Promise((resolve, reject) => {
    const onServicesDiscovered = serviceMap => {
      if (serviceMap.services) {
        const services = serviceMap.services
          .filter(s => _.includes(serviceIds, s.id));

        if (services.length > 0)
          callback(services);
      } else {
        if (_.includes(serviceIds, serviceMap.service.id))
          callback([serviceMap.service]);
      }
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

    ReactNativeBluetooth.discoverServices(device, serviceIds);
  });
};

const discoverCharacteristicsInternal = (service, _characteristicIds, callback) => {
  const characteristicIds = _characteristicIds.map(id => id.toLowerCase());

  return new Promise((resolve, reject) => {
    const onCharacteristicsDiscovered = characteristicMap => {
      if (characteristicMap.characteristics) {
        const characteristics = characteristicMap.characteristics
          .filter(c => _.includes(characteristicIds, c.id));

        if (characteristics.length > 0)
          callback(characteristics);
      } else {
        if (_.includes(characteristicIds, characteristicMap.characteristic))
          callback([characteristicMap.characteristic]);
      }
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
    let timer = null;

    let listener = EventEmitter.addListener(ReactNativeBluetooth.CharacteristicRead, detail => {
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

    timer = setTimeout(() => {
      if (listener) {
        listener.remove();
        reject(new Error("Timeout reading characteristic"));
      }
    }, 5000);

    ReactNativeBluetooth.readCharacteristicValue(characteristic);
  });
};

const writeCharacteristicValue = (characteristic, buffer, withResponse) => {
  return new Promise((resolve, reject) => {
    if (!withResponse) {
      ReactNativeBluetooth.writeCharacteristicValue(characteristic, buffer.toString('base64'), withResponse);
      resolve();
      return;
    }

    let timer = null;

    let listener = EventEmitter.addListener(ReactNativeBluetooth.CharacteristicWritten, detail => {
      if (!idsAreSame(characteristic, detail))
        return;

      if (listener) {
        listener.remove();
      }

      if (timer) {
        clearTimeout(timer);
      }

      if ("error" in detail) {
        reject(new Error(detail.error));
      } else {
        resolve(detail);
      }
    });

    timer = setTimeout(() => {
      if (listener) {
        listener.remove();
        reject(new Error("Timeout writing characteristic"));
      }
    }, 5000);

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
      value: notified.value ? new Buffer(notified.value, 'base64') : new Buffer(0),
    };

    callback(mappedNotified);
  };

  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.CharacteristicNotified,
    onNotifyCaught
  );

  const deviceMap = { id: characteristic.deviceId };

  connectAndDiscoverCharacteristics(deviceMap, characteristic.serviceId, [characteristic.id])
  .then(() => ReactNativeBluetooth.subscribeToNotification(characteristic))
  .catch(error => {
    callback({
      error: error,
    });
  });

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

const discoverCharacteristics = (service, characteristicIds) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const onDiscovery = characteristics => {
      if (unsubscribe)
        unsubscribe();
      resolve(characteristics);
    };

    discoverCharacteristicsInternal(service, characteristicIds, onDiscovery)
    .then( release => unsubscribe = release )
    .catch(reject);
  });
};

const discoverServices = (device, serviceIds) => {
  return new Promise((resolve, reject) => {
    let unsubscribe;

    const onDiscovery = services => {
      if (unsubscribe)
        unsubscribe();
      resolve(services);
    };

    discoverServicesInternal(device, serviceIds, onDiscovery)
    .then( release => unsubscribe = release )
    .catch(reject);
  });
};

const connectAndDiscoverServices = (device, serviceIds) => {
  return connect(device)
    .then(() => discoverServices(device, serviceIds))
    .catch(console.log.bind(console));
};

const connectAndDiscoverCharacteristics = (device, serviceId, characteristicIds) => {
  const service = {
    id: serviceId,
    deviceId: device.id,
  };

  return connectAndDiscoverServices(device, [serviceId])
    .then(() => discoverCharacteristics(service, characteristicIds))
    .catch(console.log.bind(console));
};

const findAndReadFromCharacteristic = (device, serviceId, characteristicId) => {
  return connectAndDiscoverCharacteristics(device, serviceId, [characteristicId])
    .then(characteristics => {
      if ("error" in characteristics) {
        return Promise.reject(characteristics.error);
      }
      if (characteristics.length != 1) {
        return Promise.reject("Error in characteristic discovery. Wrong number of characteristics.");
      }
      return readCharacteristicValue(characteristics[0]);
    })
    .catch(console.log.bind(console));
};

const findAndWriteToCharacteristic = (device, serviceId, characteristicId, buffer, withResponse = false) => {
  return connectAndDiscoverCharacteristics(device, serviceId, [characteristicId])
    .then(characteristics => {
      if ("error" in characteristics) {
        Promise.reject(characteristics.error);
        return;
      }
      return writeCharacteristicValue(characteristics[0], buffer, withResponse);
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
  connectAndDiscoverServices,
  connectAndDiscoverCharacteristics,
  Buffer
};
