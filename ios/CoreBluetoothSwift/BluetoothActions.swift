//
//  BluetoothActions.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

public class BluetoothActions: NSObject {
    private let centralManager = CBCentralManager()
    private let centralEventHandler = CentralEventHandler()
    private let peripheralEventHandler = PeripheralEventHandler()

    private let backgroundQueue = dispatch_queue_create("rnBluetooth", DISPATCH_QUEUE_SERIAL)

    private var lastState = CBCentralManagerState.Unknown

    private var onStateChange: (BluetoothServiceReturn -> Void)?
    private var onStopScanComplete: (() -> Void)?
    private var onDeviceDiscovered: (BluetoothServiceReturn -> Void)?
    private var onDeviceConnected: (BluetoothServiceReturn -> Void)?
    private var onDeviceDisconnected: (BluetoothServiceReturn -> Void)?

    public var bluetoothState: String {
        get {
            return OutputBuilder.asStateChange(lastState)
        }
    }

    override init() {
        centralManager.delegate = centralEventHandler
    }

    public func startScan(serviceUUIDs: [String], onScanStarted: () -> Void) {
        let mappedIds = serviceUUIDs.map { CBUUID(string: $0) }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.scanForPeripheralsWithServices(mappedIds, options: nil)
            onScanStarted()
            print("Bluetooth scan started")
        })
    }

    public func stopScan(onStopScanComplete: () -> Void) {
        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.stopScan()
            onStopScanComplete()
            print("Bluetooth scan stopped")
        })
    }

    public func onChangeState(handler: String -> Void) {
        centralEventHandler.onStateChange { [unowned self] state in
            self.lastState = state

            handler(OutputBuilder.asStateChange(state))
        }
    }

    public func onServiceDiscovered(handler: BluetoothServiceReturn -> Void) {
        peripheralEventHandler.onServiceDiscovered { serviceInfo in
            handler(OutputBuilder.asService(serviceInfo))
        }
    }

    public func onCharacteristicRead(handler: BluetoothServiceReturn -> Void) {
        peripheralEventHandler.onCharacteristicValueUpdated { newValue in
            handler(OutputBuilder.asCharacteristicValue(newValue))
        }
    }

    public func writeCharacteristicValue(characteristicId: String, data: NSData, length: Int,
                                         handler: BluetoothServiceReturn -> Void) {
        // find characteristic, write data
//      let dataToSend = NSData(bytes: [UInt8](tikeeId.utf8), length: tikeeId.utf8.count)
//      peripheral.writeValue(dataToSend, forCharacteristic: confirmCharacteristic,
//        type: CBCharacteristicWriteType.WithResponse)

        peripheralEventHandler.onCharacteristicValueWritten { characteristicInfo in
            handler(OutputBuilder.asCharacteristicWriteResult(characteristicInfo))
        }
    }

    public func onCharacteristicNotified(handler: BluetoothServiceReturn -> Void) {
        peripheralEventHandler.onCharacteristicNotify { characteristicInfo in
            handler(OutputBuilder.asCharacteristic(characteristicInfo))
        }
    }

    public func onDeviceConnected(handler: BluetoothServiceReturn -> Void) {
        centralEventHandler.onDeviceConnected { device in
            device.delegate = self.peripheralEventHandler
            handler(OutputBuilder.asDevice(device))
        }
    }

    public func onDeviceDisconnected(handler: BluetoothServiceReturn -> Void) {
        centralEventHandler.onDeviceDisconnected { device in
            handler(OutputBuilder.asDevice(device))
        }
    }

    public func onDeviceDiscovered(handler: BluetoothServiceReturn -> Void) {
        centralEventHandler.onDeviceDiscovered { device in
            handler(OutputBuilder.asDevice(device))
        }
    }
}
