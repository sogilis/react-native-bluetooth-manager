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

    private var onDeviceConnectedHandler: BluetoothServiceReturn -> Void = { _ in }
    private var onDeviceDisconnectedHandler: BluetoothServiceReturn -> Void = { _ in }

    private var lastState = CBCentralManagerState.Unknown

    private var discoveredPeripherals = [NSUUID: CBPeripheral]()


    public var bluetoothState: String {
        get {
            return OutputBuilder.asStateChange(lastState)
        }
    }

    override init() {
        centralManager.delegate = centralEventHandler
    }

    private func getDevice(lookup: [String: AnyObject]) -> CBPeripheral? {
        guard let deviceIdString = lookup["id"] as? String else {
            print("No device id found.")
            return nil
        }

        guard let deviceId = NSUUID(UUIDString: deviceIdString) else {
            print("Invalid device id found.")
            return nil
        }

        guard let device = self.discoveredPeripherals[deviceId] else {
            print("No device found", deviceId, discoveredPeripherals)
            return nil
        }

        return device
    }


    public func startScan(serviceUUIDs: [String], onScanStarted: (BluetoothServiceReturn) -> Void) {
        let mappedIds = serviceUUIDs.map { CBUUID(string: $0) }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.scanForPeripheralsWithServices(mappedIds, options: nil)
            onScanStarted([String:String]())
            print("Bluetooth scan started")
        })
    }

    public func stopScan(onStopScanComplete: (BluetoothServiceReturn) -> Void) {
        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.stopScan()

            onStopScanComplete([String:String]())
            print("Bluetooth scan stopped")
        })
    }

    public func connect(deviceLookup: [String: AnyObject]) {
        guard let device = getDevice(deviceLookup) else {
            print("No device found. Can not connect")
            onDeviceConnectedHandler([
                "error": "No device found"]
            )
            return
        }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.connectPeripheral(device, options: nil)
        })
    }

    public func disconnect(deviceLookup: [String: AnyObject]) {
        guard let device = getDevice(deviceLookup) else {
            print("No device found. Can not discover services")
            onDeviceDisconnectedHandler([
                "error": "No device found"]
            )
            return
        }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.cancelPeripheralConnection(device)
        })
    }

    public func discoverServices(deviceLookup: [String: AnyObject],
                                 services: [String]?,
                                 onDiscoverStarted: (BluetoothServiceReturn) -> Void) {

        guard let device = getDevice(deviceLookup) else {
            print("No device found. Can not discover services")
            onDiscoverStarted([
                "error": "No device found"
                ])
            return
        }

        dispatch_async(backgroundQueue, {
            let serviceIds = services?.map { CBUUID(string: $0) }
            print("Discovering service ids", serviceIds)
            device.discoverServices(serviceIds)
            onDiscoverStarted(BluetoothServiceReturn())
        })
    }

    public func discoverCharacteristics(service: [String: AnyObject],
                                        characteristics: [String]?,
                                        onDiscoverStarted: (BluetoothServiceReturn) -> Void) {
        print("Discovering characteristics.")

        guard let device = getDevice(["id" : service["deviceId"] ?? "unknown"]) else {
            print("No device found. Can not discover characteristics")
            onDiscoverStarted([
                "error": "No device found"
                ])
            return
        }

        let getService: Void -> CBService? = {
            return  device.services?.filter {
                $0.UUID.UUIDString == (service["id"] as? String) ?? "_"
            } .first
        }

        guard let requiredService = getService() else {
            print("No service found. Can not discover characteristics", service, device)
            onDiscoverStarted([
                "error": "No service found"
                ])
            return
        }

        dispatch_async(backgroundQueue, {
            let characteristicIds = characteristics?.map { CBUUID(string: $0) }
            device.discoverCharacteristics(characteristicIds, forService: requiredService)
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

    public func onCharacteristicDiscovered(handler: BluetoothServiceReturn -> Void) {
        peripheralEventHandler.onCharacteristicDiscovered { characteristicInfo in

            let lastCharacteristic = characteristicInfo.1.characteristics?.last

            guard let characteristic = lastCharacteristic else {
                print ("Characteristic discovered but unable to look up detail.")
                return
            }

            handler(OutputBuilder.asCharacteristic(characteristic))
        }
    }

    public func onCharacteristicRead(handler: BluetoothServiceReturn -> Void) {
        peripheralEventHandler.onCharacteristicValueUpdated { newValue in
            //TODO: do we need the error here?
            handler(OutputBuilder.asCharacteristicValue(newValue.1))
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
            handler(OutputBuilder.asCharacteristic(characteristicInfo.1))
        }
    }

    public func onDeviceConnected(handler: BluetoothServiceReturn -> Void) {
        onDeviceConnectedHandler = handler

        centralEventHandler.onDeviceConnected { device in
            device.delegate = self.peripheralEventHandler
            handler(OutputBuilder.asDevice(device))
        }
    }

    public func onDeviceDisconnected(handler: BluetoothServiceReturn -> Void) {
        onDeviceDisconnectedHandler = handler

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

    public func cleanConnections() {
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
        self.discoveredPeripherals.removeAll()
    }
}
