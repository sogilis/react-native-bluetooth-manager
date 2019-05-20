//
//  BluetoothActions.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

open class BluetoothActions: NSObject {
    fileprivate let centralManager = CBCentralManager()
    fileprivate let centralEventHandler = CentralEventHandler()
    fileprivate let peripheralEventHandler = PeripheralEventHandler()
    
    fileprivate let backgroundQueue = DispatchQueue(label: "rnBluetooth", attributes: [])
    
    fileprivate var onDeviceConnectedHandler: (BluetoothServiceReturn) -> Void = { _ in }
    fileprivate var onDeviceDisconnectedHandler: (BluetoothServiceReturn) -> Void = { _ in }
    fileprivate var onCharacteristicReadHandler: ((BluetoothServiceReturn) -> Void) = { _ in }
    fileprivate var onCharacteristicWriteHandler: ((BluetoothServiceReturn) -> Void) = { _ in }
    fileprivate var onCharacteristicNotifyHandler: ((BluetoothServiceReturn) -> Void) = { _ in }
    fileprivate var onServiceDiscoveredHandler: ((BluetoothServiceReturn) -> Void) = { _ in }
    fileprivate var onCharacteristicDiscoveredHandler: ((BluetoothServiceReturn) -> Void) = { _ in }
    
    fileprivate var lastState = BluetoothState.unknown
    
    
    fileprivate let peripheralStore = PeripheralStore()
    
    @objc open var bluetoothState: String {
        get {
            return OutputBuilder.asStateChange(state: lastState)
        }
    }
    
    public override init() {
        centralManager.delegate = centralEventHandler
    }
    
    deinit {
        cleanConnections()
    }
    
    @objc open func startScan(_ serviceUUIDs: [String], onScanStarted: @escaping (BluetoothServiceReturn) -> Void) {
        let mappedIds = serviceUUIDs.map { CBUUID(string: $0) }
        
        backgroundQueue.async(execute: { [unowned self] in
            self.centralManager.scanForPeripherals(withServices: mappedIds, options: nil)
            onScanStarted([String:AnyObject]())
            print("Bluetooth scan started")
        })
    }
    
    @objc open func stopScan(_ onStopScanComplete: @escaping (BluetoothServiceReturn) -> Void) {
        backgroundQueue.async(execute: { [unowned self] in
            self.centralManager.stopScan()
            
            onStopScanComplete([String:AnyObject]())
            print("Bluetooth scan stopped")
        })
    }
    
    @objc open func connect(_ deviceLookup: [String: AnyObject]) {
        guard let device = peripheralStore.getPeripheral(deviceLookup) else {
            print("No device found. Can not connect")
            onDeviceConnectedHandler([
                "error": "No device found" as AnyObject]
            )
            return
        }
        
        if device.state == .connected {
            onDeviceConnectedHandler(deviceLookup)
            return
        }
        
        backgroundQueue.async(execute: { [unowned self] in
            self.centralManager.connect(device, options: nil)
        })
    }
    
    @objc open func disconnect(_ deviceLookup: [String: AnyObject]) {
        guard let device = peripheralStore.getPeripheral(deviceLookup) else {
            print("No device found. Can not discover services")
            onDeviceDisconnectedHandler([
                "error": "No device found" as AnyObject]
            )
            return
        }
        
        if device.state == .disconnected {
            onDeviceDisconnectedHandler(deviceLookup)
            return
        }
        
        backgroundQueue.async(execute: { [unowned self] in
            self.centralManager.cancelPeripheralConnection(device)
        })
    }
    
