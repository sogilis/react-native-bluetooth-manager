//
//  PeripheralStore.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

class PeripheralStore {
    private var peripherals = [NSUUID: CBPeripheral]()
    private let backgroundQueue = dispatch_queue_create("PeripheralStore", DISPATCH_QUEUE_SERIAL)

    subscript(peripheralId: NSUUID) -> CBPeripheral? {
        get {
            return peripherals[peripheralId]
        }
        set(newItem) {
            guard let newItem = newItem else {
                return
            }
            addPeripheral(newItem)
        }
    }

    var items: [CBPeripheral] {
        get {
            return peripherals.map { $0.1 }
        }
    }

    func removeAll() {
        dispatch_sync(backgroundQueue, { [unowned self] in
            self.peripherals.removeAll()
        })
    }

    func addPeripheral(newItem: CBPeripheral) {
        dispatch_sync(backgroundQueue, { [unowned self] in
            self.peripherals[newItem.identifier] = newItem
        })
    }

    func listIds() -> [NSUUID] {
        return peripherals.map { $0.0 }
    }

    func getPeripheral(lookup: [String: AnyObject]) -> CBPeripheral? {
        guard let deviceIdString = lookup.eitherOr("deviceId", key2: "id") as? String else {
            print("No device id found.")
            return nil
        }

        guard let deviceId = NSUUID(UUIDString: deviceIdString) else {
            print("Invalid device id found.")
            return nil
        }

        guard let device = self.peripherals[deviceId] else {
            print("No peripheral found", deviceId, peripherals)
            return nil
        }

        return device
    }

    func getService(device: CBPeripheral, lookup: [String: AnyObject]) -> CBService? {
        guard let serviceIdString = lookup.eitherOr("serviceId", key2: "id") as? String else {
            print("No service id found.")
            return nil
        }

        let serviceId = CBUUID(string: serviceIdString).UUIDString

        return device.services?.filter { $0.UUID.UUIDString == serviceId }.first
    }

    func getService(lookup: [String: AnyObject]) -> CBService? {
        guard let device = getPeripheral(lookup) else {
            print("Peripheral not found when looking up service")
            return nil
        }

        return getService(device, lookup: lookup)
    }

    func getCharacteristic(lookup: [String: AnyObject]) -> CBCharacteristic? {
        guard let service = getService(lookup) else {
            print("Service not found when looking up characteristic", lookup)
            return nil
        }

        guard let charIdString = lookup["id"] as? String else {
            print("No characteristic id found.", lookup)
            return nil
        }

        let charId = CBUUID(string: charIdString).UUIDString

        let characteristic = service.characteristics?.filter { $0.UUID.UUIDString == charId }.first

        if characteristic == nil {
            print("Unable to locate characteristic in service", charId,
                  service.characteristics?.map { $0.UUID.UUIDString })
        }

        return characteristic
    }
}
