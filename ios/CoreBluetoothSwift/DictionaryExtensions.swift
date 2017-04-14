//
//  DictionaryExtensions.swift
//  ReactNativeBluetooth

import Foundation

extension Dictionary where Key: ExpressibleByStringLiteral, Value: AnyObject {
    func eitherOr(_ key1: Key, key2: Key) -> AnyObject? {
        let first = self[key1]
        return first != nil ? first : self[key2]
    }
}
