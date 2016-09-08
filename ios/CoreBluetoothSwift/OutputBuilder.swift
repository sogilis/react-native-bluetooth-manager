//
//  OutputBuilder.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

private func getServiceName(serviceId: CBUUID) -> String {
    return "Custom Service"
}

class OutputBuilder {
    static func asService(service: CBService) -> BluetoothServiceReturn {
        return [
            "id": getServiceName(service.UUID),
            "deviceId": service.peripheral.identifier.UUIDString ?? "Unknown",
            "name": "Unknown"
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
            "id" : device.identifier.UUIDString,
            "address" : device.identifier.UUIDString,
        ]
    }
}
