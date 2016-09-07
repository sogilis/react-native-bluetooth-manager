//
//  ReactNativeBluetooth.m
//  ReactNativeBluetooth
//

#import "ReactNativeBluetooth.h"
#import "CoreBluetoothSwift/CoreBluetoothSwift-Swift.h"

NSString *const statusChangeEventName = @"RNBStateChanged";
NSString *const serviceDiscoveredEventName = @"RNBServiceDiscovered";
NSString *const characteristicReadEventName = @"RNBCharacteristicRead";
NSString *const characteristicWrittenEventName = @"RNBCharacteristicWritten";
NSString *const characteristicNotifiedEventName = @"RNBCharacteristicNotified";
NSString *const deviceConnectedEventName = @"RNBDeviceConnected";
NSString *const deviceDisconnectedEventName = @"RNBDeviceDisconnected";
NSString *const deviceDiscoveredEventName = @"RNBDeviceDiscovered";

@implementation ReactNativeBluetooth {
    BluetoothActions * actions;
}


RCT_EXPORT_MODULE();

- (instancetype)init {
    actions = [[BluetoothActions alloc] init];
    [self registerForNativeEvents];

    return [super init];
}

- (NSDictionary<NSString *, NSString *> *)constantsToExport {
    return @{@"StateChanged": statusChangeEventName,
             @"ServiceDiscovered": serviceDiscoveredEventName,
             @"CharacteristicRead": characteristicReadEventName,
             @"CharacteristicWritten": characteristicWrittenEventName,
             @"CharacteristicNotified": characteristicNotifiedEventName,
             @"DeviceConnected": deviceConnectedEventName,
             @"DeviceDisconnected": deviceDisconnectedEventName,
             @"DeviceDiscovered": deviceDiscoveredEventName};
}

- (NSArray<NSString *> *)supportedEvents {
    return @[statusChangeEventName,
             deviceConnectedEventName,
             deviceDiscoveredEventName
             ];
}

typedef NSDictionary<NSString *, id> * BluetoothServiceReturn;

- (void)registerForNativeEvents {
    __block ReactNativeBluetooth *myself = self;

    void  (^onChangeState)(NSString *) =
        ^(NSString * result) {
        [myself sendEventWithName:statusChangeEventName body:result];
        };

    void  (^onServiceDiscovered)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:serviceDiscoveredEventName body:result];
        };

    void  (^onCharacteristicRead)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:characteristicReadEventName body:result];
        };

    void  (^onCharacteristicNotified)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:characteristicNotifiedEventName body:result];
        };

    void  (^onDeviceConnected)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:deviceConnectedEventName body:result];
        };

    void  (^onDeviceDisconnected)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:deviceDisconnectedEventName body:result];
        };

    void  (^onDeviceDiscovered)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:deviceDiscoveredEventName body:result];
        };


    [actions onChangeState:onChangeState];

    [actions onServiceDiscovered:onServiceDiscovered];
    [actions onCharacteristicRead:onCharacteristicRead];
    [actions onCharacteristicNotified:onCharacteristicNotified];
    [actions onDeviceConnected:onDeviceConnected];
    [actions onDeviceDisconnected:onDeviceDisconnected];
    [actions onDeviceDiscovered:onDeviceDiscovered];
}


- (void)onStatusChanged:(NSString * const)status {
    [self sendEventWithName:statusChangeEventName body:status];
}


RCT_EXPORT_METHOD(startScan:(NSArray *)params resover:(RCTPromiseResolveBlock)resolve rejector:(RCTPromiseRejectBlock) reject) {
    [actions startScan:params onScanStarted:^{
        resolve([NSNull null]);
    }];
}

RCT_EXPORT_METHOD(stopScan:(RCTPromiseResolveBlock)resolve rejector:(RCTPromiseRejectBlock) reject) {
    [actions stopScan:^{
        resolve([NSNull null]);
    }];
}

RCT_EXPORT_METHOD(notifyCurrentState) {
    [self sendEventWithName:statusChangeEventName body:actions.bluetoothState];
}

// To define with correct parameters.
//RCT_EXPORT_METHOD(writeToCharacteristic:(RCTResponseSenderBlock)callback) {
//    void  (^onCharacteristicWritten)(BluetoothServiceReturn) =
//        ^(BluetoothServiceReturn result) {
//        [self sendEventWithName:characteristicWrittenEventName body:result];
//        };

//    [actions onCharacteristicWritten:onCharacteristicWritten];
//}

@end
