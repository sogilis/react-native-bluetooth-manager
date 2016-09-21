"use strict";

import {
  NativeEventEmitter,
  ReactNativeBluetooth,
  test,
  api,
} from './testCommon';

const {
  discoverCharacteristics,
} = api.default;

const testService = {
  id: "12345",
};

const runSuccessfullDiscoverTest = (t, characteristicIdsToDiscover, expectedCharacteristics) => {
  const discoveryCallbackParams = {
    characteristics: expectedCharacteristics,
  };

  NativeEventEmitter.callBackParams[ReactNativeBluetooth.CharacteristicDiscovered] = [discoveryCallbackParams];

  discoverCharacteristics(testService, characteristicIdsToDiscover)
    .then(characteristics => {
      t.deepEqual(characteristics, expectedCharacteristics);
      t.end();
    })
    .catch(error => {
      t.fail(`Discover characterstics error ${error.message}`);
    });
};

test('Tests discover characteristics, single characteristic.', function(t) {
  const expectedCharacteristics = [{
    id: "8798798",
    deviceID: "3453987",
  }];

  const characteristicIds = ["8798798"];

  runSuccessfullDiscoverTest(t, characteristicIds, expectedCharacteristics);
});

test('Tests discover characteristics, multiple characteristics.', function(t) {
  const expectedCharacteristics = [{
    id: "8798798",
    deviceID: "3453987",
  }, {
    id: "78987987",
    deviceID: "3453987",
  }];

  const characteristicIds = ["8798798", "78987987"];

  runSuccessfullDiscoverTest(t, characteristicIds, expectedCharacteristics);
});

test('Tests discover characteristics, casing of expected ids not important.', function(t) {
  const expectedCharacteristics = [{
    id: "AAAAAAA",
    deviceID: "3453987",
  }, {
    id: "BBBBBBB",
    deviceID: "3453987",
  }];

  const characteristicIds = ["aaaaaaa", "bbbbbbb"];

  runSuccessfullDiscoverTest(t, characteristicIds, expectedCharacteristics);
});

test('Tests discover characteristics, casing of to discover ids not important.', function(t) {
  const expectedCharacteristics = [{
    id: "aaaaaaa",
    deviceID: "3453987",
  }, {
    id: "bbbbbbb",
    deviceID: "3453987",
  }];

  const characteristicIds = ["AAAAAAA", "BBBBBBB"];

  runSuccessfullDiscoverTest(t, characteristicIds, expectedCharacteristics);
});

test('Tests discover characteristics, null to find array returns all characteristics.', function(t) {
  const expectedCharacteristics = [{
    id: "sdlkjksjljf",
    deviceID: "3453987",
  }, {
    id: "jssdflkjlk",
    deviceID: "3453987",
  }];

  runSuccessfullDiscoverTest(t, null, expectedCharacteristics);
});

test('Tests discover characteristics, empty to find array returns all characteristics.', function(t) {
  const expectedCharacteristics = [{
    id: "sdlkjksjljf",
    deviceID: "3453987",
  }, {
    id: "jssdflkjlk",
    deviceID: "3453987",
  }];

  runSuccessfullDiscoverTest(t, [], expectedCharacteristics);
});

test('Tests discover characteristics, correctly handles discovery error.', function(t) {
  const expectedError = new Error("An error occurred");

  const discoveryCallbackParams = {
    error: expectedError,
  };

  NativeEventEmitter.callBackParams[ReactNativeBluetooth.CharacteristicDiscovered] = [discoveryCallbackParams];

  discoverCharacteristics(testService, null)
    .then(() => {
      t.fail();
    })
    .catch(error => {
      t.deepEqual(error, expectedError);
      t.end();
    });
});
