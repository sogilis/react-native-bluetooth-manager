/**
 * Copyright (c) 2016-present, Sogilis SARL
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    public static final String SERVICES_DISCOVERED = name("SERVICES_DISCOVERED");
    public static final String CHARACTERISTIC_DISCOVERY_STARTED = name("CHARACTERISTIC_DISCOVERY_STARTED");
    public static final String CHARACTERISTICS_DISCOVERED = name("CHARACTERISTICS_DISCOVERED");
    public static final String CHARACTERISTIC_READ = name("CHARACTERISTIC_READ");
    public static final String CHARACTERISTIC_WRITTEN = name("CHARACTERISTIC_WRITTEN");
    public static final String CHARACTERISTIC_NOTIFIED = name("CHARACTERISTIC_NOTIFIED");
    public static final String DESCRIPTOR_WRITE = name("DESCRIPTOR_WRITE");
    public static final String PAIRING_REQUEST = name("PAIRING_REQUEST");

    private static final String name(String customNamePart) {
        return MODULE_NAME + "." + customNamePart;
    }
}
