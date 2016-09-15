import * as types from './ServiceActionTypes';

export function characteristicDiscovered(characteristic) {
  return {
    type: types.CHARACTERISTICDISCOVERED,
    characteristic: characteristic
  };
}

export function resetCharacteristics() {
  return {
    type: types.RESETCHARACTERISTICS,
  };
}
