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
