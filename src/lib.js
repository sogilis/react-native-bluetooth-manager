import {
  NativeAppEventEmitter,
  NativeModules,
  NativeEventEmitter,
  Platform
} from 'react-native';

const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const EventEmitter = Platform.OS === 'android' ? NativeAppEventEmitter :
  new NativeEventEmitter(ReactNativeBluetooth);

const idsAreSame = (set1, set2) => ("id" in set1) && ("id" in set2) && set1["id"] == set2["id"];

const Configuration = {
  timeout: 10000,
};

const unsubscription = (listener) => {
  return () => {
    listener.remove();
  };
};

const makeCharacteristicEventListener = (listenSuccess, listenFailure, listenEventName, characteristic, resultMapper) => {
  let timer = null;

  let listener = EventEmitter.addListener(listenEventName, detail => {
    if (!idsAreSame(characteristic, detail))
      return;

    if (timer) {
      clearTimeout(timer);
    }

    if (listener) {
      listener.remove();
      listener = null;
    }

    if ("error" in detail) {
      listenFailure(new Error(detail.error));
    } else {
      listenSuccess(resultMapper(detail));
    }
  });

  timer = setTimeout(() => {
    if (listener) {
      listener.remove();
      listenFailure(new Error("Timeout on characteristic operation"));
    }
  }, Configuration.timeout);
};

export {
  idsAreSame,
  unsubscription,
  makeCharacteristicEventListener,
  ReactNativeBluetooth,
  EventEmitter,
  Configuration,
};