    @objc open func discoverServices(_ deviceLookup: [String: AnyObject],
                                     services: [String]?,
                                     onDiscoverStarted: @escaping (BluetoothServiceReturn) -> Void) {
        
        guard let device = peripheralStore.getPeripheral(deviceLookup) else {
            print("No device found. Can not discover services")
            onDiscoverStarted([
                "error": "No device found" as AnyObject
                ])
            return
        }
        
        backgroundQueue.async(execute: { [unowned self] in
            if let services = services {
                if let deviceServices = device.services {
                    let hasId: (String) -> Bool = services.contains
                    let filter: (CBService) -> Bool = { hasId($0.uuid.uuidString) }
                    
                    let servicesList = deviceServices.filter(filter)
                    
                    let alreadyFound = servicesList.count == services.count
                    
                    if alreadyFound {
                        self.onServiceDiscoveredHandler(OutputBuilder.asServiceList(services: servicesList))
                        return
                    }
                }
            }
            
            let serviceIds = services?.map { CBUUID(string: $0) }
            print("Discovering service ids for", device, serviceIds ?? [CBUUID]())
            
            device.discoverServices(serviceIds)
            onDiscoverStarted(BluetoothServiceReturn())
        })
    }
    
    @objc open func discoverCharacteristics(_ lookup: [String: AnyObject],
                                            characteristics: [String]?,
                                            onDiscoverStarted: @escaping (BluetoothServiceReturn) -> Void) {
        
        guard let requiredService = peripheralStore.getService(lookup) else {
            print("No service found. Can not discover characteristics", lookup)
            onDiscoverStarted([
                "id": lookup.eitherOr("serviceId", key2: "id") ?? "unknown" as AnyObject,
                "error": "No service found" as AnyObject
                ])
            return
        }
        
        backgroundQueue.async(execute: {
            let characteristicIds = characteristics?.map { CBUUID(string: $0) }
            requiredService.peripheral.discoverCharacteristics(characteristicIds,
                                                               for: requiredService)
            onDiscoverStarted(BluetoothServiceReturn())
        })
    }
    
