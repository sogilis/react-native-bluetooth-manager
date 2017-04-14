//
//  OutputBuilder.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

private func getServiceName(_ serviceId: CBUUID) -> String {
    return "Custom Service"
}

class OutputBuilder {
    static func asService(_ service: CBService) -> BluetoothServiceReturn {
        return [
            "id": service.uuid.uuidString,
            "deviceId": service.peripheral.identifier.uuidString ?? "Unknown",
            "name": "Unknown"
        ]
    }

    static func asServiceList(_ services: [CBService]) -> BluetoothServiceReturn {
        return [
            "deviceId": services.first?.peripheral.identifier.uuidString ?? "",
            "services": services.map(asService)
        ]
    }

    static func asStateChange(_ state: BluetoothState) -> String {
        switch state {
        case .unknown:
            return "unknown"
        case .resetting:
            return "resetting"
        case .unsupported:
            return "notsupported"
        case .unauthorized:
            return "unauthorized"
        case .poweredOff:
            return "disabled"
        case .poweredOn:
            return "enabled"
        }
    }

    fileprivate static func makeCharacteristicProperties(_ characteristic: CBCharacteristic) -> [String: AnyObject] {
        let canRead = characteristic.properties.contains(CBCharacteristicProperties.read)
        let canWrite = characteristic.properties.contains(CBCharacteristicProperties.write)
        let canWriteNoResponse = characteristic.properties.contains(CBCharacteristicProperties.writeWithoutResponse)
        let canNotify = characteristic.properties.contains(CBCharacteristicProperties.notify)
        let canBroadcast = characteristic.properties.contains(CBCharacteristicProperties.broadcast)

        return [
            "read": canRead,
            "write": canWrite,
            "writeNoResponse": canWriteNoResponse,
            "notify": canNotify,
            "broadcast": canBroadcast,
        ]
    }

    static func asCharacteristic(_ characteristic: CBCharacteristic) -> BluetoothServiceReturn {
        return [
            "id": characteristic.uuid.uuidString,
            "deviceId": characteristic.service.peripheral.identifier.uuidString,
            "serviceId": characteristic.service.uuid.uuidString,
            "properties": makeCharacteristicProperties(characteristic),
            "value": characteristic.value?.base64EncodedString(options: NSData.Base64EncodingOptions()) ?? "",
        ]
    }

    static func asCharacteristicList(_ characteristics: [CBCharacteristic]) -> BluetoothServiceReturn {
        return [
            "deviceId": characteristics.first?.service.peripheral.identifier.uuidString ?? "",
            "serviceId": characteristics.first?.service.uuid.uuidString ?? "",
            "characteristics": characteristics.map(asCharacteristic)
        ]
    }

    static func asCharacteristicWriteResult(_ info: CharacteristicInfo) -> BluetoothServiceReturn {
        if let error = info.error {
            return [
                "id": info.characteristic.uuid.uuidString,
                "deviceId": info.characteristic.service.peripheral.identifier.uuidString,
                "serviceId": info.characteristic.service.uuid.uuidString,
                "error": error.localizedDescription,
            ]
        }

        return [
            "id": info.characteristic.uuid.uuidString,
            "deviceId": info.characteristic.service.peripheral.identifier.uuidString,
            "serviceId": info.characteristic.service.uuid.uuidString,
            "success": true,
        ]
    }

    static func asDevice(_ device: CBPeripheral) -> BluetoothServiceReturn {
        return [
            "name" : device.name ?? "Unknown",
            "id" : device.identifier.uuidString,
            "address" : device.identifier.uuidString,
        ]
    }
}
