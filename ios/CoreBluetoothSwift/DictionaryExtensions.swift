//
//  DictionaryExtensions.swift
//  ReactNativeBluetooth

import Foundation

extension Dictionary where Key: String {
    func eitherOr(key1: String, key2: String) -> Generator.Element? {
        let first = self[key1]
        return first != nil ? first : self[key2]
    }
}

