import {
  idsAreSame,
  ReactNativeBluetooth,
  EventEmitter,
  unsubscription,
} from './lib';

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
  return new Promise((resolve, reject) => {
    let unsubscribe;

    let disconnectCallback = callBackInfo => {
      if (unsubscribe) {
        unsubscribe();
      }

      if ("error" in callBackInfo) {
        reject(new Error(callBackInfo.error));
      }

      resolve(callBackInfo);
    };

    unsubscribe = deviceDidDisconnect(device, disconnectCallback);

    ReactNativeBluetooth.disconnect(device);
  });
};

export {
  connect,
  disconnect,
  deviceDidDisconnect,
  deviceDidConnect,
};
