package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;

public abstract class BluetoothAction {
    public abstract void withBluetooth(BluetoothAdapter bluetoothAdapter);
    public abstract void withoutBluetooth(String message);

    public BluetoothAction() {
        final BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (bluetoothAdapter == null) {
            this.withoutBluetooth("Bluetooth not supported");
        }

        if (!bluetoothAdapter.isEnabled()) {
            this.withoutBluetooth("Bluetooth disabled");
        }

        this.withBluetooth(bluetoothAdapter);
    }
}
