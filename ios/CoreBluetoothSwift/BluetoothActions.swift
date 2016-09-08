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
//    private var onDeviceConnected: (BluetoothServiceReturn -> Void)?
    private var onDeviceDisconnected: (BluetoothServiceReturn -> Void)?

    private var discoveredPeripherals = [NSUUID: CBPeripheral]()


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
            // Where do we do this?
//            self.cleanConnections()
//            self.discoveredPeripherals.removeAll()

            onStopScanComplete()
            print("Bluetooth scan stopped")
        })
    }

    public func connect(device: [String: AnyObject], onConnection: () -> Void) {
        guard let deviceIdString = device["id"] as? String else {
            print("No device id found. Can not connect")
            onConnection()
            return
        }

        guard let deviceId = NSUUID(UUIDString: deviceIdString) else {
            print("Invalid device id found. Can not connect")
            onConnection()
            return
        }

        guard let device = self.discoveredPeripherals[deviceId] else {
            print("No device found. Can not connect", deviceId, discoveredPeripherals)
            onConnection()
            return
        }

        centralEventHandler.onDeviceConnected { device in
            device.delegate = self.peripheralEventHandler
            onConnection()
        }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.connectPeripheral(device, options: nil)
        })
    }

    public func disconnect(device: [String: AnyObject], onDisconnection: () -> Void) {
        guard let deviceIdString = device["id"] as? String else {
            print("No device id found. Can not disconnect")
            onDisconnection()
            return
        }

        guard let deviceId = NSUUID(UUIDString: deviceIdString) else {
            print("Invalid device id found. Can not disconnect")
            onDisconnection()
            return
        }

        guard let device = self.discoveredPeripherals[deviceId] else {
            print("No device found. Can not disconnect")
            onDisconnection()
            return
        }
        // todo: this won't work on multiple disconnect calls

        centralEventHandler.onDeviceConnected { device in
            onDisconnection()
        }

        centralManager.cancelPeripheralConnection(device)

    }

    public func discoverServices(device: [String: AnyObject],
                                 services: [String]?,
                                 onDiscoverStarted: () -> Void) {

        guard let deviceIdString = device["id"] as? String else {
            print("No device id found. Can not start service discovery.")
            return
        }

        guard let deviceId = NSUUID(UUIDString: deviceIdString) else {
            print("Invalid device id found. Can not start service discovery.")
            onDiscoverStarted()
            return
        }

        guard let device = self.discoveredPeripherals[deviceId] else {
            print("No device found. Can not start service discovery.")
            return
        }


        dispatch_async(backgroundQueue, {
            let serviceIds = services?.map { CBUUID(string: $0) }
            print("Discovering service ids", serviceIds)
            device.discoverServices(serviceIds)
            onDiscoverStarted()
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

            let lastService = serviceInfo.0.services?.last

            guard let service = lastService else {
                print ("Service discovered but unable to look up detail.")
                return
            }

            handler(OutputBuilder.asService(service))
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

//    public func onDeviceConnected(handler: BluetoothServiceReturn -> Void) {
//        centralEventHandler.onDeviceConnected { device in
//            device.delegate = self.peripheralEventHandler
//            handler(OutputBuilder.asDevice(device))
//        }
//    }

    public func onDeviceDisconnected(handler: BluetoothServiceReturn -> Void) {
        centralEventHandler.onDeviceDisconnected { device in
            handler(OutputBuilder.asDevice(device))
        }
    }

    public func onDeviceDiscovered(handler: BluetoothServiceReturn -> Void) {
        centralEventHandler.onDeviceDiscovered { [unowned self] device in
            if self.discoveredPeripherals[device.identifier] == nil {
                self.discoveredPeripherals[device.identifier] = device
            }

            handler(OutputBuilder.asDevice(device))
        }
    }

    func cleanConnections() {
        self.discoveredPeripherals
            .map { $0.1 }
            .forEach { [unowned self] peripheral in

            guard peripheral.state == .Connected else {
                return
            }

            guard let services = peripheral.services else {
                self.centralManager.cancelPeripheralConnection(peripheral)
                return
            }

            services
                .filter { $0.characteristics != nil }
                .map { $0.characteristics!}
                .forEach { characteristics in
                    characteristics.filter { $0.isNotifying }.forEach {
                        peripheral.setNotifyValue(false, forCharacteristic: $0)
                    }
            }
        }
    }
}
