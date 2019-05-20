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
import android.bluetooth.BluetoothGatt;
import android.util.Log;

import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.deviceId;

import java.util.concurrent.ConcurrentHashMap;

public class GattCollection {
    private ConcurrentHashMap<String, BluetoothGatt> gatts = new ConcurrentHashMap<>();

    public boolean add(BluetoothGatt gatt) {
        BluetoothGatt alreadyPresentGatt = gatts.putIfAbsent(deviceId(gatt.getDevice()), gatt);

        if (alreadyPresentGatt != null) {        
            // old code could open two Gatt clients at the same time;
            // make sure that only one exists,
            // otherwise disconnect will not delete all clients
            // and the tikee will not return to its 'advertising' state.
            Log.d(MODULE_NAME, "### closing extra GATT client");
            gatt.disconnect();
            gatt.close();
            gatt = null;
        } else {
            BluetoothDevice device = gatt.getDevice();
            Log.d(MODULE_NAME, "=== adding GATT client " + device.getName() + " (" + device.getAddress() + ")");            
        }

        return alreadyPresentGatt == null;
    }

    public int size() {
        return gatts.size();
    }

    public void close(String deviceId) {
        BluetoothGatt gatt = gatts.remove(deviceId);

        if (gatt != null) {
            BluetoothDevice device = gatt.getDevice();
            Log.d(MODULE_NAME, "=== closing GATT client " + device.getName() + " (" + device.getAddress() + ")");
            gatt.close();
            gatt = null;
        }
    }

    public void close(BluetoothGatt gatt) {
        close(deviceId(gatt.getDevice()));
    }

    public BluetoothGatt get(String deviceId) throws BluetoothException {
        if (gatts.containsKey(deviceId)) {
            return gatts.get(deviceId);
        } else {
            throw new BluetoothException("Unknown or disconnected device: " + deviceId);
        }
    }

    public BluetoothGatt get(BluetoothDevice device) throws BluetoothException {
        return get(deviceId(device));
    }

    public void clear() {
        for (BluetoothGatt gatt: gatts.values()) {
            close(gatt);
        }
        gatts.clear();
    }
}
