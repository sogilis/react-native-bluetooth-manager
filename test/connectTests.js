"use strict";

import {
  test,
  api,
  TestConfiguration,
} from './testCommon';

const {
  connect,
} = api.default;

const connectionDevice = {
  id: "12345",
};

test('Tests connect success.', function(t) {
  connect(connectionDevice)
  .then(connected => {
    t.deepEqual(connectionDevice, connected);
    t.end();
  })
  .catch(() => {
    t.fail();
  });
});

test('Tests connect failure.', function(t) {
  TestConfiguration.connectSucceed = false;

  const expectedError = new Error('Error');

  connect(connectionDevice)
  .then(() => {
    t.fail();
  })
  .catch(error => {
    t.deepEqual(error, expectedError);
    t.end();
  });
});
