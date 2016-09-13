package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;

import java.util.UUID;

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

    public static BluetoothGattCharacteristic findCharacteristicById(BluetoothDevice device, BluetoothGattService service, String characteristicId) throws BluetoothException {
        BluetoothGattCharacteristic characteristic = service.getCharacteristic(UUID.fromString(characteristicId));

        if (characteristic == null) {
            throw new BluetoothException("No such characteristic: " + characteristicId +
                " (service: " + serviceId(service) +
                ", device: " + deviceId(device) + ")");
        }

        return characteristic;
    }
}
