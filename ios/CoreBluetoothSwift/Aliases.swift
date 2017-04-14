//
//  Aliases.swift
//  ReactNativeBluetooth
//

import CoreBluetooth

public typealias BluetoothServiceReturn = [String: AnyObject]

public typealias PeripheralInfo = (peripheral: CBPeripheral, error: Error?)
public typealias ServiceInfo = (peripheral: CBPeripheral, service: CBService, error: Error?)
public typealias CharacteristicInfo = (peripheral: CBPeripheral, characteristic: CBCharacteristic, error: Error?)

typealias ServiceDiscoveryCallback = (CBPeripheral, _ error: Error?) -> Void
typealias ServiceCallback = (CBPeripheral, CBService, Error?) -> Void

typealias CharacteristicCallbackParams = (CBPeripheral, CBCharacteristic, Error?)
typealias CharacteristicCallback = (CharacteristicCallbackParams) -> Void
