//
//  OutputBuilder.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

class OutputBuilder {
    static func asService(info: PeripheralInfo) -> BluetoothServiceReturn {
        return [
            "name" : info.peripheral.name ?? "Unknown"
        ]
    }

    static func asStateChange(state: CBCentralManagerState) -> String {
        switch state {
        case .Unknown:
            return "unknown"
        case .Resetting:
            return "resetting"
        case .Unsupported:
            return "notsupported"
        case .Unauthorized:
            return "unauthorized"
        case .PoweredOff:
            return "disabled"
        case .PoweredOn:
            return "enabled"
        }
    }

    static func asCharacteristic(info: CharacteristicInfo) -> BluetoothServiceReturn {
        return [
            "name" : info.peripheral.name ?? "Unknown"
        ]
    }

    static func asCharacteristicValue(info: CharacteristicInfo) -> BluetoothServiceReturn {
        return [
            "name" : info.peripheral.name ?? "Unknown"
        ]
    }

    static func asCharacteristicWriteResult(info: CharacteristicInfo) -> BluetoothServiceReturn {
        return [
            "success" : info.error == nil,
            "error" : info.error?.localizedDescription ?? "Unknown",
        ]
    }

    static func asDevice(device: CBPeripheral) -> BluetoothServiceReturn {
        return [
            "name" : device.name ?? "Unknown",
            "identifieer" : device.identifier,
            "address" : "00:00:00:00:00:00",
        ]
    }
}
