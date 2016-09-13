package com.sogilis.ReactNativeBluetooth.events;

import com.facebook.react.bridge.ReadableMap;

public class BluetoothEvent {
    protected String name;
    protected Object data;

    public BluetoothEvent(String name, Object data) {
        this.name = name;
        this.data = data;
    }

    public String getName() {
        return this.name;
    }

    public String getShortName() {
        return name.substring(name.lastIndexOf(".") + 1);
    }

    public Object getData() {
        return data;
    }

    public boolean isError() {
        return (data instanceof ReadableMap) &&
                ((ReadableMap) data).hasKey("error");
    }

    public String toString() {
        return "{ " + getShortName() + ": " + (data != null ? data.toString() : "null") + " }";
    }
}
