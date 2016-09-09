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

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.sogilis.ReactNativeBluetooth.events.EventEmitter;
import com.sogilis.ReactNativeBluetooth.events.EventNames;
import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    private HashMap<String, BluetoothDevice> discoveredDevices = new HashMap<>();
    private HashMap<String, BluetoothGatt> gattClients = new HashMap<>();
    private EventEmitter eventEmitter;

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        eventEmitter = new EventEmitter(reactContext);

        reactContext.registerReceiver(stateChangeReceiver,
                new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
    }

    @Override public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("StateChanged", EventNames.STATE_CHANGED);
        constants.put("ScanStarted", EventNames.SCAN_STARTED);
        constants.put("ScanStopped", EventNames.SCAN_STOPPED);
        constants.put("DeviceDiscovered", EventNames.DEVICE_DISCOVERED);
        constants.put("DeviceConnected", EventNames.DEVICE_CONNECTED);
        constants.put("DeviceDisconnected", EventNames.DEVICE_DISCONNECTED);
        constants.put("ServiceDiscoveryStarted", EventNames.SERVICE_DISCOVERY_STARTED);
        constants.put("ServiceDiscovered", EventNames.SERVICE_DISCOVERED);

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
            eventEmitter.emit(EventNames.STATE_CHANGED, STATE_ENABLED);
        } else {
            eventEmitter.emit(EventNames.STATE_CHANGED, STATE_DISABLED);
        }
    }

    private BroadcastReceiver stateChangeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final int newStateCode = intent.getIntExtra(
                    BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);

            if (newStateCode == BluetoothAdapter.STATE_ON) {
                eventEmitter.emit(EventNames.STATE_CHANGED, STATE_ENABLED);
            } else if (newStateCode == BluetoothAdapter.STATE_OFF) {
                eventEmitter.emit(EventNames.STATE_CHANGED, STATE_DISABLED);
            }
        }
    };

    @ReactMethod
    public void startScan(final ReadableArray uuidStrings) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.startLeScan(uuidsFromStrings(uuidStrings), scanCallback);
                eventEmitter.emit(EventNames.SCAN_STARTED);
            }

            @Override
            public void withoutBluetooth(String message) {
                eventEmitter.emitError(EventNames.SCAN_STARTED, message);
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
                discoveredDevices.put(device.getAddress(), device);
                eventEmitter.emit(EventNames.DEVICE_DISCOVERED, device);
            }
        }
    };

    @ReactMethod
    public void stopScan() {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                bluetoothAdapter.stopLeScan(scanCallback);
                discoveredDevices.clear();
                eventEmitter.emit(EventNames.SCAN_STOPPED);
            }
            @Override
            public void withoutBluetooth(String message) {
                eventEmitter.emitError(EventNames.SCAN_STOPPED, message);
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
                    eventEmitter.emitError(EventNames.DEVICE_CONNECTED, "No such device: " + address);
                    return;
                }

                device.connectGatt(getReactApplicationContext(), false, gattCallback);
            }
            @Override
            public void withoutBluetooth(String message) {
                gattClients.clear();
                eventEmitter.emitError(EventNames.DEVICE_CONNECTED, message);
            }
        };
    }

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            BluetoothDevice device = gatt.getDevice();
            String address = device.getAddress();

            if (newState == BluetoothProfile.STATE_CONNECTED) {
                gattClients.put(address, gatt);
                eventEmitter.emit(EventNames.DEVICE_CONNECTED, device);
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                gattClients.remove(address);
                eventEmitter.emit(EventNames.DEVICE_DISCONNECTED, device);
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            for (BluetoothGattService service: gatt.getServices()) {
                eventEmitter.emit(EventNames.SERVICE_DISCOVERED, service);
            }
        }
    };

    @ReactMethod
    public void disconnect(final ReadableMap deviceMap) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                BluetoothGatt gatt = gattClients.remove(deviceMap.getString("address"));
                gatt.disconnect();
            }
            @Override
            public void withoutBluetooth(String message) {
                gattClients.clear();
                eventEmitter.emitError(EventNames.DEVICE_DISCONNECTED, message);
            }
        };
    }

    @ReactMethod
    public void discoverServices(final ReadableMap deviceMap, final ReadableArray serviceIds) {
        new BluetoothAction() {
            @Override
            public void withBluetooth(BluetoothAdapter bluetoothAdapter) {
                BluetoothGatt gatt = gattClients.get(deviceMap.getString("address"));
                gatt.discoverServices();
                eventEmitter.emit(EventNames.SERVICE_DISCOVERY_STARTED, gatt.getDevice());
            }
            @Override
            public void withoutBluetooth(String message) {
                gattClients.clear();
                eventEmitter.emitError(EventNames.SERVICE_DISCOVERY_STARTED, message);
            }
        };
    }
}
