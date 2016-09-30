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
        return alreadyPresentGatt == null;
    }

    public void close(String deviceId) {
        BluetoothGatt gatt = gatts.remove(deviceId);

        if (gatt != null) {
            disconnect(gatt);
        }
    }

    private void disconnect(BluetoothGatt gatt) {
        BluetoothDevice device = gatt.getDevice();
        Log.d(MODULE_NAME, "Disconnecting from " + device.getName() + " (" + device.getAddress() + ")");
        gatt.close();
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
