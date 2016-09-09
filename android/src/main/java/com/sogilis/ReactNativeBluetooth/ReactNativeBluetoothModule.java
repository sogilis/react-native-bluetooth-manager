package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    private HashMap<String, BluetoothDevice> discoveredDevices = new HashMap<>();
    private HashMap<String, BluetoothGatt> gattClients = new HashMap<>();

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.registerReceiver(stateChangeReceiver,
                new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
    }

    // Logging
    private static final String TAG = ReactNativeBluetoothModule.class.getSimpleName();

    // Events
    private static final String EVENT_BASE_NAME =
            ReactNativeBluetoothModule.class.getCanonicalName() + ".EVENT_";

    private static final String EVENT_STATE_CHANGED = EVENT_BASE_NAME + "STATE_CHANGED";
    private static final String EVENT_SCAN_STARTED = EVENT_BASE_NAME + "SCAN_STARTED";
    private static final String EVENT_SCAN_STOPPED = EVENT_BASE_NAME + "SCAN_STOPPED";
    private static final String EVENT_DEVICE_DISCOVERED = EVENT_BASE_NAME + "DEVICE_DISCOVERED";
    private static final String EVENT_DEVICE_CONNECTED = EVENT_BASE_NAME + "DEVICE_CONNECTED";
    private static final String EVENT_DEVICE_DISCONNECTED = EVENT_BASE_NAME + "DEVICE_DISCONNECTED";
    private static final String EVENT_SERVICE_DISCOVERY_STARTED = EVENT_BASE_NAME + "SERVICE_DISCOVERY_STARTED";
    private static final String EVENT_SERVICE_DISCOVERED = EVENT_BASE_NAME + "SERVICE_DISCOVERED";

    @Override public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("StateChanged", EVENT_STATE_CHANGED);
        constants.put("ScanStarted", EVENT_SCAN_STARTED);
        constants.put("ScanStopped", EVENT_SCAN_STOPPED);
        constants.put("DeviceDiscovered", EVENT_DEVICE_DISCOVERED);
        constants.put("DeviceConnected", EVENT_DEVICE_CONNECTED);
        constants.put("DeviceDisconnected", EVENT_DEVICE_DISCONNECTED);
        constants.put("ServiceDiscoveryStarted", EVENT_SERVICE_DISCOVERY_STARTED);
        constants.put("ServiceDiscovered", EVENT_SERVICE_DISCOVERED);

        return constants;
    }

    // States
    private static final String STATE_ENABLED = "enabled";
    private static final String STATE_DISABLED = "disabled";

    @Override public String getName() { return "ReactNativeBluetooth"; }

    @ReactMethod
    public void notifyCurrentState() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
            emit(EVENT_STATE_CHANGED, STATE_ENABLED);
        } else {
            emit(EVENT_STATE_CHANGED, STATE_DISABLED);
        }
    }

    private BroadcastReceiver stateChangeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final int newStateCode = intent.getIntExtra(
                    BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);

            if (newStateCode == BluetoothAdapter.STATE_ON) {
                emit(EVENT_STATE_CHANGED, STATE_ENABLED);
            } else if (newStateCode == BluetoothAdapter.STATE_OFF) {
                emit(EVENT_STATE_CHANGED, STATE_DISABLED);
            }
        }
    };

    @ReactMethod
    public void startScan(final ReadableArray uuidStrings) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.startLeScan(uuidsFromStrings(uuidStrings), scanCallback);
                emit(EVENT_SCAN_STARTED);
            }

            @Override
            public void withoutBluetooth(String message) {
                emitError(EVENT_SCAN_STARTED, message);
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
            if (! discoveredDevices.containsKey(device.getAddress())) {
                Log.d(TAG, "Device discovered: \"" + device.getName() + "\" @" + device.getAddress());
                discoveredDevices.put(device.getAddress(), device);
                emit(EVENT_DEVICE_DISCOVERED, device);
            }
        }
    };

    private void emit(String eventName, BluetoothDevice device) {
        WritableMap deviceMap = new WritableNativeMap();

        deviceMap.putString("address", device.getAddress());
        deviceMap.putString("name", device.getName());

        emit(eventName, deviceMap);
    }

    private void emit(String eventName, BluetoothGattService service) {
        WritableMap serviceMap = new WritableNativeMap();

        serviceMap.putString("uuid", service.getUuid().toString());

        emit(eventName, serviceMap);
    }

    private void emit(String eventName, Object eventData) {
        getReactApplicationContext().
                getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                emit(eventName, eventData);
    }

    private void emit(String eventName) {
        emit(eventName, (Object) null);
    }

    private void emitError(String eventName, String errorMessage) {
        WritableMap errorMap = new WritableNativeMap();
        errorMap.putString("error", errorMessage);
        emit(eventName, errorMap);
    }

    @ReactMethod
    public void stopScan() {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.stopLeScan(scanCallback);
                discoveredDevices.clear();
                emit(EVENT_SCAN_STOPPED);
            }
            @Override
            public void withoutBluetooth(String message) {
                emitError(EVENT_SCAN_STOPPED, message);
            }
        };
    }

    @ReactMethod
    public void connect(final ReadableMap deviceMap) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                String address = deviceMap.getString("address");
                BluetoothDevice device = discoveredDevices.get(address);

                if (device == null) {
                    emitError(EVENT_DEVICE_CONNECTED, "No such device: " + address);
                    return;
                }

                device.connectGatt(getReactApplicationContext(), false, gattCallback);
            }
            @Override
            public void withoutBluetooth(String message) {
                emitError(EVENT_DEVICE_CONNECTED, message);
            }
        };
    }

    private BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            BluetoothDevice device = gatt.getDevice();
            String address = device.getAddress();

            if (status == BluetoothProfile.STATE_CONNECTED) {
                gattClients.put(address, gatt);
                emit(EVENT_DEVICE_CONNECTED, device);
            } else if (status == BluetoothProfile.STATE_DISCONNECTED) {
                gattClients.remove(address);
                emit(EVENT_DEVICE_DISCONNECTED, device);
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            for (BluetoothGattService service: gatt.getServices()) {
                emit(EVENT_SERVICE_DISCOVERED, service);
            }
        }
    };

    @ReactMethod
    public void disconnect(final ReadableMap deviceMap) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                BluetoothGatt gatt = gattClients.get(deviceMap.getString("address"));
                gatt.disconnect();
            }
            @Override
            public void withoutBluetooth(String message) {
                emitError(EVENT_DEVICE_DISCONNECTED, message);
            }
        };
    }

    @ReactMethod
    public void discoverServices(final ReadableMap deviceMap) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                BluetoothGatt gatt = gattClients.get(deviceMap.getString("address"));
                gatt.discoverServices();
            }
            @Override
            public void withoutBluetooth(String message) {
                emitError(EVENT_SERVICE_DISCOVERY_STARTED, message);
            }
        };
    }
}
