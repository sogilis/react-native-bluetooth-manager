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

package com.sogilis.ReactNativeBluetooth.events;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.util.Base64;

import static android.bluetooth.BluetoothGattCharacteristic.*;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.List;

import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.serviceId;
import static com.sogilis.ReactNativeBluetooth.events.EventNames.*;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.deviceId;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.hasProperty;

public class EventBuilders {
    public static BluetoothEvent stateChanged(String newState) {
        return new BluetoothEvent(STATE_CHANGED, newState);
    }

    public static BluetoothEvent scanStarted() {
        return new BluetoothEvent(SCAN_STARTED, new WritableNativeMap());
    }

    public static BluetoothEvent scanStopped() {
        return new BluetoothEvent(SCAN_STOPPED, new WritableNativeMap());
    }

    public static BluetoothEvent deviceDiscovered(BluetoothDevice device) {
        return new BluetoothEvent(DEVICE_DISCOVERED, deviceMap(device));
    }

    public static BluetoothEvent deviceConnected(BluetoothDevice device) {
        return new BluetoothEvent(DEVICE_CONNECTED, deviceMap(device));
    }

    public static BluetoothEvent deviceDisconnected(BluetoothDevice device) {
        return new BluetoothEvent(DEVICE_DISCONNECTED, deviceMap(device));
    }

    public static BluetoothEvent serviceDiscoveryStarted(BluetoothDevice device) {
        return new BluetoothEvent(SERVICE_DISCOVERY_STARTED, deviceMap(device));
    }

    public static BluetoothEvent servicesDiscovered(BluetoothDevice device, List<BluetoothGattService> services) {
        return new BluetoothEvent(SERVICES_DISCOVERED, serviceListMap(device, services));
    }

    public static BluetoothEvent characteristicDiscoveryStarted(BluetoothDevice device, BluetoothGattService service) {
        return new BluetoothEvent(CHARACTERISTIC_DISCOVERY_STARTED, serviceMap(device, service));
    }

    public static BluetoothEvent characteristicsDiscovered(BluetoothDevice device,
                                                           BluetoothGattService service,
                                                           List<BluetoothGattCharacteristic> characteristics) {
        return new BluetoothEvent(CHARACTERISTICS_DISCOVERED,
                characteristicListMap(device, service, characteristics));
    }

    public static BluetoothEvent characteristicRead(BluetoothDevice device,
                                                    BluetoothGattCharacteristic characteristic) {
        return new BluetoothEvent(CHARACTERISTIC_READ,
                characteristicMap(device, characteristic));
    }

    public static BluetoothEvent characteristicWritten(BluetoothDevice device,
                                                       BluetoothGattCharacteristic characteristic) {
        return new BluetoothEvent(CHARACTERISTIC_WRITTEN,
                characteristicMap(device, characteristic));
    }

    public static BluetoothEvent characteristicNotified(BluetoothDevice device,
                                                        BluetoothGattCharacteristic characteristic) {
        return new BluetoothEvent(CHARACTERISTIC_NOTIFIED,
                characteristicMap(device, characteristic));
    }

    public static BluetoothEvent error(String eventName, String errorMessage, String optionalId) {
        return new BluetoothEvent(eventName, errorMap(errorMessage, optionalId));
    }

    public static ReadableMap deviceMap(BluetoothDevice device) {
        WritableMap map = new WritableNativeMap();

        map.putString("id", deviceId(device));
        map.putString("address", device.getAddress());
        map.putString("name", device.getName());

        return map;
    }

    public static WritableMap serviceMap(BluetoothDevice device, BluetoothGattService service) {
        WritableMap map = new WritableNativeMap();

        map.putString("id", service.getUuid().toString());
        map.putString("deviceId", deviceId(device));

        return map;
    }

    public static WritableMap serviceListMap(BluetoothDevice device, List<BluetoothGattService> services) {
        WritableMap map = new WritableNativeMap();

        map.putString("deviceId", deviceId(device));
        map.putArray("services", serviceArray(device, services));

        return map;
    }

    public static WritableArray serviceArray(BluetoothDevice device, List<BluetoothGattService> services) {
        WritableArray array = new WritableNativeArray();

        for (BluetoothGattService service: services) {
            array.pushMap(serviceMap(device, service));
        }

        return array;
    }

    public static WritableMap characteristicMap(BluetoothDevice device, BluetoothGattCharacteristic characteristic) {
        byte[] value = characteristic.getValue();
        String encodedValue = (value != null ? Base64.encodeToString(value, Base64.DEFAULT) : null);
        WritableMap map = new WritableNativeMap();

        map.putString("value", encodedValue);
        map.putString("id", characteristic.getUuid().toString());
        map.putString("serviceId", characteristic.getService().getUuid().toString());
        map.putString("deviceId", deviceId(device));
        map.putMap("properties", propertiesMap(characteristic));

        return map;
    }

    private static ReadableMap characteristicListMap(BluetoothDevice device, BluetoothGattService service, List<BluetoothGattCharacteristic> characteristics) {
        WritableMap map = new WritableNativeMap();

        map.putString("deviceId", deviceId(device));
        map.putString("serviceId", serviceId(service));
        map.putArray("characteristics", characteristicArray(device, characteristics));

        return map;
    }

    private static WritableArray characteristicArray(BluetoothDevice device, List<BluetoothGattCharacteristic> characteristics) {
        WritableArray array = new WritableNativeArray();

        for (BluetoothGattCharacteristic characteristic: characteristics) {
            array.pushMap(characteristicMap(device, characteristic));
        }

        return array;
    }

    public static WritableMap propertiesMap(BluetoothGattCharacteristic characteristic) {
        WritableMap map = new WritableNativeMap();

        map.putBoolean("read", hasProperty(characteristic, PROPERTY_READ));
        map.putBoolean("write", hasProperty(characteristic, PROPERTY_WRITE));
        map.putBoolean("notify", hasProperty(characteristic, PROPERTY_NOTIFY));

        return map;
    }

    public static ReadableMap errorMap(String errorMessage, String optionalId) {
        WritableMap map = new WritableNativeMap();
        map.putString("error", errorMessage);
        if (optionalId != null) {
            map.putString("id", optionalId);
        }
        return map;
    }
}
