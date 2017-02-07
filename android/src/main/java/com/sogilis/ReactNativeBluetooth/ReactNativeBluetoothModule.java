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

import android.bluetooth.*;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Base64;
import com.facebook.react.bridge.*;
import com.sogilis.ReactNativeBluetooth.domain.BluetoothException;
import com.sogilis.ReactNativeBluetooth.domain.DeviceCollection;
import com.sogilis.ReactNativeBluetooth.domain.GattCollection;
import com.sogilis.ReactNativeBluetooth.events.BluetoothEvent;
import com.sogilis.ReactNativeBluetooth.events.EventEmitter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.*;
import static com.sogilis.ReactNativeBluetooth.events.EventBuilders.*;
import static com.sogilis.ReactNativeBluetooth.events.EventNames.*;
import static com.sogilis.ReactNativeBluetooth.util.UUIDHelpers.uuidsFromStrings;


public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    @Override public String getName() { return MODULE_NAME; }

    private DeviceCollection discoveredDevices = new DeviceCollection();
    private GattCollection gattCollection = new GattCollection();
    private EventEmitter eventEmitter;

    // States
    private static final String STATE_ENABLED = "enabled";
    private static final String STATE_DISABLED = "disabled";

    private BluetoothActionsLoop bluetoothActionsLoop;

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        eventEmitter = new EventEmitter(reactContext);

        reactContext.registerReceiver(stateChangeReceiver,
                new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
        bluetoothActionsLoop = new BluetoothActionsLoop();
    }

    private void emit(BluetoothEvent event) {
        eventEmitter.emit(event);
    }

    private void emitGattError(String eventName, int status) {
        eventEmitter.emitError(eventName, gattStatusString(status));
    }

    private void didEnableBluetooth() {
        emit(stateChanged(STATE_ENABLED));
    }

    private void didDisableBluetooth() {
        gattCollection.clear();
        discoveredDevices.clear();
        emit(stateChanged(STATE_DISABLED));
    }

    private BroadcastReceiver stateChangeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
        final int newStateCode = intent.getIntExtra(
                BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);

        if (newStateCode == BluetoothAdapter.STATE_ON) {
            didEnableBluetooth();

        } else if (newStateCode == BluetoothAdapter.STATE_OFF) {
            didDisableBluetooth();
        }
        }
    };

    @ReactMethod
    public void notifyCurrentState() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
            emit(stateChanged(STATE_ENABLED));
        } else {
            emit(stateChanged(STATE_DISABLED));
        }
    }

    private BluetoothAdapter.LeScanCallback scanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {
            if (discoveredDevices.add(device)) {
                emit(deviceDiscovered(device));
            }
        }
    };

    @ReactMethod
    public void startScan(final ReadableArray uuidStrings) {
        new BluetoothAction(SCAN_STARTED, eventEmitter) {
            @Override
            public void run() {
                bluetoothAdapter.startLeScan(uuidsFromStrings(uuidStrings), scanCallback);
                emit(scanStarted());
            }
        }.start();
    }

    @ReactMethod
    public void stopScan() {
        new BluetoothAction(SCAN_STOPPED, eventEmitter) {
            @Override
            public void run() {
                bluetoothAdapter.stopLeScan(scanCallback);
                emit(scanStopped());
            }
        }.start();
    }


    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            BluetoothDevice device = gatt.getDevice();
            String deviceId = deviceId(device);
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                if (status == GATT_SUCCESS) {
                    gattCollection.add(gatt);
                    emit(deviceConnected(device));
                } else {
                    emitGattError(DEVICE_CONNECTED, status);
                }
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                if (status == GATT_SUCCESS) {
                    gattCollection.close(deviceId);
                    emit(deviceDisconnected(device));
                } else {
                    emitGattError(DEVICE_DISCONNECTED, status);
                }
            }
            bluetoothActionsLoop.actionDone();
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == GATT_SUCCESS) {
                emit(servicesDiscovered(gatt.getDevice(), gatt.getServices()));
            } else {
                emitGattError(SERVICES_DISCOVERED, status);
            }
            bluetoothActionsLoop.actionDone();
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == GATT_SUCCESS) {
                emit(characteristicRead(gatt.getDevice(), characteristic));
            } else {
                emitGattError(CHARACTERISTIC_READ, status);
            }
            bluetoothActionsLoop.actionDone();
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == GATT_SUCCESS) {
                emit(characteristicWritten(gatt.getDevice(), characteristic));
            } else {
                emitGattError(CHARACTERISTIC_WRITTEN, status);
            }
            bluetoothActionsLoop.actionDone();
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            super.onDescriptorWrite(gatt, descriptor, status);
            bluetoothActionsLoop.actionDone();
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            emit(characteristicNotified(gatt.getDevice(), characteristic));
            bluetoothActionsLoop.actionDone();
        }
    };

    @ReactMethod
    public void connect(final ReadableMap deviceMap) {
        final String deviceId = deviceMap.getString("id");

        BluetoothAction connectAction = new BluetoothAction(DEVICE_CONNECTED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothDevice device = discoveredDevices.get(deviceId);

                device.connectGatt(getReactApplicationContext(), false, gattCallback);
            }
        };

        bluetoothActionsLoop.addAction(connectAction);
    }

    @ReactMethod
    public void disconnect(final ReadableMap deviceMap) {
        final String deviceId = deviceMap.getString("id");

        BluetoothAction disconnectAction = new BluetoothAction(DEVICE_DISCONNECTED, eventEmitter) {
            @Override
            public void run() {
                gattCollection.close(deviceId);
                bluetoothActionsLoop.actionDone();
            }
        };

        bluetoothActionsLoop.addAction(disconnectAction);
    }

    @ReactMethod
    public void discoverServices(final ReadableMap deviceMap, final ReadableArray serviceIds) {
        final String deviceId = deviceMap.getString("id");

        BluetoothAction discoverServicesAction = new BluetoothAction(SERVICE_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);

                gatt.discoverServices();
                emit(serviceDiscoveryStarted(gatt.getDevice()));
            }
        };

        bluetoothActionsLoop.addAction(discoverServicesAction);
    }

    @ReactMethod
    public void discoverCharacteristics(final ReadableMap serviceMap, final ReadableArray characteristicIds) {
        final String deviceId = serviceMap.getString("deviceId");
        final String serviceId = serviceMap.getString("id");

        BluetoothAction discoverAction = new BluetoothAction(CHARACTERISTIC_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothDevice device = discoveredDevices.get(deviceId);
                BluetoothGatt gatt = gattCollection.get(device);
                BluetoothGattService service = findServiceById(gatt, serviceId);

                emit(characteristicDiscoveryStarted(device, service));
                emit(characteristicsDiscovered(device, service,
                        filterCharacteristics(device, service, characteristicIds)));
                bluetoothActionsLoop.actionDone();
            }
        };

        bluetoothActionsLoop.addAction(discoverAction);
    }

    private List<BluetoothGattCharacteristic> filterCharacteristics(BluetoothDevice device,
                                                                    BluetoothGattService service,
                                                                    ReadableArray characteristicIds) throws BluetoothException {
        if (characteristicIds == null || characteristicIds.size() == 0) {
            return service.getCharacteristics();
        } else {
            List<BluetoothGattCharacteristic> characteristics = new ArrayList<>();
            for (int index = 0; index < characteristicIds.size(); index++) {
                characteristics.add(
                        findCharacteristic(device, service, characteristicIds.getString(index)));
            }
            return characteristics;
        }
    }

    @ReactMethod
    public void readCharacteristicValue(final ReadableMap characteristicMap) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        BluetoothAction readAction = new BluetoothAction(CHARACTERISTIC_READ, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristic(gatt, serviceId, characteristicId, BluetoothGattCharacteristic.PROPERTY_READ);

                if (!gatt.readCharacteristic(characteristic)) {
                    eventEmitter.emitError(CHARACTERISTIC_READ,
                            "Could not initiate characteristic read for unknown reason.");
                    bluetoothActionsLoop.actionDone();
                }
            }
        };

        bluetoothActionsLoop.addAction(readAction);
    }

    @ReactMethod
    public void writeCharacteristicValue(final ReadableMap characteristicMap, final String base64Value, final boolean withResponse) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        BluetoothAction writeAction = new BluetoothAction(CHARACTERISTIC_WRITTEN, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristic(gatt, serviceId, characteristicId, BluetoothGattCharacteristic.PROPERTY_WRITE);

                characteristic.setValue(Base64.decode(base64Value, Base64.DEFAULT));

                if (withResponse) {
                    characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
                } else {
                    characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
                }

                if (!gatt.writeCharacteristic(characteristic)) {
                    eventEmitter.emitError(CHARACTERISTIC_WRITTEN,
                            "Could not initiate characteristic write for unknown reason.");
                    bluetoothActionsLoop.actionDone();
                }
            }
        };

        bluetoothActionsLoop.addAction(writeAction);
    }

    @ReactMethod
    public void subscribeToNotification(final ReadableMap characteristicMap) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        BluetoothAction subscribeAction = new BluetoothAction(CHARACTERISTIC_NOTIFIED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristic(gatt, serviceId, characteristicId, BluetoothGattCharacteristic.PROPERTY_NOTIFY);

                enableNotification(gatt, characteristic);
            }
        };

        bluetoothActionsLoop.addAction(subscribeAction);
    }

    @ReactMethod
    public void unsubscribeFromNotification(final ReadableMap characteristicMap) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        BluetoothAction unsubscribeAction = new BluetoothAction(CHARACTERISTIC_NOTIFIED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristic(gatt, serviceId, characteristicId, BluetoothGattCharacteristic.PROPERTY_NOTIFY);

                disableNotification(gatt, characteristic);
            }
        };

        bluetoothActionsLoop.addAction(unsubscribeAction);
    }

    @Override
    protected void finalize() throws Throwable {
        gattCollection.clear();
        super.finalize();
    }

    @Override public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("StateChanged", STATE_CHANGED);
        constants.put("ScanStarted", SCAN_STARTED);
        constants.put("ScanStopped", SCAN_STOPPED);
        constants.put("DeviceDiscovered", DEVICE_DISCOVERED);
        constants.put("DeviceConnected", DEVICE_CONNECTED);
        constants.put("DeviceDisconnected", DEVICE_DISCONNECTED);
        constants.put("ServiceDiscoveryStarted", SERVICE_DISCOVERY_STARTED);
        constants.put("ServiceDiscovered", SERVICES_DISCOVERED);
        constants.put("CharacteristicDiscoveryStarted", CHARACTERISTIC_DISCOVERY_STARTED);
        constants.put("CharacteristicDiscovered", CHARACTERISTICS_DISCOVERED);
        constants.put("CharacteristicRead", CHARACTERISTIC_READ);
        constants.put("CharacteristicWritten", CHARACTERISTIC_WRITTEN);
        constants.put("CharacteristicNotified", CHARACTERISTIC_NOTIFIED);

        return constants;
    }
}
