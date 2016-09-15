package com.sogilis.ReactNativeBluetooth.domain;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
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
        gatt.writeDescriptor(descriptor);
    }

    public static void disableNotification(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        BluetoothGattDescriptor descriptor = configDescriptor(characteristic);
        descriptor.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        gatt.writeDescriptor(descriptor);
        gatt.setCharacteristicNotification(characteristic, false);
    }
}
