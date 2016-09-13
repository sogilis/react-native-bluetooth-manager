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
import static com.sogilis.ReactNativeBluetooth.events.EventNames.*;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.findServiceById;
import static com.sogilis.ReactNativeBluetooth.domain.BluetoothHelpers.findCharacteristicById;
import static com.sogilis.ReactNativeBluetooth.util.UUIDHelpers.uuidsFromStrings;
import static com.sogilis.ReactNativeBluetooth.events.EventBuilders.*;

import java.util.HashMap;
import java.util.Map;

public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    private DeviceCollection discoveredDevices = new DeviceCollection();
    private GattCollection gattCollection = new GattCollection();
    private EventEmitter eventEmitter;

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        eventEmitter = new EventEmitter(reactContext);

        reactContext.registerReceiver(stateChangeReceiver,
                new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
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
        constants.put("ServiceDiscovered", SERVICE_DISCOVERED);
        constants.put("CharacteristicDiscoveryStarted", CHARACTERISTIC_DISCOVERY_STARTED);
        constants.put("CharacteristicDiscovered", CHARACTERISTIC_DISCOVERED);
        constants.put("CharacteristicRead", CHARACTERISTIC_READ);
        constants.put("CharacteristicWritten", CHARACTERISTIC_WRITTEN);
        constants.put("CharacteristicNotified", CHARACTERISTIC_NOTIFIED);

        return constants;
    }

    // States
    private static final String STATE_ENABLED = "enabled";
    private static final String STATE_DISABLED = "disabled";

    @Override public String getName() { return MODULE_NAME; }

    @ReactMethod
    public void notifyCurrentState() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
            emit(stateChanged(STATE_ENABLED));
        } else {
            emit(stateChanged(STATE_DISABLED));
        }
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

    private void didEnableBluetooth() {
        emit(stateChanged(STATE_ENABLED));
    }

    private void didDisableBluetooth() {
        gattCollection.clear();
        emit(stateChanged(STATE_DISABLED));
    }

    @ReactMethod
    public void startScan(final ReadableArray uuidStrings) {
        new BluetoothAction(SCAN_STARTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.startLeScan(uuidsFromStrings(uuidStrings), scanCallback);
                emit(scanStarted());
            }
        };
    }

    private BluetoothAdapter.LeScanCallback scanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {
            if (! discoveredDevices.includes(device)) {
                discoveredDevices.add(device);
                emit(deviceDiscovered(device));
            }
        }
    };

    @ReactMethod
    public void stopScan() {
        new BluetoothAction(SCAN_STOPPED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.stopLeScan(scanCallback);
                discoveredDevices.clear();
                emit(scanStopped());
            }
        };
    }

    @ReactMethod
    public void connect(final ReadableMap deviceMap) {
        final String address = deviceMap.getString("address");

        new BluetoothAction(DEVICE_CONNECTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                BluetoothDevice device = discoveredDevices.findByAddress(address);

                device.connectGatt(getReactApplicationContext(), false, gattCallback);
            }
        };
    }

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            BluetoothDevice device = gatt.getDevice();
            String address = device.getAddress();

            if (newState == BluetoothProfile.STATE_CONNECTED) {
                gattCollection.add(gatt);
                emit(deviceConnected(device));
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                gattCollection.removeByDeviceAddress(address);
                emit(deviceDisconnected(device));
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            for (BluetoothGattService service: gatt.getServices()) {
                emit(serviceDiscovered(gatt.getDevice(), service));
            }
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                emit(characteristicRead(gatt.getDevice(), characteristic));
            }
        }
    };

    @ReactMethod
    public void disconnect(final ReadableMap deviceMap) {
        final String address = deviceMap.getString("address");

        new BluetoothAction(DEVICE_DISCONNECTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                BluetoothGatt gatt = gattCollection.removeByDeviceAddress(address);
                gatt.disconnect();
            }
        };
    }

    @ReactMethod
    public void discoverServices(final ReadableMap deviceMap, final ReadableArray serviceIds) {
        final String address = deviceMap.getString("address");

        new BluetoothAction(SERVICE_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                BluetoothGatt gatt = gattCollection.findByAddress(address);

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
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                BluetoothDevice device = discoveredDevices.findById(deviceId);
                BluetoothGatt gatt = gattCollection.findByDevice(device);
                BluetoothGattService service = findServiceById(gatt, serviceId);

                emit(characteristicDiscoveryStarted(device, service));

                if (characteristicIds == null || characteristicIds.size() == 0) {
                    discoverAllCharacteristics(device, service);
                } else {
                    discoverRequestedCharacteristics(device, service, characteristicIds);
                }
            }
        };
    }

    private void discoverRequestedCharacteristics(BluetoothDevice device, BluetoothGattService service, ReadableArray characteristicIds) throws BluetoothException {
        for (int index = 0; index < characteristicIds.size(); index++) {
            BluetoothGattCharacteristic characteristic = findCharacteristicById(
                    device, service, characteristicIds.getString(index));

            emit(characteristicDiscovered(device, characteristic));
        }
    }

    private void discoverAllCharacteristics(BluetoothDevice device, BluetoothGattService service) {
        for (BluetoothGattCharacteristic characteristic: service.getCharacteristics()) {
            emit(characteristicDiscovered(device, characteristic));
        }
    }

    @ReactMethod
    public void readCharacteristicValue(final ReadableMap characteristicMap) {
        final String address = characteristicMap.getString("deviceId");
        final String serviceId = characteristicMap.getString("serviceId");
        final String characteristicId = characteristicMap.getString("id");

        new BluetoothAction(CHARACTERISTIC_READ, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                BluetoothGatt gatt = gattCollection.findByAddress(address);
                BluetoothGattService service = findServiceById(gatt, serviceId);
                BluetoothGattCharacteristic characteristic = findCharacteristicById(gatt.getDevice(), service, characteristicId);

                if (!gatt.readCharacteristic(characteristic)) {
                    eventEmitter.emitError(CHARACTERISTIC_READ,
                            "Could not initiate characteristic read for unknown reason.");
                }
            }
        };
    }

    private void emit(BluetoothEvent event) {
        eventEmitter.emit(event);
    }
}
