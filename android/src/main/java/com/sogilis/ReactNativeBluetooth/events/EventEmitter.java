package com.sogilis.ReactNativeBluetooth.events;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

public class EventEmitter {
    private final ReactApplicationContext reactContext;

    public EventEmitter(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    public void emit(String eventName, BluetoothDevice device) {
        WritableMap deviceMap = new WritableNativeMap();

        deviceMap.putString("id", device.getAddress());
        deviceMap.putString("address", device.getAddress());
        deviceMap.putString("name", device.getName());

        emit(eventName, deviceMap);
    }

    public void emit(String eventName, BluetoothDevice device, BluetoothGattService service) {
        WritableMap serviceMap = new WritableNativeMap();

        serviceMap.putString("id", service.getUuid().toString());
        serviceMap.putString("deviceId", device.getAddress());

        emit(eventName, serviceMap);
    }

    public void emit(String eventName, BluetoothDevice device, BluetoothGattService service, BluetoothGattCharacteristic characteristic) {
        WritableMap characteristicMap = new WritableNativeMap();

        characteristicMap.putString("id", characteristic.getUuid().toString());
        characteristicMap.putString("serviceId", service.getUuid().toString());
        characteristicMap.putString("deviceId", device.getAddress());

        emit(eventName, characteristicMap);
    }

    public void emit(String eventName, Object eventData) {
        reactContext.
                getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                emit(eventName, eventData);
    }

    public void emit(String eventName) {
        logEvent(eventName, null);
        emit(eventName, (Object) null);
    }

    public void emit(String eventName, ReadableMap eventMap) {
        logEvent(eventName, eventMap);
        emit(eventName, (Object) eventMap);
    }

    private void logEvent(String eventName, ReadableMap eventMap) {
        String shortEventName = eventName.substring(eventName.lastIndexOf(".") + 1);

        if (eventMap == null) {
            Log.d(MODULE_NAME, shortEventName);
        } else if (eventMap.hasKey("error")) {
            Log.e(MODULE_NAME, shortEventName + ": " + eventMap.getString("error"));
        } else {
            Log.d(MODULE_NAME, shortEventName + ": " + eventMap.toString());
        }
    }

    public void emitError(String eventName, String errorMessage) {
        WritableMap errorMap = new WritableNativeMap();
        errorMap.putString("error", errorMessage);
        emit(eventName, errorMap);
    }

}
