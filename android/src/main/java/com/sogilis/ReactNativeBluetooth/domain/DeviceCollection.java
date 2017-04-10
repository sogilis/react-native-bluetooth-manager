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

package com.sogilis.ReactNativeBluetooth.domain;

import android.bluetooth.BluetoothDevice;

import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.deviceId;

import java.util.concurrent.ConcurrentHashMap;

public class DeviceCollection {
    private ConcurrentHashMap<String, BluetoothDevice> devices = new ConcurrentHashMap<>();

    public boolean add(BluetoothDevice device) {
        BluetoothDevice alreadyPresentDevice = devices.putIfAbsent(deviceId(device), device);
        return alreadyPresentDevice == null;
    }

    public int size() {
        return devices.size();
    }

    public void clear() {
        devices.clear();
    }

    public BluetoothDevice get(String id) throws BluetoothException {
        if (devices.containsKey(id)) {
            return devices.get(id);
        } else {
            throw new BluetoothException("No such device: " + id);
        }
    }
}
