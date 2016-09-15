import * as types from './DeviceActionTypes';

export function serviceDiscovered(service) {
  return {
    type: types.SERVICEDISCOVERED,
    service: service
  };
}

export function storeDisconnectionHandler(handler) {
  return {
    type: types.DISCONNECTIONHANDLER,
    handler: handler,
  };
}

export function setConnectionStatus(isConnected) {
  return {
    type: types.CONNECTIONSTATUS,
    isConnected: isConnected,
  };
}

export function setConnectionInProgress(inProgress) {
  return {
    type: types.CONNECTIONINPROGRESS,
    inProgress: inProgress,
  };
}

export function resetServices() {
  return {
    type: types.RESETSERVICES,
  };
}
