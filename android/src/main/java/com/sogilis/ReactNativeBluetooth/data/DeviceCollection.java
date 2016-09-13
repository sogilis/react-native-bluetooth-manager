package com.sogilis.ReactNativeBluetooth.data;

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

    public BluetoothDevice findByAddress(String address) {
        return findById(address);
    }

    public BluetoothDevice findById(String id) {
        return devices.get(id);
    }
}