    @objc open func writeCharacteristicValue(_ lookup: [String: AnyObject], data: String, withResponse: Bool) {
        
        guard let characteristic = peripheralStore.getCharacteristic(lookup) else {
            onCharacteristicWriteHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "" as AnyObject,
                "error": "Unable to find characteristic to write to" as AnyObject
                ])
            return
        }
        
        guard let dataToSend = Data(base64Encoded: data, options: NSData.Base64DecodingOptions()) else {
            onCharacteristicWriteHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "" as AnyObject,
                "error": "Attempt to send invalid base64 string" as AnyObject
                ])
            return
        }
        
        let device = characteristic.service.peripheral
        
        let writeType = withResponse ? CBCharacteristicWriteType.withResponse :
            CBCharacteristicWriteType.withoutResponse
        
        self.backgroundQueue.async(execute: {
            device.writeValue(dataToSend, for: characteristic, type: writeType)
        })
    }
    
    @objc open func readCharacteristicValue(_ lookup: [String: AnyObject]) {
        guard let characteristic = peripheralStore.getCharacteristic(lookup) else {
            onCharacteristicReadHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "" as AnyObject,
                "error": "Unable to find characteristic to read from" as AnyObject
                ])
            return
        }
        
        guard characteristic.properties.contains(CBCharacteristicProperties.read) else {
            onCharacteristicReadHandler([
                "id": lookup.eitherOr("characteristicId", key2: "id") ?? "" as AnyObject,
                "error": "Trying to read from a characteristic that does not support reading." as AnyObject
                ])
            return
        }
        
        self.backgroundQueue.async(execute: {
            let device = characteristic.service.peripheral
            device.readValue(for: characteristic)
        })
    }
    
    fileprivate func changeCharacteristicNotification(_ lookup: [String: AnyObject], newState: Bool) {
        backgroundQueue.async(execute: { [unowned self] in
            guard let characteristic = self.peripheralStore.getCharacteristic(lookup) else {
                self.onCharacteristicNotifyHandler([
                    "id": lookup.eitherOr("characteristicId", key2: "id") ?? "" as AnyObject,
                    "error": "Unable to find characteristic when trying to notify." as AnyObject
                    ])
                print("Unable to find characteristic when changing notification")
                return
            }
            
            characteristic.service.peripheral.setNotifyValue(newState, for: characteristic)
        })
    }
    
    @objc open func subscribeToNotification(_ lookup: [String: AnyObject]) {
        changeCharacteristicNotification(lookup, newState: true)
    }
    
    @objc open func unsubscribeFromNotification(_ lookup: [String: AnyObject]) {
        changeCharacteristicNotification(lookup, newState: false)
    }
    
    @objc open func onChangeState(_ handler: @escaping (String) -> Void) {
        centralEventHandler.onStateChange { [unowned self] state in
            self.lastState = state
            
            handler(OutputBuilder.asStateChange(state: state))
        }
    }
    
    @objc open func onServiceDiscovered(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onServiceDiscoveredHandler = handler
        
        peripheralEventHandler.onServiceDiscovered { serviceInfo, _  in
            
            guard let services = serviceInfo.services else {
                print ("Service discovered but unable to look up detail.")
                return
            }
            
            handler(OutputBuilder.asServiceList(services: services))
        }
    }
    
    @objc open func onCharacteristicDiscovered(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onCharacteristicDiscoveredHandler = handler
        
        peripheralEventHandler.onCharacteristicDiscovered { _, serviceInfo, _  in
            
            guard let characteristics = serviceInfo.characteristics else {
                print ("Characteristic discovered but unable to look up detail.")
                return
            }
            
            handler(OutputBuilder.asCharacteristicList(characteristics: characteristics))
        }
    }
    
    fileprivate func handleCharacteristicUpdate(_ params: CharacteristicCallbackParams) {
        if params.1.isNotifying {
            onCharacteristicNotifyHandler(OutputBuilder.asCharacteristic(characteristic: params.1))
        }
        
        onCharacteristicReadHandler(OutputBuilder.asCharacteristic(characteristic: params.1))
    }
    
    @objc open func onCharacteristicRead(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onCharacteristicReadHandler = handler
        peripheralEventHandler.onCharacteristicValueUpdated(handleCharacteristicUpdate)
    }
    
    @objc open func onCharacteristicWritten(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onCharacteristicWriteHandler = handler
        
        peripheralEventHandler.onCharacteristicValueWritten { characteristicInfo in
            handler(OutputBuilder.asCharacteristicWriteResult(info: characteristicInfo))
        }
    }
    
    @objc open func onCharacteristicNotified(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onCharacteristicNotifyHandler = handler
        peripheralEventHandler.onCharacteristicValueUpdated(handleCharacteristicUpdate)
    }
    
    @objc open func onDeviceConnected(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onDeviceConnectedHandler = handler
        
        centralEventHandler.onDeviceConnected { device in
            device.delegate = self.peripheralEventHandler
            handler(OutputBuilder.asDevice(device: device))
        }
    }
    
    @objc open func onDeviceDisconnected(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        onDeviceDisconnectedHandler = handler
        
        centralEventHandler.onDeviceDisconnected { device in
            handler(OutputBuilder.asDevice(device: device))
        }
    }
    
    @objc open func onDeviceDiscovered(_ handler: @escaping (BluetoothServiceReturn) -> Void) {
        centralEventHandler.onDeviceDiscovered { [unowned self] device in
            self.peripheralStore.addPeripheral(device)
            handler(OutputBuilder.asDevice(device: device))
        }
    }
    
    @objc open func cleanUp() {
        onDeviceConnectedHandler = { _ in }
        onDeviceDisconnectedHandler = { _ in }
        onCharacteristicReadHandler = { _ in }
        onCharacteristicWriteHandler = { _ in }
        onCharacteristicNotifyHandler = { _ in }
        
        cleanConnections()
    }
    
    @objc open func cleanConnections() {
        peripheralStore.items
            .forEach { [unowned self] peripheral in
                
                guard peripheral.state == .connected else {
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
                            peripheral.setNotifyValue(false, for: $0)
                        }
                }
        }
        
        peripheralStore.removeAll()
    }
}
