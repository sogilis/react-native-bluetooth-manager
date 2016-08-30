package com.sogilis.ReactNativeBluetooth;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ReactNativeBluetoothModule extends ReactContextBaseJavaModule {

    public ReactNativeBluetoothModule(ReactApplicationContext reactContext) { super(reactContext); }
    @Override public String getName() { return "ReactNativeBluetooth"; }
}
