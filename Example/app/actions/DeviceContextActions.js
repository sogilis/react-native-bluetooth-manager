import * as types from './DeviceContextActionTypes';

export function setDevice(device) {
  return {
    type: types.SETDEVICE,
    device: device,
  };
}
