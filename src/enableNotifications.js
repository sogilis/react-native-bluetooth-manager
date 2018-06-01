import {
  makeBleEventListener,
  ReactNativeBluetooth,
} from './lib';
import { testPoints } from './testPoints'

const enableNotifications = (notifyCharacteristic, enable, ios) => {
  console.log("==== " + (enable ? "en" : "dis") + "ableNotifications (ios:" + ios + ')');
  return new Promise((resolve, reject) => {
    if (ios) {
      if (enable)
        ReactNativeBluetooth.subscribeToNotification(notifyCharacteristic);
      else
        ReactNativeBluetooth.unsubscribeFromNotification(notifyCharacteristic);
      // should check actual operation result: see
      // https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/PerformingCommonCentralRoleTasks/PerformingCommonCentralRoleTasks.html
      resolve();
    } else {
      emulateError = (enable && testPoints.enableNotification) || (disable && testPoints.disableNotification);
      const resultMapper = detail => detail;
      makeBleEventListener(
        resolve,
        reject,
        ReactNativeBluetooth.NotificationDescriptorWritten,
        {id: "00002902-0000-1000-8000-00805f9b34fb"}, // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
        resultMapper,
        emulateError);

      if (enable)
        ReactNativeBluetooth.subscribeToNotification(notifyCharacteristic);
      else
        ReactNativeBluetooth.unsubscribeFromNotification(notifyCharacteristic);
    }
  });
};

export {
  enableNotifications,
};
