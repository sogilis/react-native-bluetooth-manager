"use strict";

import {
  NativeEventEmitter,
  ReactNativeBluetooth,
  test,
  api,
} from './testCommon';

const {
  discoverServices,
} = api.default;

const testDevice = {
  id: "12345",
};

const runSuccessfullDiscoverTest = (t, serviceIdsToDiscover, expectedServices) => {
  const discoveryCallbackParams = {
    services: expectedServices,
  };

  NativeEventEmitter.callBackParams[ReactNativeBluetooth.ServiceDiscovered] = [discoveryCallbackParams];

  discoverServices(testDevice, serviceIdsToDiscover)
    .then(services => {
      t.deepEqual(services, expectedServices);
      t.end();
    })
    .catch(error => {
      t.fail(`Discover services error ${error.message}`);
    });
};

test('Tests discover services, single service.', function(t) {
  const expectedServices = [{
    id: "8798798",
    deviceID: "3453987",
  }];

  const serviceIds = ["8798798"];

  runSuccessfullDiscoverTest(t, serviceIds, expectedServices);
});

test('Tests discover services, multiple services.', function(t) {
  const expectedServices = [{
    id: "8798798",
    deviceID: "3453987",
  }, {
    id: "78987987",
    deviceID: "3453987",
  }];

  const serviceIds = ["8798798", "78987987"];

  runSuccessfullDiscoverTest(t, serviceIds, expectedServices);
});

test('Tests discover services, casing of expected ids not important.', function(t) {
  const expectedServices = [{
    id: "AAAAAAA",
    deviceID: "3453987",
  }, {
    id: "BBBBBBB",
    deviceID: "3453987",
  }];

  const serviceIds = ["aaaaaaa", "bbbbbbb"];

  runSuccessfullDiscoverTest(t, serviceIds, expectedServices);
});

test('Tests discover services, casing of to discover ids not important.', function(t) {
  const expectedServices = [{
    id: "aaaaaaa",
    deviceID: "3453987",
  }, {
    id: "bbbbbbb",
    deviceID: "3453987",
  }];

  const serviceIds = ["AAAAAAA", "BBBBBBB"];

  runSuccessfullDiscoverTest(t, serviceIds, expectedServices);
});

test('Tests discover services, null to find array returns all services.', function(t) {
  const expectedServices = [{
    id: "sdlkjksjljf",
    deviceID: "3453987",
  }, {
    id: "jssdflkjlk",
    deviceID: "3453987",
  }];

  runSuccessfullDiscoverTest(t, null, expectedServices);
});

test('Tests discover services, empty to find array returns all services.', function(t) {
  const expectedServices = [{
    id: "sdlkjksjljf",
    deviceID: "3453987",
  }, {
    id: "jssdflkjlk",
    deviceID: "3453987",
  }];

  runSuccessfullDiscoverTest(t, [], expectedServices);
});

test('Tests discover services, correctly handles discovery error.', function(t) {
  const expectedError = new Error("An error occurred");

  const discoveryCallbackParams = {
    error: expectedError,
  };

  NativeEventEmitter.callBackParams[ReactNativeBluetooth.ServiceDiscovered] = [discoveryCallbackParams];

  discoverServices(testDevice, null)
    .then(() => {
      t.fail();
    })
    .catch(error => {
      t.deepEqual(error, expectedError);
      t.end();
    });
});
