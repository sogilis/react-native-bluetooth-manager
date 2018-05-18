/**
 * Copyright (c) 2016-present, Sogilis SARL
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  makeBleEventListener,
  ReactNativeBluetooth,
} from './lib';

import { Buffer } from 'buffer';

const readCharacteristicValue = characteristic => {
  return new Promise((resolve, reject) => {
    const resultMapper = detail => {
      return {
        ...detail,
        base64Value: detail.value,
        value: new Buffer(detail.value, 'base64'),
      };
    };

    makeBleEventListener(resolve, reject, ReactNativeBluetooth.CharacteristicRead, characteristic, resultMapper);

    ReactNativeBluetooth.readCharacteristicValue(characteristic);
  });
};

export {
  readCharacteristicValue,
};
