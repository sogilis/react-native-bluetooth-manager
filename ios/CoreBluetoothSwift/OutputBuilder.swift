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
            "id": service.UUID.UUIDString,
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

    private static func makeCharacteristicProperties(characteristic: CBCharacteristic) -> [String: AnyObject] {
        let canRead = characteristic.properties.contains(CBCharacteristicProperties.Read)
        let canWrite = characteristic.properties.contains(CBCharacteristicProperties.Write)
        let canWriteNoResponse = characteristic.properties.contains(CBCharacteristicProperties.WriteWithoutResponse)
        let canNotify = characteristic.properties.contains(CBCharacteristicProperties.Notify)
        let canBroadcast = characteristic.properties.contains(CBCharacteristicProperties.Broadcast)

        return [
            "read": canRead,
            "write": canWrite,
            "writeNoResponse": canWriteNoResponse,
            "notify": canNotify,
            "broadcast": canBroadcast,
        ]
    }

    static func asCharacteristic(characteristic: CBCharacteristic) -> BluetoothServiceReturn {
        return [
            "id": characteristic.UUID.UUIDString,
            "deviceId": characteristic.service.peripheral.identifier.UUIDString,
            "serviceId": characteristic.service.UUID.UUIDString,
            "properties": makeCharacteristicProperties(characteristic),
            "value": characteristic.value?.base64EncodedStringWithOptions(NSDataBase64EncodingOptions()) ?? "",
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
