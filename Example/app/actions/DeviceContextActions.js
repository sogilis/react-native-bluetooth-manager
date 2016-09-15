import * as types from './DeviceContextActionTypes';

export function setDevice(device) {
  return {
    type: types.SETDEVICE,
    device: device,
  };
}

export function setService(service) {
  return {
    type: types.SETSERVICE,
    service: service,
  };
}

export function setCharacteristic(characteristic) {
  return {
    type: types.SETCHARACTERISTIC,
    characteristic: characteristic,
  };
}
