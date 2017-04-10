/**
 * Copyright (c) 2016-present, Sogilis SARL
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;
import android.util.Log;

import com.sogilis.ReactNativeBluetooth.domain.BluetoothException;
import com.sogilis.ReactNativeBluetooth.events.EventEmitter;

import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

public abstract class BluetoothAction {
    public final String eventName;
    public final String deviceId;
    private String id;
    private EventEmitter eventEmitter;

    protected BluetoothAdapter bluetoothAdapter;

    public abstract void run() throws BluetoothException;

    public BluetoothAction(String eventName, EventEmitter eventEmitter) {
        this(eventName, null, eventEmitter);
    }

    public BluetoothAction(String eventName, String deviceId, EventEmitter eventEmitter) {
        this(eventName, deviceId, deviceId, eventEmitter);
    }

    public BluetoothAction(String eventName, String deviceId, String id, EventEmitter eventEmitter) {
        this.eventName = eventName;
        this.deviceId = deviceId;
        this.id = id;
        this.eventEmitter = eventEmitter;
        this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    public void start() {
        if (this.bluetoothAdapter == null) {
            emitError("Bluetooth not supported");
        }

        if (!this.bluetoothAdapter.isEnabled()) {
            emitError("Bluetooth disabled");
        }

        try {
            this.run();
        }
        catch(BluetoothException e) {
            emitError(e.getMessage());
        }
    }

    public void cancel(String reason) {
        Log.d(MODULE_NAME, "BluetoothAction " + eventName + " cancelled because of [" + reason + "]");
        emitError(reason);
    }

    private void emitError(String errorMessage) {
        eventEmitter.emitError(eventName, errorMessage, id);
    }

    public String toString() {
        String shortName = eventName.substring(eventName.lastIndexOf(".") + 1);
        return shortName + " <" + deviceId + ">";
    }
}
