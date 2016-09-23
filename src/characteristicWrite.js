import {
  makeCharacteristicEventListener,
  ReactNativeBluetooth,
} from './lib';

const writeCharacteristicValue = (characteristic, buffer, withResponse) => {
  return new Promise((resolve, reject) => {
    if (!withResponse) {
      ReactNativeBluetooth.writeCharacteristicValue(characteristic, buffer.toString('base64'), withResponse);
      resolve();
      return;
    }

    const resultMapper = detail => detail;

    makeCharacteristicEventListener(resolve, reject, ReactNativeBluetooth.CharacteristicWritten, characteristic, resultMapper);

    ReactNativeBluetooth.writeCharacteristicValue(characteristic, buffer.toString('base64'), withResponse);
  });
};

export {
  writeCharacteristicValue,
};
