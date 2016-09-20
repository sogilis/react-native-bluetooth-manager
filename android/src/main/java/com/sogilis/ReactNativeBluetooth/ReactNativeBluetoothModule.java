package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Base64;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.sogilis.ReactNativeBluetooth.domain.BluetoothException;
import com.sogilis.ReactNativeBluetooth.domain.DeviceCollection;
import com.sogilis.ReactNativeBluetooth.domain.GattCollection;
import com.sogilis.ReactNativeBluetooth.events.BluetoothEvent;
import com.sogilis.ReactNativeBluetooth.events.EventEmitter;

import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.deviceId;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.disableNotification;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.enableNotification;
import static com.sogilis.ReactNativeBluetooth.events.EventNames.*;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.findServiceById;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.findCharacteristicById;
import static com.sogilis.ReactNativeBluetooth.util.UUIDHelpers.uuidsFromStrings;
import static com.sogilis.ReactNativeBluetooth.events.EventBuilders.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    @Override public String getName() { return MODULE_NAME; }

    private DeviceCollection discoveredDevices = new DeviceCollection();
    private GattCollection gattCollection = new GattCollection();
    private EventEmitter eventEmitter;

    // States
    private static final String STATE_ENABLED = "enabled";
    private static final String STATE_DISABLED = "disabled";

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        eventEmitter = new EventEmitter(reactContext);

        reactContext.registerReceiver(stateChangeReceiver,
                new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
    }

    private void emit(BluetoothEvent event) {
        eventEmitter.emit(event);
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
            if (! discoveredDevices.contains(device)) {
                discoveredDevices.add(device);
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
        };
    }

    @ReactMethod
    public void stopScan() {
        new BluetoothAction(SCAN_STOPPED, eventEmitter) {
            @Override
            public void run() {
                bluetoothAdapter.stopLeScan(scanCallback);
                emit(scanStopped());
            }
        };
    }

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            BluetoothDevice device = gatt.getDevice();
            String deviceId = deviceId(device);

            if (newState == BluetoothProfile.STATE_CONNECTED) {
                gattCollection.add(gatt);
                emit(deviceConnected(device));
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                gattCollection.close(deviceId);
                emit(deviceDisconnected(device));
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            emit(servicesDiscovered(gatt.getDevice(), gatt.getServices()));
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                emit(characteristicRead(gatt.getDevice(), characteristic));
            }
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                emit(characteristicWritten(gatt.getDevice(), characteristic));
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            emit(characteristicNotified(gatt.getDevice(), characteristic));
        }
    };

    @ReactMethod
    public void connect(final ReadableMap deviceMap) {
        final String deviceId = deviceMap.getString("id");

        new BluetoothAction(DEVICE_CONNECTED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothDevice device = discoveredDevices.get(deviceId);

                device.connectGatt(getReactApplicationContext(), false, gattCallback);
            }
        };
    }

    @ReactMethod
    public void disconnect(final ReadableMap deviceMap) {
        final String deviceId = deviceMap.getString("id");

        new BluetoothAction(DEVICE_DISCONNECTED, eventEmitter) {
            @Override
            public void run() {
                gattCollection.close(deviceId);
            }
        };
    }

    @ReactMethod
    public void discoverServices(final ReadableMap deviceMap, final ReadableArray serviceIds) {
        final String deviceId = deviceMap.getString("id");

        new BluetoothAction(SERVICE_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);

                gatt.discoverServices();
                emit(serviceDiscoveryStarted(gatt.getDevice()));
            }
        };
    }

    @ReactMethod
    public void discoverCharacteristics(final ReadableMap serviceMap, final ReadableArray characteristicIds) {
        final String deviceId = serviceMap.getString("deviceId");
        final String serviceId = serviceMap.getString("id");

        new BluetoothAction(CHARACTERISTIC_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothDevice device = discoveredDevices.get(deviceId);
                BluetoothGatt gatt = gattCollection.get(device);
                BluetoothGattService service = findServiceById(gatt, serviceId);

                emit(characteristicDiscoveryStarted(device, service));
                emit(characteristicsDiscovered(device, service,
                        filterCharacteristics(device, service, characteristicIds)));
            }
        };
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
                        findCharacteristicById(device, service, characteristicIds.getString(index)));
            }
            return characteristics;
        }
    }

    @ReactMethod
    public void readCharacteristicValue(final ReadableMap characteristicMap) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        new BluetoothAction(CHARACTERISTIC_READ, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristicById(gatt, serviceId, characteristicId);

                if (!gatt.readCharacteristic(characteristic)) {
                    eventEmitter.emitError(CHARACTERISTIC_READ,
                            "Could not initiate characteristic read for unknown reason.");
                }
            }
        };
    }

    @ReactMethod
    public void writeCharacteristicValue(final ReadableMap characteristicMap, final String base64Value, boolean withResponse) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        new BluetoothAction(CHARACTERISTIC_WRITTEN, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristicById(gatt, serviceId, characteristicId);

                characteristic.setValue(Base64.decode(base64Value, Base64.DEFAULT));

                if (!gatt.writeCharacteristic(characteristic)) {
                    eventEmitter.emitError(CHARACTERISTIC_WRITTEN,
                            "Could not initiate characteristic write for unknown reason.");
                }
            }
        };
    }

    @ReactMethod
    public void subscribeToNotification(final ReadableMap characteristicMap) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        new BluetoothAction(CHARACTERISTIC_NOTIFIED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristicById(gatt, serviceId, characteristicId);

                enableNotification(gatt, characteristic);
            }
        };
    }

    @ReactMethod
    public void unsubscribeFromNotification(final ReadableMap characteristicMap) {
        final String deviceId = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        new BluetoothAction(CHARACTERISTIC_NOTIFIED, eventEmitter) {
            @Override
            public void run() throws BluetoothException {
                BluetoothGatt gatt = gattCollection.get(deviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristicById(gatt, serviceId, characteristicId);

                disableNotification(gatt, characteristic);
            }
        };
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
