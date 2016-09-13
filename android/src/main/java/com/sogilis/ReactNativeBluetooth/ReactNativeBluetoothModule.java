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
import com.sogilis.ReactNativeBluetooth.data.DeviceCollection;
import com.sogilis.ReactNativeBluetooth.data.GattCollection;
import com.sogilis.ReactNativeBluetooth.events.EventBuilder;
import com.sogilis.ReactNativeBluetooth.events.EventEmitter;
import static com.sogilis.ReactNativeBluetooth.events.EventNames.*;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
            eventEmitter.emit(EventBuilder.stateChanged(STATE_ENABLED));
        } else {
            eventEmitter.emit(EventBuilder.stateChanged(STATE_DISABLED));
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
        eventEmitter.emit(EventBuilder.stateChanged(STATE_ENABLED));
    }

    private void didDisableBluetooth() {
        gattCollection.clear();
        eventEmitter.emit(EventBuilder.stateChanged(STATE_DISABLED));
    }

    @ReactMethod
    public void startScan(final ReadableArray uuidStrings) {
        new BluetoothAction(SCAN_STARTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.startLeScan(uuidsFromStrings(uuidStrings), scanCallback);
                eventEmitter.emit(EventBuilder.scanStarted());
            }
        };
    }

    private UUID[] uuidsFromStrings(ReadableArray uuidStrings) {
        if (uuidStrings != null) {
            UUID[] uuids = new UUID[uuidStrings.size()];
            for (int i = 0; i < uuidStrings.size(); i++) {
                uuids[i] = UUID.fromString(uuidStrings.getString(i));
            }
            return uuids;
        } else {
            return new UUID[0];
        }
    }

    private BluetoothAdapter.LeScanCallback scanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {
            if (! discoveredDevices.includes(device)) {
                discoveredDevices.add(device);
                eventEmitter.emit(EventBuilder.deviceDiscovered(device));
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
                eventEmitter.emit(EventBuilder.scanStopped());
            }
        };
    }

    @ReactMethod
    public void connect(final ReadableMap deviceMap) {
        new BluetoothAction(DEVICE_CONNECTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                String address = deviceMap.getString("address");
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
                eventEmitter.emit(EventBuilder.deviceConnected(device));
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                gattCollection.removeByDeviceAddress(address);
                eventEmitter.emit(EventBuilder.deviceDisconnected(device));
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            for (BluetoothGattService service: gatt.getServices()) {
                eventEmitter.emit(EventBuilder.serviceDiscovered(gatt.getDevice(), service));
            }
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                eventEmitter.emit(EventBuilder.characteristicRead(gatt.getDevice(), characteristic.getService(), characteristic));
            }
        }
    };

    @ReactMethod
    public void disconnect(final ReadableMap deviceMap) {
        new BluetoothAction(DEVICE_DISCONNECTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                BluetoothGatt gatt = gattCollection.removeByDeviceAddress(deviceMap.getString("address"));
                gatt.disconnect();
            }
        };
    }

    @ReactMethod
    public void discoverServices(final ReadableMap deviceMap, final ReadableArray serviceIds) {
        new BluetoothAction(SERVICE_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                String address = deviceMap.getString("address");
                BluetoothGatt gatt = gattCollection.findByAddress(address);

                gatt.discoverServices();
                eventEmitter.emit(EventBuilder.serviceDiscoveryStarted(gatt.getDevice()));
            }
        };
    }

    @ReactMethod
    public void discoverCharacteristics(final ReadableMap serviceMap, final ReadableArray characteristicIds) {
        new BluetoothAction(CHARACTERISTIC_DISCOVERY_STARTED, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                String deviceId = serviceMap.getString("deviceId");
                BluetoothDevice device = discoveredDevices.findById(deviceId);
                BluetoothGatt gatt = gattCollection.findByDevice(device);

                String serviceId = serviceMap.getString("id");
                BluetoothGattService service = gatt.getService(UUID.fromString(serviceId));
                if (service == null) {
                    eventEmitter.emitError(CHARACTERISTIC_DISCOVERY_STARTED,
                            "Cannot discover characteristics: no such service: " + serviceId +
                            " (device: " + deviceId + ")");
                    return;
                }

                eventEmitter.emit(EventBuilder.characteristicDiscoveryStarted(device, service));

                if (characteristicIds == null || characteristicIds.size() == 0) {
                    discoverAllCharacteristics(device, service);
                } else {
                    discoverRequestedCharacteristics(device, service, characteristicIds);
                }
            }
        };
    }

    private void discoverRequestedCharacteristics(BluetoothDevice device, BluetoothGattService service, ReadableArray characteristicIds) {
        for (int index = 0; index < characteristicIds.size(); index++) {
            UUID uuid = UUID.fromString(characteristicIds.getString(index));
            BluetoothGattCharacteristic characteristic = service.getCharacteristic(uuid);

            if (characteristic == null) {
                eventEmitter.emitError(CHARACTERISTIC_DISCOVERED,
                        "No such characteristic: " + uuid.toString() +
                                "(device: " + device.getAddress() + ", " +
                                "service: " + service.getUuid().toString() + ")");
            } else {
                eventEmitter.emit(EventBuilder.characteristicDiscovered(device, service, characteristic));
            }
        }
    }

    private void discoverAllCharacteristics(BluetoothDevice device, BluetoothGattService service) {
        for (BluetoothGattCharacteristic characteristic: service.getCharacteristics()) {
            eventEmitter.emit(EventBuilder.characteristicDiscovered(device, service, characteristic));
        }
    }

    @ReactMethod
    public void readCharacteristicValue(final ReadableMap characteristicMap) {
        new BluetoothAction(CHARACTERISTIC_READ, eventEmitter) {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) throws BluetoothException {
                String address = characteristicMap.getString("deviceId");
                BluetoothGatt gatt = gattCollection.findByAddress(address);

                String serviceId = characteristicMap.getString("serviceId");
                BluetoothGattService service = gatt.getService(UUID.fromString(serviceId));
                if (service == null) {
                    eventEmitter.emitError(CHARACTERISTIC_READ,
                            "No such service: " + serviceId +
                                    " (device: " + address + ")");
                    return;
                }

                String characteristicId = characteristicMap.getString("id");
                BluetoothGattCharacteristic characteristic = service.getCharacteristic(
                        UUID.fromString(characteristicId));
                if(characteristic == null) {
                    eventEmitter.emitError(CHARACTERISTIC_READ,
                            "No such characteristic: " + characteristicId +
                            " (service: " + serviceId +
                            ", device: " + address + ")");
                    return;
                }

                if (!gatt.readCharacteristic(characteristic)) {
                    eventEmitter.emitError(CHARACTERISTIC_READ,
                            "Could not initiate characteristic read for unknown reason.");
                }
            }
        };
    }
}
