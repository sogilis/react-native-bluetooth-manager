//
//  PeripheralStore.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

class PeripheralStore {
    fileprivate var peripherals = [UUID: CBPeripheral]()
    fileprivate let backgroundQueue = DispatchQueue(label: "PeripheralStore", attributes: [])

    subscript(peripheralId: UUID) -> CBPeripheral? {
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
        backgroundQueue.sync(execute: { [unowned self] in
            self.peripherals.removeAll()
        })
    }

    func addPeripheral(_ newItem: CBPeripheral) {
        backgroundQueue.sync(execute: { [unowned self] in
            self.peripherals[newItem.identifier] = newItem
        })
    }

    func listIds() -> [UUID] {
        return peripherals.map { $0.0 }
    }

    func getPeripheral(_ lookup: [String: AnyObject]) -> CBPeripheral? {
        guard let deviceIdString = lookup.eitherOr("deviceId", key2: "id") as? String else {
            print("No device id found.")
            return nil
        }

        guard let deviceId = UUID(uuidString: deviceIdString) else {
            print("Invalid device id found.")
            return nil
        }

        guard let device = self.peripherals[deviceId] else {
            print("No peripheral found", deviceId, peripherals)
            return nil
        }

        return device
    }

    func getService(_ device: CBPeripheral, lookup: [String: AnyObject]) -> CBService? {
        guard let serviceIdString = lookup.eitherOr("serviceId", key2: "id") as? String else {
            print("No service id found.")
            return nil
        }

        let serviceId = CBUUID(string: serviceIdString).uuidString

        return device.services?.filter { $0.uuid.uuidString == serviceId }.first
    }

    func getService(_ lookup: [String: AnyObject]) -> CBService? {
        guard let device = getPeripheral(lookup) else {
            print("Peripheral not found when looking up service")
            return nil
        }

        return getService(device, lookup: lookup)
    }

    func getCharacteristic(_ lookup: [String: AnyObject]) -> CBCharacteristic? {
        guard let service = getService(lookup) else {
            print("Service not found when looking up characteristic", lookup)
            return nil
        }

        guard let charIdString = lookup["id"] as? String else {
            print("No characteristic id found.", lookup)
            return nil
        }

        let charId = CBUUID(string: charIdString).uuidString

        let characteristic = service.characteristics?.filter { $0.uuid.uuidString == charId }.first

        if characteristic == nil {
            print("Unable to locate characteristic in service", charId,
                  service.characteristics?.map { $0.uuid.uuidString })
        }

        return characteristic
    }
}
