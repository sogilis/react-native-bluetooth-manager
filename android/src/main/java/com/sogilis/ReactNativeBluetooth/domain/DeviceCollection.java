package com.sogilis.ReactNativeBluetooth.domain;

import android.bluetooth.BluetoothDevice;

import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.deviceId;

import java.util.concurrent.ConcurrentHashMap;

public class DeviceCollection {
    private ConcurrentHashMap<String, BluetoothDevice> devices = new ConcurrentHashMap<>();

    public boolean contains(BluetoothDevice device) {
        return devices.containsKey(deviceId(device));
    }

    public void add(BluetoothDevice device) {
        devices.put(deviceId(device), device);
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
