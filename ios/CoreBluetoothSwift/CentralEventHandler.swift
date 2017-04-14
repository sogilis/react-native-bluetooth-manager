//
//  CentralEventHandler.swift
//  ReactNativeBluetooth
//

import Foundation
import CoreBluetooth

enum BluetoothState {
    case unknown
    case resetting
    case unsupported
    case unauthorized
    case poweredOff
    case poweredOn
}

class CentralEventHandler: NSObject, CBCentralManagerDelegate {
    fileprivate var onStateChange: ((BluetoothState) -> Void)?
    fileprivate var onDeviceDiscovered: ((CBPeripheral) -> Void)?
    fileprivate var onDeviceConnected: ((CBPeripheral) -> Void)?
    fileprivate var onDeviceConnectedOnce: ((CBPeripheral) -> Void)?
    fileprivate var onDeviceDisconnected: ((CBPeripheral) -> Void)?

    func onStateChange(_ handler: @escaping (BluetoothState) -> Void) -> Void {
        self.onStateChange = handler
    }

    func onDeviceDiscovered(_ handler: @escaping (CBPeripheral) -> Void) -> Void {
        self.onDeviceDiscovered = handler
    }

    func onDeviceConnected(_ handler: @escaping (CBPeripheral) -> Void) -> Void {
        self.onDeviceConnected = handler
    }

    func onDeviceDisconnected(_ handler: @escaping (CBPeripheral) -> Void) -> Void {
        self.onDeviceDisconnected = handler
    }

    /**
     *  Waits to check powered on state and handles other cases.
     */
    @objc func centralManagerDidUpdateState(_ central: CBCentralManager) {
        guard let callback = onStateChange else {
            print("State changed but no callback registered \(central.state)")
            return
        }

        switch central.state {
        case .unknown:
            callback(BluetoothState.unknown)
            break
        case .resetting:
            callback(BluetoothState.resetting)
            break
        case .unsupported:
            callback(BluetoothState.unsupported)
            break
        case .unauthorized:
            callback(BluetoothState.unauthorized)
            break
        case .poweredOff:
            callback(BluetoothState.poweredOff)
            break
        case .poweredOn:
            callback(BluetoothState.poweredOn)
        }
    }

    /**
     *  Handles the case where a peripheral is discovered.
     */
    @objc func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral,
                              advertisementData: [String : Any], rssi RSSI: NSNumber) {
        print("Discovered \(peripheral.name) at \(RSSI)")

        guard let callback = onDeviceDiscovered else {
            print("Device discovered but no callback registered.")
            return
        }

        callback(peripheral)
    }

    /**
     *  Handles the case where a peripheral is connected.
     */
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("Peripheral Connected", peripheral.name)

        guard let callback = onDeviceConnected else {
            print("Peripheral connected but no callback registered.", peripheral.name)
            return
        }

        callback(peripheral)
    }

    /**
     *  Handles the case where a peripheral is disconnected.
     */
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        print("Peripheral Disconnected")

        guard let callback = onDeviceDisconnected else {
            print("Peripheral disconnected but no callback registered.", peripheral.name)
            return
        }

        callback(peripheral)
    }
}
