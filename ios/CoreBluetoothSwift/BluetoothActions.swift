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
    private var onCharacteristicReadHandler: (BluetoothServiceReturn -> Void) = { _ in }
    private var onCharacteristicWriteHandler: (BluetoothServiceReturn -> Void) = { _ in }
    private var onCharacteristicNotifyHandler: (BluetoothServiceReturn -> Void) = { _ in }

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
        guard let deviceIdString = lookup.eitherOr("deviceId", key2: "id") as? String else {
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

    private func getService(device: CBPeripheral, lookup: [String: AnyObject]) -> CBService? {
        guard let serviceIdString = lookup.eitherOr("serviceId", key2: "id") as? String else {
            print("No service id found.")
            return nil
        }

        guard let serviceId = NSUUID(UUIDString: serviceIdString) else {
            print("Invalid service id found.")
            return nil
        }

        return device.services?.filter { $0.UUID.UUIDString == serviceId.UUIDString }.first
    }

    private func getService(lookup: [String: AnyObject]) -> CBService? {
        guard let device = getDevice(lookup) else {
            print("Device not found when looking up service")
            return nil
        }

        return getService(device, lookup: lookup)
    }

    private func getCharacteristic(lookup: [String: AnyObject]) -> CBCharacteristic? {
        guard let service = getService(lookup) else {
            print("Service not found when looking up characteristic", lookup)
            return nil
        }

        guard let charIdString = lookup["id"] as? String else {
            print("No characteristic id found.", lookup)
            return nil
        }

        guard let charId = NSUUID(UUIDString: charIdString) else {
            print("Invalid characteristic id found.", lookup)
            return nil
        }

        return service.characteristics?.filter { $0.UUID.UUIDString == charId.UUIDString }.first
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

        guard let device = getDevice(service) else {
            print("No device found. Can not discover characteristics")

            onDiscoverStarted([
                "id": service.eitherOr("serviceId", key2: "id") ?? "",
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
                "id": service.eitherOr("serviceId", key2: "id") ?? "",
                "error": "No service found"
                ])
            return
        }

        dispatch_async(backgroundQueue, {
            let characteristicIds = characteristics?.map { CBUUID(string: $0) }
            device.discoverCharacteristics(characteristicIds, forService: requiredService)
        })
    }

    public func writeCharacteristicValue(lookup: [String: AnyObject], data: String, withResponse: Bool) {

        guard let characteristic = getCharacteristic(lookup) else {
            onCharacteristicWriteHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "",
                "error": "Unable to find characteristic to write to"
                ])
            return
        }

        guard let dataToSend = NSData(base64EncodedString: data, options: NSDataBase64DecodingOptions()) else {
            onCharacteristicWriteHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "",
                "error": "Attempt to send invalid base64 string"
                ])
            return
        }

        let device = characteristic.service.peripheral
        let writeType = withResponse ? CBCharacteristicWriteType.WithResponse :
            CBCharacteristicWriteType.WithoutResponse

        dispatch_async(self.backgroundQueue, {
            device.writeValue(dataToSend, forCharacteristic: characteristic, type: writeType)
        })
    }

    public func readCharacteristicValue(lookup: [String: AnyObject]) {
        guard let characteristic = getCharacteristic(lookup) else {
            onCharacteristicReadHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "",
                "error": "Unable to find characteristic to write to"
                ])
            return
        }

        guard characteristic.properties.contains(CBCharacteristicProperties.Read) else {
            onCharacteristicReadHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "",
                "error": "Trying to read from a characteristic that does not support reading."
                ])
            return
        }

        dispatch_async(self.backgroundQueue, {
            let device = characteristic.service.peripheral
            device.readValueForCharacteristic(characteristic)
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

            guard let services = serviceInfo.0.services else {
                print ("Service discovered but unable to look up detail.")
                return
            }

            services.forEach { service in
                handler(OutputBuilder.asService(service))
            }
        }
    }

    public func onCharacteristicDiscovered(handler: BluetoothServiceReturn -> Void) {
        peripheralEventHandler.onCharacteristicDiscovered { characteristicInfo in

            guard let characteristics = characteristicInfo.1.characteristics else {
                print ("Characteristic discovered but unable to look up detail.")
                return
            }

            characteristics.forEach { characteristic in
                handler(OutputBuilder.asCharacteristic(characteristic))
            }
        }
    }

    public func onCharacteristicRead(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicReadHandler = handler

        peripheralEventHandler.onCharacteristicValueUpdated { newValue in
            handler(OutputBuilder.asCharacteristic(newValue.1))
        }
    }

    public func onCharacteristicWritten(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicWriteHandler = handler

        peripheralEventHandler.onCharacteristicValueWritten { characteristicInfo in
            handler(OutputBuilder.asCharacteristicWriteResult(characteristicInfo))
        }
    }

    public func onCharacteristicNotified(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicNotifyHandler = handler

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

            dispatch_async(self.backgroundQueue, { [unowned self] in
                if self.discoveredPeripherals[device.identifier] == nil {
                    self.discoveredPeripherals[device.identifier] = device
                }

                handler(OutputBuilder.asDevice(device))
            })
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
