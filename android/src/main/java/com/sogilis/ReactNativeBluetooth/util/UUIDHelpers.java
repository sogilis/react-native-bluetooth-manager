package com.sogilis.ReactNativeBluetooth.util;

import com.facebook.react.bridge.ReadableArray;

import java.util.UUID;

public class UUIDHelpers {
    public static UUID[] uuidsFromStrings(ReadableArray uuidStrings) {
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
}
