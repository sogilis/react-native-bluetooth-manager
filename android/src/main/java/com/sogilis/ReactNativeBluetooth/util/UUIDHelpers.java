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

package com.sogilis.ReactNativeBluetooth.util;

import com.facebook.react.bridge.ReadableArray;

import java.util.UUID;

public class UUIDHelpers {
    public static UUID[] uuidsFromStrings(ReadableArray uuidStrings) {
        if (uuidStrings != null) {
            UUID[] uuids = new UUID[uuidStrings.size()];
            for (int i = 0; i < uuidStrings.size(); i++) {
                uuids[i] = UUID.fromString(uuidStrings.getString(i));
            }
            return uuids;
        } else {
            return new UUID[0];
        }
    }
}
