const Configuration = {
  platform: "android",
  connectSucceed: true,
  disconnectSucceed: true,
};

const Reset = () => {
  NativeAppEventEmitter.callBacks = {};
};


const NativeAppEventEmitter = {
  callbacks: {},
  addListener: function(name, callback) {
    this.callbacks[name] = callback;
  },
};

const NativeEventEmitter = NativeAppEventEmitter;

const Platform = {
  OS: "android",
};

const EventConstants = {
  DeviceConnected: "DeviceConnected",
  DeviceDisconnected: "DeviceDisconnected",
};

const NativeModules = {
  ReactNativeBluetooth: {
    DeviceConnected: EventConstants.DeviceConnected,
    DeviceDisconnected: EventConstants.DeviceDisconnected,

    disconnect: function(device) {
      if (Configuration.disconnectSucceed) {
        NativeAppEventEmitter.callbacks[this.DeviceDisconnected](device);
      } else {
        NativeAppEventEmitter.callbacks[this.DeviceDisconnected]({
          id: device.id,
          error: "Error",
        });
      }
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
