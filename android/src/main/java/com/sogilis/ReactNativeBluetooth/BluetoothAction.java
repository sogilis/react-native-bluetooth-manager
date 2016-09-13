package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;

import com.sogilis.ReactNativeBluetooth.events.EventEmitter;

public abstract class BluetoothAction {
    private String eventName;
    private EventEmitter eventEmitter;

    public abstract void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException;

    public BluetoothAction(String eventName, EventEmitter eventEmitter) {
        this.eventName = eventName;
        this.eventEmitter = eventEmitter;

        final BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (bluetoothAdapter == null) {
            emitError("Bluetooth not supported");
        }

        if (!bluetoothAdapter.isEnabled()) {
            emitError("Bluetooth disabled");
        }

        try {
            this.withBluetooth(bluetoothAdapter);
        }
        catch(BluetoothException e) {
            emitError(e.getMessage());
        }
    }

    private void emitError(String errorMessage) {
        eventEmitter.emitError(eventName, errorMessage);
    }
}
