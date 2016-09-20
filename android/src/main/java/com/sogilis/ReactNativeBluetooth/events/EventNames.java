package com.sogilis.ReactNativeBluetooth.events;

import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

public class EventNames {
    public static final String STATE_CHANGED = name("STATE_CHANGED");
    public static final String SCAN_STARTED = name("SCAN_STARTED");
    public static final String SCAN_STOPPED = name("SCAN_STOPPED");
    public static final String DEVICE_DISCOVERED = name("DEVICE_DISCOVERED");
    public static final String DEVICE_CONNECTED = name("DEVICE_CONNECTED");
    public static final String DEVICE_DISCONNECTED = name("DEVICE_DISCONNECTED");
    public static final String SERVICE_DISCOVERY_STARTED = name("SERVICE_DISCOVERY_STARTED");
    public static final String SERVICE_DISCOVERED = name("SERVICE_DISCOVERED");
    public static final String CHARACTERISTIC_DISCOVERY_STARTED = name("CHARACTERISTIC_DISCOVERY_STARTED");
    public static final String CHARACTERISTICS_DISCOVERED = name("CHARACTERISTICS_DISCOVERED");
    public static final String CHARACTERISTIC_READ = name("CHARACTERISTIC_READ");
    public static final String CHARACTERISTIC_WRITTEN = name("CHARACTERISTIC_WRITTEN");
    public static final String CHARACTERISTIC_NOTIFIED = name("CHARACTERISTIC_NOTIFIED");

    private static final String name(String customNamePart) {
        return MODULE_NAME + "." + customNamePart;
    }
}
