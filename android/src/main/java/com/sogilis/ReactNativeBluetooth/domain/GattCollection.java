package com.sogilis.ReactNativeBluetooth.domain;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;

import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.deviceId;

import java.util.concurrent.ConcurrentHashMap;

public class GattCollection {
    private ConcurrentHashMap<String, BluetoothGatt> gatts = new ConcurrentHashMap<>();

    public void add(BluetoothGatt gatt) {
        gatts.put(deviceId(gatt.getDevice()), gatt);
    }

    public BluetoothGatt removeByDeviceId(String deviceId) {
        return gatts.remove(deviceId);
    }

    public BluetoothGatt findByDeviceId(String deviceId) throws BluetoothException {
        if (gatts.containsKey(deviceId)) {
            return gatts.get(deviceId);
        } else {
            throw new BluetoothException("Unknown or disconnected device: " + deviceId);
        }
    }

    public BluetoothGatt findByDevice(BluetoothDevice device) throws BluetoothException {
        return findByDeviceId(deviceId(device));
    }

    public void clear() {
        gatts.clear();
    }
}
