//
//  ReactNativeBluetooth.m
//  ReactNativeBluetooth
//

#import "ReactNativeBluetooth.h"
#import "CoreBluetoothSwift/CoreBluetoothSwift-Swift.h"

NSString *const statusChangeEventName = @"StateChanged";
NSString *const scanStartedEventName = @"ScanStarted";
NSString *const scanStoppedEventName = @"ScanStopped";
NSString *const serviceDiscoveredEventName = @"ServiceDiscovered";
NSString *const serviceDiscoveryStartedEventName = @"ServiceDiscoveryStarted";
NSString *const characteristicDiscoveryStartedEventName = @"CharacteristicDiscoveryStarted";
NSString *const characteristicDiscoveredEventName = @"CharacteristicDiscovered";
NSString *const characteristicReadEventName = @"CharacteristicRead";
NSString *const characteristicWrittenEventName = @"CharacteristicWritten";
NSString *const characteristicNotifiedEventName = @"CharacteristicNotified";
NSString *const deviceConnectedEventName = @"DeviceConnected";
NSString *const deviceDisconnectedEventName = @"DeviceDisconnected";
NSString *const deviceDiscoveredEventName = @"DeviceDiscovered";

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
    return @{statusChangeEventName: statusChangeEventName,
             scanStartedEventName: scanStartedEventName,
             scanStoppedEventName: scanStoppedEventName,
             serviceDiscoveredEventName: serviceDiscoveredEventName,
             serviceDiscoveryStartedEventName: serviceDiscoveryStartedEventName,
             characteristicDiscoveryStartedEventName: characteristicDiscoveryStartedEventName,
             characteristicDiscoveredEventName: characteristicDiscoveredEventName,
             characteristicReadEventName: characteristicReadEventName,
             characteristicWrittenEventName: characteristicWrittenEventName,
             characteristicReadEventName: characteristicNotifiedEventName,
             deviceConnectedEventName: deviceConnectedEventName,
             deviceDisconnectedEventName: deviceDisconnectedEventName,
             deviceDiscoveredEventName: deviceDiscoveredEventName};
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

    void  (^onCharacteristicWritten)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:characteristicWrittenEventName body:result];
        };

    void  (^onCharacteristicNotified)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:characteristicNotifiedEventName body:result];
        };

    void  (^onCharacteristicDiscovered)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:characteristicDiscoveredEventName body:result];
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
    [actions onCharacteristicWritten:onCharacteristicWritten];
    [actions onCharacteristicNotified:onCharacteristicNotified];
    [actions onCharacteristicDiscovered:onCharacteristicDiscovered];
    [actions onDeviceConnected:onDeviceConnected];
    [actions onDeviceDisconnected:onDeviceDisconnected];
    [actions onDeviceDiscovered:onDeviceDiscovered];
}


- (void)onStatusChanged:(NSString * const)status {
    [self sendEventWithName:statusChangeEventName body:status];
}

RCT_EXPORT_METHOD(startScan:(NSArray *)params) {
    __block ReactNativeBluetooth *myself = self;

    void  (^onScanStarted)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventWithName:scanStartedEventName body:result];
        };

    [actions startScan:params onScanStarted:onScanStarted];
}

RCT_EXPORT_METHOD(stopScan) {
    __block ReactNativeBluetooth *myself = self;

    void  (^onScanStopped)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
            [myself sendEventWithName:scanStoppedEventName body:result];
        };

    [actions stopScan:onScanStopped];
}

RCT_EXPORT_METHOD(discoverServices:(NSArray *)params services:(NSArray<NSString *> *)services) {
    __block ReactNativeBluetooth *myself = self;

    void  (^onDiscoverStarted)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
            [myself sendEventWithName:serviceDiscoveryStartedEventName body:result];
        };

    [actions discoverServices:params services:services onDiscoverStarted:onDiscoverStarted];
}

RCT_EXPORT_METHOD(discoverCharacteristics:(NSArray *)params characteristics:(NSArray<NSString *> *)characteristics) {
    __block ReactNativeBluetooth *myself = self;

    void  (^onDiscoverStarted)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
            [myself sendEventWithName:characteristicDiscoveryStartedEventName body:result];
        };

    [actions discoverCharacteristics:params characteristics:characteristics onDiscoverStarted:onDiscoverStarted];
}

RCT_EXPORT_METHOD(writeCharacteristicValue:(NSArray *)params value:(NSString *)value withResponse:(BOOL)withResponse) {
    [actions writeCharacteristicValue:params data:value withResponse:withResponse];
}

RCT_EXPORT_METHOD(readCharactaristicValue:(NSArray *)params) {
    [actions readCharacteristicValue:params];
}

RCT_EXPORT_METHOD(connect:(NSArray *)params) {
    [actions connect:params];
}

RCT_EXPORT_METHOD(disconnect:(NSArray *)params) {
    [actions disconnect:params];
}

RCT_EXPORT_METHOD(notifyCurrentState) {
    [self sendEventWithName:statusChangeEventName body:actions.bluetoothState];
}

@end
