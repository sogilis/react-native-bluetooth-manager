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
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;

import java.util.UUID;
import android.util.Log;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

public class BluetoothHelpers {
    public static String deviceId(BluetoothDevice device) {
        return device.getAddress();
    }

    public static String serviceId(BluetoothGattService service) {
        return service.getUuid().toString();
    }

    public static BluetoothGattService findServiceById(BluetoothGatt gatt, String serviceId) throws BluetoothException {
        BluetoothGattService service = gatt.getService(UUID.fromString(serviceId));

        if (service == null) {
            throw new BluetoothException("No such service: " + serviceId +
                " (device: " + deviceId(gatt.getDevice()) + ")");
        }

        return service;
    }

    public static BluetoothGattCharacteristic findCharacteristic(BluetoothGatt gatt, String serviceId, String characteristicId) throws BluetoothException {
        return findCharacteristic(gatt.getDevice(), findServiceById(gatt, serviceId), characteristicId);
    }

    public static BluetoothGattCharacteristic findCharacteristic(BluetoothDevice device, BluetoothGattService service, String characteristicId) throws BluetoothException {
        BluetoothGattCharacteristic characteristic = service.getCharacteristic(UUID.fromString(characteristicId));

        if (characteristic == null) {
            throw new BluetoothException("No such characteristic: " + characteristicId +
                " (service: " + serviceId(service) +
                ", device: " + deviceId(device) + ")");
        }

        return characteristic;
    }

    public static BluetoothGattCharacteristic findCharacteristic(BluetoothGatt gatt, String serviceId, String characteristicId, int property) throws BluetoothException {
        BluetoothGattService service = findServiceById(gatt, serviceId);
        BluetoothGattCharacteristic characteristic = findCharacteristic(gatt.getDevice(), service, characteristicId);

        if (! hasProperty(characteristic, property)) {
            throw new BluetoothException("Characteristic " + characteristicId +
                " doesn't have property " + propertyName(property) +
                    " (service: " + serviceId(service) +
                    ", device: " + deviceId(gatt.getDevice()) + ")");
        }

        return characteristic;
    }

    public static String propertyName(int property) throws BluetoothException {
        switch(property) {
            case BluetoothGattCharacteristic.PROPERTY_READ: return "READ";
            case BluetoothGattCharacteristic.PROPERTY_WRITE: return "WRITE";
            case BluetoothGattCharacteristic.PROPERTY_NOTIFY: return "NOTIFY";
            default: throw new BluetoothException("Unhandled characteristic property: " + Integer.toString(property));
        }
    }

    public static boolean hasProperty(BluetoothGattCharacteristic characteristic, int property) {
        return (characteristic.getProperties() & property) != 0;
    }

    public static final UUID CONFIG_DESCRIPTOR_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    public static BluetoothGattDescriptor configDescriptor(BluetoothGattCharacteristic characteristic) {
        return characteristic.getDescriptor(CONFIG_DESCRIPTOR_UUID);
    }

    public static void enableNotification(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        gatt.setCharacteristicNotification(characteristic, true);
        BluetoothGattDescriptor descriptor = configDescriptor(characteristic);
        descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        if(! gatt.writeDescriptor(descriptor)) {
            Log.d(MODULE_NAME, "enableNotification - writeDescriptor failed for unknown reason");
        } else {
            Log.d(MODULE_NAME, "enableNotification - writeDescriptor success");
        }
    }

    public static void disableNotification(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        BluetoothGattDescriptor descriptor = configDescriptor(characteristic);
        descriptor.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        gatt.writeDescriptor(descriptor);
        gatt.setCharacteristicNotification(characteristic, false);
    }

    public static String gattStatusString(int status) {
        switch(status) {
            case BluetoothGatt.GATT_CONNECTION_CONGESTED: return "Connection congested";
            case BluetoothGatt.GATT_FAILURE: return "Failure";
            case BluetoothGatt.GATT_INSUFFICIENT_AUTHENTICATION: return "Insufficient authentication";
            case BluetoothGatt.GATT_INSUFFICIENT_ENCRYPTION: return "Insufficient encryption";
            case BluetoothGatt.GATT_INVALID_ATTRIBUTE_LENGTH: return "Invalid attribute length";
            case BluetoothGatt.GATT_INVALID_OFFSET: return "Invalid offset";
            case BluetoothGatt.GATT_READ_NOT_PERMITTED: return "Read not permitted";
            case BluetoothGatt.GATT_REQUEST_NOT_SUPPORTED: return "Request not supported";
            case BluetoothGatt.GATT_WRITE_NOT_PERMITTED: return "Write not permitted";
            default: return "GATT error with unknown status code: " + status;
        }
    }
}
