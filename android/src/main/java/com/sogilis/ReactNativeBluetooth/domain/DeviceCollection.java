package com.sogilis.ReactNativeBluetooth.domain;

import android.bluetooth.BluetoothDevice;

import java.util.concurrent.ConcurrentHashMap;

public class DeviceCollection {
    private ConcurrentHashMap<String, BluetoothDevice> devices = new ConcurrentHashMap<>();

    public boolean includes(BluetoothDevice device) {
        return devices.containsKey(device.getAddress());
    }

    public void add(BluetoothDevice device) {
        devices.put(device.getAddress(), device);
    }

    public void clear() {
        devices.clear();
    }

    public BluetoothDevice findByAddress(String address) throws BluetoothException {
        return findById(address);
    }

    public BluetoothDevice findById(String id) throws BluetoothException {
        if (devices.containsKey(id)) {
            return devices.get(id);
        } else {
            throw new BluetoothException("No such device: " + id);
        }
    }
}
