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
        Log.d(MODULE_NAME, "Loop - add " + bluetoothAction);
        actionsQueue.add(bluetoothAction);
        tick();
    }

    void actionDone() {
        Log.d(MODULE_NAME, "Loop - done " + currentAction);
        currentAction = null;
        tick();
    }

    public int size() {
        return actionsQueue.size();
    }

    private synchronized void tick() {
        if (currentAction != null) {
            Log.d(MODULE_NAME, "Loop#tick - already pending " + currentAction);
            return;
        }

        if (actionsQueue.isEmpty()) {
            Log.d(MODULE_NAME, "Loop#tick - empty queue");
            return;
        }

        currentAction = actionsQueue.poll();
        Log.d(MODULE_NAME, "Loop#tick - running " + currentAction);
        currentAction.start();
    }

    public void clear() {
        currentAction = null;
        actionsQueue.clear();
    }
}
