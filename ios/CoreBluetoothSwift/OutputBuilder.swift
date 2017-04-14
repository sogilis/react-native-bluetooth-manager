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
            "id": service.uuid.uuidString as AnyObject,
            "deviceId": service.peripheral.identifier.uuidString as AnyObject,
            "name": "Unknown" as AnyObject
        ]
    }

    static func asServiceList(services: [CBService]) -> BluetoothServiceReturn {
        return [
            "deviceId": services.first?.peripheral.identifier.uuidString as AnyObject,
            "services": services.map(asService) as AnyObject
        ]
    }

    static func asStateChange(state: BluetoothState) -> String {
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

    private static func makeCharacteristicProperties(characteristic: CBCharacteristic) -> [String: AnyObject] {
        let canRead = characteristic.properties.contains(CBCharacteristicProperties.read)
        let canWrite = characteristic.properties.contains(CBCharacteristicProperties.write)
        let canWriteNoResponse = characteristic.properties.contains(CBCharacteristicProperties.writeWithoutResponse)
        let canNotify = characteristic.properties.contains(CBCharacteristicProperties.notify)
        let canBroadcast = characteristic.properties.contains(CBCharacteristicProperties.broadcast)

        return [
            "read": canRead as AnyObject,
            "write": canWrite as AnyObject,
            "writeNoResponse": canWriteNoResponse as AnyObject,
            "notify": canNotify as AnyObject,
            "broadcast": canBroadcast as AnyObject,
        ]
    }

    static func asCharacteristic(characteristic: CBCharacteristic) -> BluetoothServiceReturn {
        return [
            "id": characteristic.uuid.uuidString as AnyObject,
            "deviceId": characteristic.service.peripheral.identifier.uuidString as AnyObject,
            "serviceId": characteristic.service.uuid.uuidString as AnyObject,
            "properties": makeCharacteristicProperties(characteristic: characteristic) as AnyObject,
            "value": (characteristic.value?.base64EncodedString(options: Data.Base64EncodingOptions()) ?? "") as AnyObject,
        ]
    }

    static func asCharacteristicList(characteristics: [CBCharacteristic]) -> BluetoothServiceReturn {
        return [
            "deviceId": characteristics.first?.service.peripheral.identifier.uuidString as AnyObject,
            "serviceId": characteristics.first?.service.uuid.uuidString as AnyObject,
            "characteristics": characteristics.map(asCharacteristic) as AnyObject
        ]
    }

    static func asCharacteristicWriteResult(info: CharacteristicInfo) -> BluetoothServiceReturn {
        if let error = info.error {
            return [
                "id": info.characteristic.uuid.uuidString as AnyObject,
                "deviceId": info.characteristic.service.peripheral.identifier.uuidString as AnyObject,
                "serviceId": info.characteristic.service.uuid.uuidString as AnyObject,
                "error": error.localizedDescription as AnyObject,
            ]
        }

        return [
            "id": info.characteristic.uuid.uuidString as AnyObject,
            "deviceId": info.characteristic.service.peripheral.identifier.uuidString as AnyObject,
            "serviceId": info.characteristic.service.uuid.uuidString as AnyObject,
            "success": true as AnyObject,
        ]
    }

    static func asDevice(device: CBPeripheral) -> BluetoothServiceReturn {
        return [
            "name" : (device.name ?? "Unknown") as AnyObject,
            "id" : device.identifier.uuidString as AnyObject,
            "address" : device.identifier.uuidString as AnyObject,
        ]
    }
}
