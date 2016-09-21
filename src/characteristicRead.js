import {
  makeCharacteristicEventListener,
  ReactNativeBluetooth,
} from './lib';

const readCharacteristicValue = characteristic => {
  return new Promise((resolve, reject) => {
    const resultMapper = detail => {
      return {
        ...detail,
        base64Value: detail.value,
        value: new Buffer(detail.value, 'base64'),
      };
    };

    makeCharacteristicEventListener(resolve, reject, ReactNativeBluetooth.CharacteristicRead, characteristic, resultMapper);

    ReactNativeBluetooth.readCharacteristicValue(characteristic);
  });
};

export {
  readCharacteristicValue,
};
