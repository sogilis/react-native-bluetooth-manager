package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;

import java.util.UUID;

public class BluetoothHelper {
    public static String deviceId(BluetoothDevice device) {
        return device.getAddress();
    }

    public static BluetoothGattService findServiceById(BluetoothGatt gatt, String serviceId) throws BluetoothException {
        BluetoothGattService service = gatt.getService(UUID.fromString(serviceId));

        if (service == null) {
            throw new BluetoothException("No such service: " + serviceId +
                " (device: " + deviceId(gatt.getDevice()));
        }

        return service;
    }
}
