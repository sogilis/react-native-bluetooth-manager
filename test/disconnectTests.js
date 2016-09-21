"use strict";

import {
  TestConfiguration,
  test,
  api,
} from './testCommon';

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
  TestConfiguration.disconnectSucceed = false;

  const {
    disconnect
  } = api.default;

  const deviceId = "12345";
  const expectedError = new Error('Error');

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
