"use strict";

import {
  TestConfiguration,
  NativeEventEmitter,
  NativeModules,
} from './reactNativeMock';

const ReactNativeBluetooth = NativeModules.ReactNativeBluetooth;

const test = require('blue-tape');

import mockery from "mockery";

mockery.enable();
mockery.warnOnUnregistered(false);

mockery.registerSubstitute('react-native', './test/reactNativeMock.js');

const api = require("../");

export {
  ReactNativeBluetooth,
  TestConfiguration,
  NativeEventEmitter,
  NativeModules,
  test,
  api,
};
