import * as types from './DiscoveryActionTypes';

export function deviceDiscovered(device) {
  return {
    type: types.DEVICEDISCOVERED,
    device: device
  };
}

export function discoveryStatusChange(status) {
  return {
    type: types.DISCOVERYSTATUSCHANGE,
    status: status,
  };
}

export function resetDevices() {
  return {
    type: types.RESETDEVICES,
  };
}
