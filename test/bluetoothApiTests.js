"use strict";

import mockery from "mockery";
import {
  Configuration
} from './reactNativeMock';

const test = require('blue-tape');

mockery.enable();
mockery.warnOnUnregistered(false);

mockery.registerSubstitute('react-native', './test/reactNativeMock.js');

const api = require("../");

test('Tests stop scan success', function(t) {
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

test('Tests stop scan fail', function(t) {
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
