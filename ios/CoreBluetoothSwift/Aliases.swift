//
//  Aliases.swift
//  ReactNativeBluetooth
//

import CoreBluetooth

public typealias BluetoothServiceReturn = [String: AnyObject]

public typealias PeripheralInfo = (peripheral: CBPeripheral, error: NSError?)
public typealias ServiceInfo = (peripheral: CBPeripheral, service: CBService, error: NSError?)
public typealias CharacteristicInfo = (peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError?)

typealias ServiceDiscoveryCallback = (CBPeripheral, error: NSError?) -> Void
typealias ServiceCallback = (CBPeripheral, CBService, NSError?) -> Void

typealias CharacteristicCallbackParams = (CBPeripheral, CBCharacteristic, NSError?)
typealias CharacteristicCallback = (CharacteristicCallbackParams) -> Void
