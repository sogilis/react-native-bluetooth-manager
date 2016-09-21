import { Buffer } from 'buffer';
import { idsAreSame, unsubscription, Configuration } from './src/lib';
import { connect, disconnect, deviceDidDisconnect, deviceDidConnect } from './src/connection';
import { discoverServices, discoverCharacteristics } from './src/discovery';
import { startScan, stopScan, scanDidStop } from './src/scanStartStop';
import { readCharacteristicValue } from './src/characteristicRead';
import { writeCharacteristicValue } from './src/characteristicWrite';

import {
  ReactNativeBluetooth,
  EventEmitter,
} from './src/lib';

const didChangeState = (callback) => {
  const listener = EventEmitter.addListener(
    ReactNativeBluetooth.StateChanged,
    callback
  );

  ReactNativeBluetooth.notifyCurrentState();

  return unsubscription(listener);
};

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

  const deviceMap = {
    id: characteristic.deviceId
  };

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

const didDiscoverDevice = (callback) => {
  return unsubscription(EventEmitter.addListener(
    ReactNativeBluetooth.DeviceDiscovered,
    callback
  ));
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

const connectAndDiscoverServices = (device, serviceIds) => {
  return connect(device)
    .then(() => discoverServices(device, serviceIds));
};

const connectAndDiscoverCharacteristics = (device, serviceId, characteristicIds) => {
  const service = {
    id: serviceId,
    deviceId: device.id,
  };

  return connectAndDiscoverServices(device, [serviceId])
    .then(() => discoverCharacteristics(service, characteristicIds));
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
    });
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
  scanDidStop,
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
  findAndReadFromCharacteristic,
  findAndWriteToCharacteristic,
  connectAndDiscoverServices,
  connectAndDiscoverCharacteristics,
  Buffer,
  Configuration,
};
