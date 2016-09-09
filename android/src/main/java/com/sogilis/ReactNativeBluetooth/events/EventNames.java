package com.sogilis.ReactNativeBluetooth.events;

public class EventNames {
    private static final String BASE = EventNames.class.getCanonicalName() + ".EVENT_";

    public static final String STATE_CHANGED = BASE + "STATE_CHANGED";
    public static final String SCAN_STARTED = BASE + "SCAN_STARTED";
    public static final String SCAN_STOPPED = BASE + "SCAN_STOPPED";
    public static final String DEVICE_DISCOVERED = BASE + "DEVICE_DISCOVERED";
    public static final String DEVICE_CONNECTED = BASE + "DEVICE_CONNECTED";
    public static final String DEVICE_DISCONNECTED = BASE + "DEVICE_DISCONNECTED";
    public static final String SERVICE_DISCOVERY_STARTED = BASE + "SERVICE_DISCOVERY_STARTED";
    public static final String SERVICE_DISCOVERED = BASE + "SERVICE_DISCOVERED";
}
