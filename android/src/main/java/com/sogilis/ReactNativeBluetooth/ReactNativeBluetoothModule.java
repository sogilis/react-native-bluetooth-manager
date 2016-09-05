package com.sogilis.ReactNativeBluetooth;

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.registerReceiver(stateChangeReceiver,
                new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
    }

    // Events
    private static final String EVENT_STATE_CHANGED =
            ReactNativeBluetoothModule.class.getCanonicalName() + ".EVENT_STATE_CHANGED";

    // States
    private static final String STATE_ENABLED = "enabled";
    private static final String STATE_DISABLED = "disabled";

    @Override public String getName() { return "ReactNativeBluetooth"; }

    private void notifyStateChange(String newState) {
        getReactApplicationContext().
                getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                emit(EVENT_STATE_CHANGED, newState);
    }

    private BroadcastReceiver stateChangeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final int newStateCode = intent.getIntExtra(
                    BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);

            if (newStateCode == BluetoothAdapter.STATE_ON) {
                notifyStateChange(STATE_ENABLED);
            } else if (newStateCode == BluetoothAdapter.STATE_OFF) {
                notifyStateChange(STATE_DISABLED);
            }
        }
    };

    @Override public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put("StateChanged", EVENT_STATE_CHANGED);

        return constants;
    }
}
