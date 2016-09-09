const Configuration = {
  platform: "android",
  connectSucceed: true,
  disconnectSucceed: true,
  discoverCharacteristicsSucceed: true,
};

const Reset = () => {
  NativeAppEventEmitter.callBacks = {};
};


const NativeAppEventEmitter = {
  callbacks: {},
  addListener: function(name, callback) {
    this.callbacks[name] = callback;
    return {
      remove: () => {
        this.callbacks[name] = null;
      }
    };
  },
};

const NativeEventEmitter = NativeAppEventEmitter;

const Platform = {
  OS: "android",
};

const EventConstants = {
  DeviceConnected: "DeviceConnected",
  DeviceDisconnected: "DeviceDisconnected",
  CharacteristicDiscovered: "CharacteristicDiscovered",
  CharacteristicDiscoveryStarted: "CharacteristicDiscoveryStarted",
};

const NativeModules = {
  ReactNativeBluetooth: {
    DeviceConnected: EventConstants.DeviceConnected,
    DeviceDisconnected: EventConstants.DeviceDisconnected,
    CharacteristicDiscovered: EventConstants.CharacteristicDiscovered,
    CharacteristicDiscovereryStarted: EventConstants.CharacteristicDiscovereryStarted,

    disconnect: function(device) {
      if (!Configuration.disconnectSucceed) {
        NativeAppEventEmitter.callbacks[this.DeviceDisconnected]({
          id: device.id,
          error: "Error",
        });
        return;
      }

      NativeAppEventEmitter.callbacks[this.DeviceDisconnected](device);
    },

    discoverCharacteristics: function(service) {
      if (!Configuration.discoverCharacteristicsSucceed) {
        NativeAppEventEmitter.callbacks[this.CharacteristicDiscovereryStarted]({
          id: service.id,
          error: "Error",
        });
        return;
      }

      NativeAppEventEmitter.callbacks[this.CharacteristicDiscovereryStarted](service);
    }
  }
};

export {
  Configuration,
  NativeAppEventEmitter,
  NativeEventEmitter,
  Platform,
  NativeModules,
  Reset,
};
