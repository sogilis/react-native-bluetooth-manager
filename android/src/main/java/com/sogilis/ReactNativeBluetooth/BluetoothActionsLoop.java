package com.sogilis.ReactNativeBluetooth;

import android.util.Log;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

class BluetoothActionsLoop {

    private Queue<BluetoothAction> actionsQueue ;
    private BluetoothAction currentAction;

    BluetoothActionsLoop() {
        this.actionsQueue = new ConcurrentLinkedQueue<>();
        this.currentAction = null;
    }

    void addAction(BluetoothAction bluetoothAction) {
        actionsQueue.add(bluetoothAction);
        tick();
    }

    void actionDone() {
        currentAction = null;
        tick();
    }

    private synchronized void tick() {
        if (currentAction != null) {
            Log.d(MODULE_NAME, "BluetoothActionsLoop::tick - already a pending action: " + currentAction.eventName);
            return;
        }

        if (actionsQueue.isEmpty()) {
            Log.d(MODULE_NAME, "BluetoothActionsLoop::tick - no action to process");
            return;
        }

        currentAction = actionsQueue.poll();
        Log.d(MODULE_NAME, "BluetoothActionsLoop::tick - processing new action: " + currentAction.eventName);
        currentAction.start();
    }
}
