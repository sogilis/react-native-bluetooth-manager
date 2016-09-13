package com.sogilis.ReactNativeBluetooth.events;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.util.Base64;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class EventBuilder {
    public static BluetoothEvent stateChanged(String newState) {
        return new BluetoothEvent(EventNames.STATE_CHANGED, newState);
    }

    public static BluetoothEvent scanStarted() {
        return new BluetoothEvent(EventNames.SCAN_STARTED, null);
    }

    public static BluetoothEvent scanStopped() {
        return new BluetoothEvent(EventNames.SCAN_STOPPED, null);
    }

    public static BluetoothEvent deviceDiscovered(BluetoothDevice device) {
        return new BluetoothEvent(EventNames.DEVICE_DISCOVERED, deviceMap(device));
    }

    public static BluetoothEvent deviceConnected(BluetoothDevice device) {
        return new BluetoothEvent(EventNames.DEVICE_CONNECTED, deviceMap(device));
    }

    public static BluetoothEvent deviceDisconnected(BluetoothDevice device) {
        return new BluetoothEvent(EventNames.DEVICE_DISCONNECTED, deviceMap(device));
    }

    public static BluetoothEvent serviceDiscoveryStarted(BluetoothDevice device) {
        return new BluetoothEvent(EventNames.SERVICE_DISCOVERY_STARTED, deviceMap(device));
    }

    public static BluetoothEvent serviceDiscovered(BluetoothDevice device, BluetoothGattService service) {
        return new BluetoothEvent(EventNames.SERVICE_DISCOVERED, serviceMap(device, service));
    }

    public static BluetoothEvent characteristicDiscoveryStarted(BluetoothDevice device, BluetoothGattService service) {
        return new BluetoothEvent(EventNames.CHARACTERISTIC_DISCOVERY_STARTED, serviceMap(device, service));
    }

    public static BluetoothEvent characteristicDiscovered(BluetoothDevice device,
                                                          BluetoothGattService service,
                                                          BluetoothGattCharacteristic characteristic) {
        return new BluetoothEvent(EventNames.CHARACTERISTIC_DISCOVERED,
                characteristicMap(device, service, characteristic));
    }

    public static BluetoothEvent characteristicRead(BluetoothDevice device,
                                                    BluetoothGattService service,
                                                    BluetoothGattCharacteristic characteristic) {
        return new BluetoothEvent(EventNames.CHARACTERISTIC_READ,
                characteristicMap(device, service, characteristic));
    }

    public static BluetoothEvent error(String eventName, String errorMessage) {
        return new BluetoothEvent(eventName, errorMap(errorMessage));
    }

    public static ReadableMap deviceMap(BluetoothDevice device) {
        WritableMap map = new WritableNativeMap();

        map.putString("id", device.getAddress());
        map.putString("address", device.getAddress());
        map.putString("name", device.getName());

        return map;
    }

    public static ReadableMap serviceMap(BluetoothDevice device, BluetoothGattService service) {
        WritableMap map = new WritableNativeMap();

        map.putString("id", service.getUuid().toString());
        map.putString("deviceId", device.getAddress());

        return map;
    }

    public static ReadableMap characteristicMap(BluetoothDevice device, BluetoothGattService service, BluetoothGattCharacteristic characteristic) {
        byte[] value = characteristic.getValue();
        String encodedValue = (value != null ? Base64.encodeToString(value, Base64.DEFAULT) : null);
        WritableMap map = new WritableNativeMap();

        map.putString("value", encodedValue);
        map.putString("id", characteristic.getUuid().toString());
        map.putString("serviceId", service.getUuid().toString());
        map.putString("deviceId", device.getAddress());

        return map;
    }

    public static ReadableMap errorMap(String errorMessage) {
        WritableMap map = new WritableNativeMap();
        map.putString("error", errorMessage);
        return map;
    }
}
