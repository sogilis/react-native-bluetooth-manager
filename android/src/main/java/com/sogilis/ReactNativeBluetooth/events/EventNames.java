package com.sogilis.ReactNativeBluetooth.events;

public class EventNames {
    public static final String STATE_CHANGED = name("STATE_CHANGED");
    public static final String SCAN_STARTED = name("SCAN_STARTED");
    public static final String SCAN_STOPPED = name("SCAN_STOPPED");
    public static final String DEVICE_DISCOVERED = name("DEVICE_DISCOVERED");
    public static final String DEVICE_CONNECTED = name("DEVICE_CONNECTED");
    public static final String DEVICE_DISCONNECTED = name("DEVICE_DISCONNECTED");
    public static final String SERVICE_DISCOVERY_STARTED = name("SERVICE_DISCOVERY_STARTED");
    public static final String SERVICE_DISCOVERED = name("SERVICE_DISCOVERED");

    private static final String name(String customNamePart) {
        return EventNames.class.getCanonicalName() + "." + customNamePart;
    }
}
