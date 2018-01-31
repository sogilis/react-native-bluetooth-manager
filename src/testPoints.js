// testPoints.js

import { Platform } from 'react-native';

// true -> emulate BLE error to debug or check error handling
let testPoints = {
  discoverServices: false,
  discoverCharacteristics: false,
  readingSerialNumber: false,
  readingFirmwareVersion: false,
  readingSoftwareVersion: false,
  setTikeeCurrentTime: false,
  retrieveTikeeStatusProtobufWrite: false,
  retrieveTikeeStatusProtobufRead: false,
  retrieveTimelapseStatusesProtobufWrite: false,
  retrieveTimelapseStatusesProtobufRead: false,
  updateTimelapsesConfiguration: false,
//  startUpload: false,
//  stopUpload: false,
  startSequences: false,
  stopSequences: false,
  testWirelessConnection: false,
  formatSDCard: false,
  upgradeFirmware: false,
  wirelessSettings: false,
  writeTikeeWirelessSettings: false,
  writeUploadThreshold: false,
};

if (Platform.OS === 'android') {
  testPoints['enableNotification'] = false;
  testPoints['disableNotification'] = false;
};

const getReadCharacteristicTestPointName = (characteristicId, operationUnderTest) => {
  let name;
  if (/c40d40d2-aea2-61b7-8a42-0c411[\dabcdef]2a5395/.test(characteristicId.toLowerCase()))
    name = operationUnderTest;
  else {
    names = (Platform.OS === 'android') ?
      {
        '00002a25-0000-1000-8000-00805f9b34fb': 'readingSerialNumber',
        '00002a26-0000-1000-8000-00805f9b34fb': 'readingFirmwareVersion',
        '00002a28-0000-1000-8000-00805f9b34fb': 'readingSoftwareVersion',
      } :
      {
        '2A25': 'readingSerialNumber',
        '2A26': 'readingFirmwareVersion',
        '2A28': 'readingSoftwareVersion',
      };
    name = names[characteristicId];
    if (!name)
      throw new Error('getReadCharacteristicTestPointName error: unknown characteristicId .' + characteristicId + '.');
  }

  return (name && testPoints[name]) ? name : null;
};

const getReadProtobufTestPointName = (access) => {
  switch(access) {
    case 'retrieveTikeeStatusProtobufRead':
    case 'retrieveTimelapseStatusesProtobufRead':
      return testPoints[access] ? access : null;
    default:
      throw('getReadProtobufTestPointName error');
  }
};

const getNotificationTestPointName = (enable) => {
  const name = enable ? 'enableNotification' : 'disableNotification';
  return testPoints[name] ? name : null;
};

const getTestPointName = (name) => (testPoints[name] ? name : null);

const resetTestPoints = () => {
  Object.keys(testPoints).forEach((key) => testPoints[key] = false);
};

export {
  testPoints,
  resetTestPoints,
  getReadCharacteristicTestPointName,
  getReadProtobufTestPointName,
  getNotificationTestPointName,
  getTestPointName,
};

