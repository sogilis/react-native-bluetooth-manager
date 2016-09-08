package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.facebook.react.bridge.Promise;
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
    private static final String EVENT_DEVICE_DISCOVERED = EVENT_BASE_NAME + "DEVICE_DISCOVERED";

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
    public void startScan(final ReadableArray uuidStrings, final Promise promise) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.startLeScan(uuidsFromStrings(uuidStrings), scanCallback);
                promise.resolve(null);
            }

            @Override
            public void withoutBluetooth(String message) {
                promise.reject(message);
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
            Log.d(TAG, "Device discovered: \"" + device.getName() + "\" @" + device.getAddress());

            if (! discoveredDevices.containsKey(device.getAddress())) {
                discoveredDevices.put(device.getAddress(), device);
                emitDeviceDiscovered(device);
            }
        }
    };

    private void emitDeviceDiscovered(BluetoothDevice device) {
        WritableMap deviceMap = new WritableNativeMap();

        deviceMap.putString("address", device.getAddress());
        deviceMap.putString("name", device.getName());

        emit(EVENT_DEVICE_DISCOVERED, deviceMap);
    }

    private void emit(String eventName, Object eventData) {
        getReactApplicationContext().
                getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                emit(eventName, eventData);
    }

    @ReactMethod
    public void stopScan(final Promise promise) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.stopLeScan(scanCallback);
                discoveredDevices.clear();
                promise.resolve(null);
            }
            @Override
            public void withoutBluetooth(String message) {
                promise.reject(message);
            }
        };
    }

    @ReactMethod
    public void connect(final ReadableMap device, final Promise promise) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                // TODO
                promise.resolve(null);
            }
            @Override
            public void withoutBluetooth(String message) {
                promise.reject(message);
            }
        };
    }

    @ReactMethod
    public void disconnect(final ReadableMap device, final Promise promise) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                // TODO
                promise.resolve(null);
            }
            @Override
            public void withoutBluetooth(String message) {
                promise.reject(message);
            }
        };
    }

    @ReactMethod
    public void discoverServices(final ReadableMap device, final Promise promise) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                // TODO
                promise.resolve(null);
            }
            @Override
            public void withoutBluetooth(String message) {
                promise.reject(message);
            }
        };
    }

    @Override public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("StateChanged", EVENT_STATE_CHANGED);
        constants.put("DeviceDiscovered", EVENT_DEVICE_DISCOVERED);

        return constants;
    }
}
