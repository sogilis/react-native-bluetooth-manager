package com.sogilis.ReactNativeBluetooth;

import android.util.Log;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import static com.sogilis.ReactNativeBluetooth.Constants.MODULE_NAME;

class BluetoothActionsLoop {

    private Queue<BluetoothAction> actionsQueue ;
    private BluetoothAction currentAction;
    private BluetoothAction notificationAction;

    BluetoothActionsLoop() {
        this.actionsQueue = new ConcurrentLinkedQueue<>();
        this.currentAction = null;
        this.notificationAction = null;
    }

    void addAction(BluetoothAction bluetoothAction) {
        Log.d(MODULE_NAME, "Loop - add " + bluetoothAction);
        actionsQueue.add(bluetoothAction);
        tick();
    }

    void addNotificationAction(BluetoothAction bluetoothAction) {
        Log.d(MODULE_NAME, "NotificationActions - add " + bluetoothAction);
        notificationAction = bluetoothAction;
        if (!notificationAction.start()) {
            Log.d(MODULE_NAME, "NotificationActions - failed " + currentAction);
            notificationAction = null;
        }
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
        if (!currentAction.start()) {
            Log.d(MODULE_NAME, "Loop - failed " + currentAction);
            actionDone();
        }
    }

    public synchronized void cancelGattActions(String deviceId, String reason) {
        Log.d(MODULE_NAME, "Loop - cancel device actions for " + deviceId + " (" + size() + " action(s) in queue - currentAction = " + currentAction + ")");
        if (currentAction != null && deviceId.equals(currentAction.deviceId)) {
            currentAction.cancel(reason);
            currentAction = null;
        }
        for (BluetoothAction action: actionsQueue) {
            if (deviceId.equals(action.deviceId)) {
                actionsQueue.remove(action);
                action.cancel(reason);
            }
        }
        Log.d(MODULE_NAME, "Loop - " + size() + " action(s) left in queue - currentAction = " + currentAction + ")");
        tick();
        notificationAction = null;
    }

    public void clear() {
        currentAction = null;
        actionsQueue.clear();
    }
}
