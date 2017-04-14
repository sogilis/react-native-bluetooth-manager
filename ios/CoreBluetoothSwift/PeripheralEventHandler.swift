//
//  PeripheralEventHandler.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

class PeripheralEventHandler: NSObject, CBPeripheralDelegate {
    fileprivate var onServiceDiscovered: ServiceDiscoveryCallback?
    fileprivate var onCharacteristicDiscovered: ServiceCallback?
    fileprivate var onCharacteristicValueUpdated: CharacteristicCallback?
    fileprivate var onCharacteristicValueWritten: CharacteristicCallback?

    override init() {
        super.init()
    }

    func onServiceDiscovered(_ handler: ServiceDiscoveryCallback) {
        self.onServiceDiscovered = handler
    }

    func onCharacteristicDiscovered(_ handler: ServiceCallback) {
        self.onCharacteristicDiscovered = handler
    }

    func onCharacteristicValueUpdated(_ handler: CharacteristicCallback) {
        self.onCharacteristicValueUpdated = handler
    }

    func onCharacteristicValueWritten(_ handler: CharacteristicCallback) {
        self.onCharacteristicValueWritten = handler
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard let handler = self.onServiceDiscovered else {
            print("Peripheral discovered but no handler set", peripheral.name)
            return
        }

        handler(peripheral, error: error)
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService,
                    error: Error?) {
        guard let handler = self.onCharacteristicDiscovered else {
            return
        }

        handler(peripheral, service, error)
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic,
                  error: Error?) {

        guard let handler = self.onCharacteristicValueUpdated else {
            return
        }

        handler(peripheral, characteristic, error)
    }

    func peripheral(_ peripheral: CBPeripheral,
                  didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
        guard let handler = self.onCharacteristicValueWritten else {
            print("Characteristic written but no handler set", peripheral.name)
            return
        }

        handler(peripheral, characteristic, error)
    }
}
