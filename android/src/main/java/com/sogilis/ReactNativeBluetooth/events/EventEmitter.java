package com.sogilis.ReactNativeBluetooth.events;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.util.Base64;
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

    public void emit(String eventName) {
        emitEvent(new BluetoothEvent(eventName, null));
    }

    public void emit(String eventName, String eventData) {
        emitEvent(new BluetoothEvent(eventName, eventData));
    }

    public void emit(String eventName, BluetoothDevice device) {
        WritableMap deviceMap = new WritableNativeMap();

        deviceMap.putString("id", device.getAddress());
        deviceMap.putString("address", device.getAddress());
        deviceMap.putString("name", device.getName());

        emitMap(eventName, deviceMap);
    }

    public void emit(String eventName, BluetoothDevice device, BluetoothGattService service) {
        WritableMap serviceMap = new WritableNativeMap();

        serviceMap.putString("id", service.getUuid().toString());
        serviceMap.putString("deviceId", device.getAddress());

        emitMap(eventName, serviceMap);
    }

    public void emit(String eventName, BluetoothDevice device, BluetoothGattService service, BluetoothGattCharacteristic characteristic) {
        WritableMap characteristicMap = new WritableNativeMap();

        characteristicMap.putString("id", characteristic.getUuid().toString());
        characteristicMap.putString("serviceId", service.getUuid().toString());
        characteristicMap.putString("deviceId", device.getAddress());

        emitMap(eventName, characteristicMap);
    }

    public void emitError(String eventName, String errorMessage) {
        WritableMap errorMap = new WritableNativeMap();
        errorMap.putString("error", errorMessage);
        emitMap(eventName, errorMap);
    }

    public void emitMap(String eventName, ReadableMap eventMap) {
        emitEvent(new BluetoothEvent(eventName, eventMap));
    }

    public void emitEvent(BluetoothEvent event) {
        logEvent(event);
        reactContext.
                getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                emit(event.getName(), event.getData());
    }

    private void logEvent(BluetoothEvent event) {
        if (event.isError()) {
            Log.e(MODULE_NAME, event.toString());
        } else {
            Log.d(MODULE_NAME, event.toString());
        }
    }

    public void emitCharacteristicValue(String eventName, BluetoothDevice device, BluetoothGattService service, BluetoothGattCharacteristic characteristic) {
        String value = Base64.encodeToString(characteristic.getValue(), Base64.DEFAULT);
        WritableMap valueMap = new WritableNativeMap();

        valueMap.putString("value", value);
        valueMap.putString("characteristicId", characteristic.getUuid().toString());
        valueMap.putString("serviceId", service.getUuid().toString());
        valueMap.putString("deviceId", device.getAddress());

        emitMap(eventName, valueMap);
    }
}
