const TestConfiguration = {
  platform: "android",
  connectSucceed: true,
  disconnectSucceed: true,
  discoverCharacteristicsSucceed: true,
  discoverServicesSucceed: true,
};

const NativeAppEventEmitter = {
  callBackParams: {},
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

const Reset = () => {
  NativeAppEventEmitter.callBacks = {};
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
  ServiceDiscovered: "ServiceDiscovered",
  ServiceDiscoveryStarted: "ServiceDiscoveryStarted",
};

const NativeModules = {
  ReactNativeBluetooth: {
    DeviceConnected: EventConstants.DeviceConnected,
    DeviceDisconnected: EventConstants.DeviceDisconnected,
    CharacteristicDiscovered: EventConstants.CharacteristicDiscovered,
    ServiceDiscovered: EventConstants.ServiceDiscovered,
    CharacteristicDiscovereryStarted: EventConstants.CharacteristicDiscovereryStarted,
    ServiceDiscovereryStarted: EventConstants.ServiceDiscovereryStarted,

    connect: function(device) {
      if (!TestConfiguration.connectSucceed) {
        NativeAppEventEmitter.callbacks[this.DeviceConnected]({
          id: device.id,
          error: "Error",
        });
        return;
      }

      NativeAppEventEmitter.callbacks[this.DeviceConnected](device);
    },

    disconnect: function(device) {
      if (!TestConfiguration.disconnectSucceed) {
        NativeAppEventEmitter.callbacks[this.DeviceDisconnected]({
          id: device.id,
          error: "Error",
        });
        return;
      }

      NativeAppEventEmitter.callbacks[this.DeviceDisconnected](device);
    },

    discoverCharacteristics: function(service) {
      if (!TestConfiguration.discoverCharacteristicsSucceed) {
        NativeAppEventEmitter.callbacks[this.CharacteristicDiscovereryStarted]({
          id: service.id,
          error: "Error",
        });
        return;
      }

      NativeAppEventEmitter.callbacks[this.CharacteristicDiscovereryStarted](service);

      const callBackParams = NativeAppEventEmitter.callBackParams[this.CharacteristicDiscovered];
      const discoveredCallback = NativeAppEventEmitter.callbacks[this.CharacteristicDiscovered];

      if (callBackParams && discoveredCallback) {
        discoveredCallback.apply(this, callBackParams);
      }
    },

    discoverServices: function(service) {
      if (!TestConfiguration.discoverServicesSucceed) {
        NativeAppEventEmitter.callbacks[this.ServiceDiscovereryStarted]({
          id: service.id,
          error: "Error",
        });
        return;
      }

      NativeAppEventEmitter.callbacks[this.ServiceDiscovereryStarted](service);

      const callBackParams = NativeAppEventEmitter.callBackParams[this.ServiceDiscovered];
      const discoveredCallback = NativeAppEventEmitter.callbacks[this.ServiceDiscovered];

      if (callBackParams && discoveredCallback) {
        discoveredCallback.apply(this, callBackParams);
      }
    }
  }
};

export {
  TestConfiguration,
  NativeAppEventEmitter,
  NativeEventEmitter,
  Platform,
  NativeModules,
  Reset,
};
