package com.sogilis.ReactNativeBluetooth.domain;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;

import java.util.concurrent.ConcurrentHashMap;

public class GattCollection {
    private ConcurrentHashMap<String, BluetoothGatt> gatts = new ConcurrentHashMap<>();

    public void add(BluetoothGatt gatt) {
        gatts.put(gatt.getDevice().getAddress(), gatt);
    }

    public BluetoothGatt removeByDeviceAddress(String address) {
        return gatts.remove(address);
    }

    public BluetoothGatt findByAddress(String address) throws BluetoothException {
        if (gatts.containsKey(address)) {
            return gatts.get(address);
        } else {
            throw new BluetoothException("Unknown or disconnected device: " + address);
        }
    }

    public BluetoothGatt findByDevice(BluetoothDevice device) throws BluetoothException {
        return findByAddress(device.getAddress());
    }

    public void clear() {
        gatts.clear();
    }
}
