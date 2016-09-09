"use strict";

import mockery from "mockery";
import {
  Configuration,
  NativeEventEmitter,
  NativeModules,
} from './reactNativeMock';

const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const test = require('blue-tape');

mockery.enable();
mockery.warnOnUnregistered(false);

mockery.registerSubstitute('react-native', './test/reactNativeMock.js');

const api = require("../");

test('Tests disconnect success', function(t) {
  const {
    disconnect
  } = api.default;

  const expectedDevice = {
    id: "12345"
  };

  disconnect(expectedDevice)
    .then(device => {
      t.deepEqual(device, expectedDevice);
      t.end();
    }).catch(error => {
      t.error(error, "Error when trying to disconnect");
      t.end();
    });
});

test('Tests disconnect fail', function(t) {
  Configuration.disconnectSucceed = false;

  const {
    disconnect
  } = api.default;

  const deviceId = "12345";
  const expectedError = 'Error';

  disconnect({
      id: deviceId,
    })
    .then(() => {
      t.fail("Disconnect should not succeed");
      t.end();
    }).catch(error => {
      t.deepEqual(error, expectedError);
      t.end();
    });
});

test('Tests discover characteristics, started successfully ', function(t) {
  const {
    discoverCharacteristics,
  } = api.default;

  const expectedCharacteristic = {
    id: "8798798",
    deviceID: "3453987",
  };

  const service = {
    id: "12345",
  };

  let discovered = false;

  const onDiscoveredCallback = characteristic => {
    if ("error" in characteristic)
      t.fail("Invalid characteristic discovered");

    t.deepEqual(characteristic, expectedCharacteristic);

    discovered = true;
  };

  const characteristicIds = ["8798798"];

  discoverCharacteristics(service, characteristicIds, onDiscoveredCallback)
    .then(unsubscription => {
      t.ok(unsubscription, "Unsubscription was not passed through.");

      NativeEventEmitter.callbacks[ReactNativeBluetooth.CharacteristicDiscovered](expectedCharacteristic);

      t.ok(discovered, "Callback for characteristic discovered was not made.");
      unsubscription();

      t.notOk(
        NativeEventEmitter.callbacks[ReactNativeBluetooth.CharacteristicDiscovered]
      );
      t.notOk(
        NativeEventEmitter.callbacks[ReactNativeBluetooth.CharacteristicDiscoveryStarted]
      );

      t.end();
    })
    .catch(error => {
      t.error(error, "Error when trying to discover characteristics");
      t.end();
    });
});
