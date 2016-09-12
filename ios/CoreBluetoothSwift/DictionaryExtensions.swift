//
//  DictionaryExtensions.swift
//  ReactNativeBluetooth

import Foundation

extension Dictionary where Key: StringLiteralConvertible, Value: AnyObject {
    func eitherOr(key1: Key, key2: Key) -> AnyObject? {
        let first = self[key1]
        return first != nil ? first : self[key2]
    }
}
