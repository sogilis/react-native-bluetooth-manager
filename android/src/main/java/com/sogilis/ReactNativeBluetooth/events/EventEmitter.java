package com.sogilis.ReactNativeBluetooth.events;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

public class EventEmitter {
    private final ReactApplicationContext reactContext;

    public EventEmitter(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    public void emit(BluetoothEvent event) {
        log(event);
        reactContext.
                getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                emit(event.getName(), event.getData());
    }

    private void log(BluetoothEvent event) {
        if (event.isError()) {
            Log.e(MODULE_NAME, event.toString());
        } else {
            Log.d(MODULE_NAME, event.toString());
        }
    }

    public void emitError(String eventName, String errorMessage) {
        emit(EventBuilder.error(eventName, errorMessage));
    }
}
