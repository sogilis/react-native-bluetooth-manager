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
    private var onServiceDiscoveredHandler: (BluetoothServiceReturn -> Void) = { _ in }
    private var onCharacteristicDiscoveredHandler: (BluetoothServiceReturn -> Void) = { _ in }

    private var lastState = BluetoothState.Unknown


    private let peripheralStore = PeripheralStore()

    public var bluetoothState: String {
        get {
            return OutputBuilder.asStateChange(lastState)
        }
    }

    override init() {
        centralManager.delegate = centralEventHandler
    }

    deinit {
        cleanConnections()
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

            onStopScanComplete([String:AnyObject]())
            print("Bluetooth scan stopped")
        })
    }

    public func connect(deviceLookup: [String: AnyObject]) {
        guard let device = peripheralStore.getPeripheral(deviceLookup) else {
            print("No device found. Can not connect")
            onDeviceConnectedHandler([
                "error": "No device found"]
            )
            return
        }

        if device.state == .Connected {
            onDeviceConnectedHandler(deviceLookup)
            return
        }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.connectPeripheral(device, options: nil)
        })
    }

    public func disconnect(deviceLookup: [String: AnyObject]) {
        guard let device = peripheralStore.getPeripheral(deviceLookup) else {
            print("No device found. Can not discover services")
            onDeviceDisconnectedHandler([
                "error": "No device found"]
            )
            return
        }

        if device.state == .Disconnected {
            onDeviceDisconnectedHandler(deviceLookup)
            return
        }

        dispatch_async(backgroundQueue, { [unowned self] in
            self.centralManager.cancelPeripheralConnection(device)
        })
    }

    public func discoverServices(deviceLookup: [String: AnyObject],
                                 services: [String]?,
                                 onDiscoverStarted: (BluetoothServiceReturn) -> Void) {

        guard let device = peripheralStore.getPeripheral(deviceLookup) else {
            print("No device found. Can not discover services")
            onDiscoverStarted([
                "error": "No device found"
                ])
            return
        }

        dispatch_async(backgroundQueue, { [unowned self] in
            if let services = services {
                if let deviceServices = device.services {
                    let hasId: String -> Bool = services.contains
                    let filter: CBService -> Bool = { hasId($0.UUID.UUIDString) }

                    let servicesList = deviceServices.filter(filter)

                    let alreadyFound = servicesList.count == services.count

                    if alreadyFound {
                        self.onServiceDiscoveredHandler(OutputBuilder.asServiceList(servicesList))
                        return
                    }
                }
            }

            let serviceIds = services?.map { CBUUID(string: $0) }
            print("Discovering service ids for", device, serviceIds)

            device.discoverServices(serviceIds)
            onDiscoverStarted(BluetoothServiceReturn())
        })
    }

    public func discoverCharacteristics(lookup: [String: AnyObject],
                                        characteristics: [String]?,
                                        onDiscoverStarted: (BluetoothServiceReturn) -> Void) {

        guard let requiredService = peripheralStore.getService(lookup) else {
            print("No service found. Can not discover characteristics", lookup)
            onDiscoverStarted([
                "id": lookup.eitherOr("serviceId", key2: "id") ?? "unknown",
                "error": "No service found"
                ])
            return
        }

        dispatch_async(backgroundQueue, { 
            let characteristicIds = characteristics?.map { CBUUID(string: $0) }
            requiredService.peripheral.discoverCharacteristics(characteristicIds,
                forService: requiredService)
            onDiscoverStarted(BluetoothServiceReturn())
        })
    }

    public func writeCharacteristicValue(lookup: [String: AnyObject], data: String, withResponse: Bool) {

        guard let characteristic = peripheralStore.getCharacteristic(lookup) else {
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
        guard let characteristic = peripheralStore.getCharacteristic(lookup) else {
            onCharacteristicReadHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "",
                "error": "Unable to find characteristic to read from"
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

    private func changeCharacteristicNotification(lookup: [String: AnyObject], newState: Bool) {
        dispatch_async(backgroundQueue, { [unowned self] in
            guard let characteristic = self.peripheralStore.getCharacteristic(lookup) else {
                self.onCharacteristicNotifyHandler([
                    "id": lookup.eitherOr("characteristicId", key2: "id") ?? "",
                    "error": "Unable to find characteristic when trying to notify."
                    ])
                print("Unable to find characteristic when changing notification")
                return
            }

            characteristic.service.peripheral.setNotifyValue(newState, forCharacteristic: characteristic)
        })
    }

    public func subscribeToNotification(lookup: [String: AnyObject]) {
        changeCharacteristicNotification(lookup, newState: true)
    }

    public func unsubscribeFromNotification(lookup: [String: AnyObject]) {
        changeCharacteristicNotification(lookup, newState: false)
    }

    public func onChangeState(handler: String -> Void) {
        centralEventHandler.onStateChange { [unowned self] state in
            self.lastState = state

            handler(OutputBuilder.asStateChange(state))
        }
    }

    public func onServiceDiscovered(handler: BluetoothServiceReturn -> Void) {
        onServiceDiscoveredHandler = handler

        peripheralEventHandler.onServiceDiscovered { serviceInfo in

            guard let services = serviceInfo.0.services else {
                print ("Service discovered but unable to look up detail.")
                return
            }

            handler(OutputBuilder.asServiceList(services))
        }
    }

    public func onCharacteristicDiscovered(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicDiscoveredHandler = handler

        peripheralEventHandler.onCharacteristicDiscovered { characteristicInfo in

            guard let characteristics = characteristicInfo.1.characteristics else {
                print ("Characteristic discovered but unable to look up detail.")
                return
            }

            handler(OutputBuilder.asCharacteristicList(characteristics))
        }
    }

    private func handleCharacteristicUpdate(params: CharacteristicCallbackParams) {
        if params.1.isNotifying {
            onCharacteristicNotifyHandler(OutputBuilder.asCharacteristic(params.1))
        }

        onCharacteristicReadHandler(OutputBuilder.asCharacteristic(params.1))
    }

    public func onCharacteristicRead(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicReadHandler = handler
        peripheralEventHandler.onCharacteristicValueUpdated(handleCharacteristicUpdate)
    }

    public func onCharacteristicWritten(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicWriteHandler = handler

        peripheralEventHandler.onCharacteristicValueWritten { characteristicInfo in
            handler(OutputBuilder.asCharacteristicWriteResult(characteristicInfo))
        }
    }

    public func onCharacteristicNotified(handler: BluetoothServiceReturn -> Void) {
        onCharacteristicNotifyHandler = handler
        peripheralEventHandler.onCharacteristicValueUpdated(handleCharacteristicUpdate)
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
            self.peripheralStore.addPeripheral(device)
            handler(OutputBuilder.asDevice(device))
        }
    }

    public func cleanUp() {
        onDeviceConnectedHandler = { _ in }
        onDeviceDisconnectedHandler = { _ in }
        onCharacteristicReadHandler = { _ in }
        onCharacteristicWriteHandler = { _ in }
        onCharacteristicNotifyHandler = { _ in }

        cleanConnections()
    }

    public func cleanConnections() {
        peripheralStore.items
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

        peripheralStore.removeAll()
    }
}
