# react-native-bluetooth-manager

[![npm version](https://badge.fury.io/js/react-native-bluetooth-manager.svg)](https://npmjs.org/package/react-native-bluetooth-manager)

__Disclaimer: This is alpha software.__

Bluetooth API for [React Native](https://github.com/facebook/react-native).

## Features

- Handle bluetooth availability
- Scan nearby low-energy devices
- Discover services and characteristics
- Connect to devices
- Read, write and receive characteristic notifications
- Support both iOS/Android

## Install

```
npm install --save react-native-bluetooth-manager
react-native link react-native-bluetooth-manager
```

## Usage

See the [Example app](https://github.com/sogilis/react-native-bluetooth-manager/tree/master/Example).

```
import Bluetooth from 'react-native-bluetooth-manager';
```

### Bluetooth state change

```
const unsubscribe = Bluetooth.didChangeState(bluetoothState => {
    // bluetoothState == 'enabled' | 'disabled'
  });
```

### Device scan

```
const discoverOptions = {
  uuids: [] // list of BLE service uuids to filter devices during scan
};

const onDeviceFound = device => {
  const {id, name} = device;
  ...
};

Bluetooth.startScanWithDiscovery(discoverOptions, onDeviceFound)
  .then(scan => scan.stopAfter(9000)) // automatically stop scan after 9000ms
  .then(stoppedOnTime => {
    // true if scan ran for full duration, false if stopped before
  });

Bluetooth.stopScan(); // manually stop scan

```

### Device connection, services & characteristics discovery

```
Bluetooth.connect(device)
  .then(() => {
    // device is connected
    // proceed with services & characteristics discovery (see below)
  }).catch(error => {
    // error when connecting to device
  });

Bluetooth.disconnect(device)
  .then(() => { // disconnection ok })
  .catch(() => { // disconnection error });
```

Once device is connected, it is recommended to discover service and characteristics before calling any operation.

```
Bluetooth.discoverServices(device, serviceIds)
  .then(services => {
    // discover service characteristics
    services.forEach(service => {
      // optionally, perform characteristic discovery one after the other for better stability
      Bluetooth.discoverCharacteristics(service, characteristicIds)
        .then(characteristics => {
          // memoize characteristics for later use
        });
    });
  });
```

Disconnection events can happen any time due to loss of communication:

```
const unsubscribe = Bluetooth.deviceDidDisconnect(event => {
  unsubscribe();
  if (event.error) {
    // disconnection due to error
  } else {
    ...
  }
});
```

### Characteristic operations

Use characteristics retrieved during the discovery stage.

Read a characteristic value:

```
Bluetooth.readCharacteristicValue(characteristic)
  .then(payload => {
    const {
      value, // value after base-64 decoding
      base64Value, // original base-64 encoded value
    } = payload;
    ...
  });
```


Write a value to a characteristic (with or without response):

```
const payload = new Buffer(...);
// see https://www.npmjs.com/package/buffer
// lib will encode buffer in Base 64 before transmission

Bluetooth.writeCharacteristicValue(characteristic, payload, withResponse)
  .then(() => {
    // if withResponse == true, wait for Bluetooth write response (acknowledgement)
    // if withResponse == false, returns immediately
  });
```

Subscribe to notifications from characteristic:

```
const onNotification = payload => {
  const { value } = payload; // value after base-64 decoding
};

const unsubscribe = Bluetooth.characteristicDidNotify(characteristic, onNotification);

unsubscribe(); // stop notifications handling
```

## License

    Copyright 2016 Sogilis SARL

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this software except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
