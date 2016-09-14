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

-(void)dealloc {
    [actions cleanUp];
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
             characteristicNotifiedEventName: characteristicNotifiedEventName,
             deviceConnectedEventName: deviceConnectedEventName,
             deviceDisconnectedEventName: deviceDisconnectedEventName,
             deviceDiscoveredEventName: deviceDiscoveredEventName};
}

- (NSArray<NSString *> *)supportedEvents {
    return @[statusChangeEventName,
             scanStartedEventName,
             scanStoppedEventName,
             serviceDiscoveredEventName,
             serviceDiscoveryStartedEventName,
             characteristicDiscoveryStartedEventName,
             characteristicDiscoveredEventName,
             characteristicReadEventName,
             characteristicWrittenEventName,
             characteristicNotifiedEventName,
             deviceConnectedEventName,
             deviceDisconnectedEventName,
             deviceDiscoveredEventName,
             ];
}

typedef NSDictionary<NSString *, id> * BluetoothServiceReturn;

- (void)sendEventIfApplicable:(NSString * const)name body:(BluetoothServiceReturn)body {
    if (self.bridge == nil) {
        NSLog(@"Unable to send event, bridge is nil");
        return;
    }

    [self sendEventWithName:name body:body];
}

- (void)sendStringEventIfApplicable:(NSString * const)name body:(NSString *)body {
    if (self.bridge == nil) {
        NSLog(@"Unable to send event, bridge is nil");
        return;
    }

    [self sendEventWithName:name body:body];
}

- (void)registerForNativeEvents {
    __block ReactNativeBluetooth *myself = self;

    void  (^onChangeState)(NSString *) =
        ^(NSString * result) {
        [myself sendStringEventIfApplicable:statusChangeEventName body:result];
        };

    void  (^onServiceDiscovered)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:serviceDiscoveredEventName body:result];
        };

    void  (^onCharacteristicRead)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:characteristicReadEventName body:result];
        };

    void  (^onCharacteristicWritten)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:characteristicWrittenEventName body:result];
        };

    void  (^onCharacteristicNotified)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:characteristicNotifiedEventName body:result];
        };

    void  (^onCharacteristicDiscovered)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:characteristicDiscoveredEventName body:result];
        };

    void  (^onDeviceConnected)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:deviceConnectedEventName body:result];
        };

    void  (^onDeviceDisconnected)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:deviceDisconnectedEventName body:result];
        };

    void  (^onDeviceDiscovered)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
        [myself sendEventIfApplicable:deviceDiscoveredEventName body:result];
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

RCT_EXPORT_METHOD(discoverServices:(NSDictionary<NSString *, id> *)params services:(NSArray<NSString *> *)services) {
    __block ReactNativeBluetooth *myself = self;

    void  (^onDiscoverStarted)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
            [myself sendEventWithName:serviceDiscoveryStartedEventName body:result];
        };

    [actions discoverServices:params services:services onDiscoverStarted:onDiscoverStarted];
}

RCT_EXPORT_METHOD(discoverCharacteristics:(NSDictionary<NSString *, id> *)params characteristics:(NSArray<NSString *> *)characteristics) {
    __block ReactNativeBluetooth *myself = self;

    void  (^onDiscoverStarted)(BluetoothServiceReturn) =
        ^(BluetoothServiceReturn result) {
            [myself sendEventWithName:characteristicDiscoveryStartedEventName body:result];
        };

    [actions discoverCharacteristics:params characteristics:characteristics onDiscoverStarted:onDiscoverStarted];
}

RCT_EXPORT_METHOD(writeCharacteristicValue:(NSDictionary<NSString *, id> *)params value:(NSString *)value withResponse:(BOOL)withResponse) {
    [actions writeCharacteristicValue:params data:value withResponse:withResponse];
}

RCT_EXPORT_METHOD(readCharacteristicValue:(NSDictionary<NSString *, id> *)params) {
    [actions readCharacteristicValue:params];
}

RCT_EXPORT_METHOD(connect:(NSDictionary<NSString *, id> *)params) {
    [actions connect:params];
}

RCT_EXPORT_METHOD(disconnect:(NSDictionary<NSString *, id> *)params) {
    [actions disconnect:params];
}

RCT_EXPORT_METHOD(notifyCurrentState) {
    [self sendEventWithName:statusChangeEventName body:actions.bluetoothState];
}

RCT_EXPORT_METHOD(subscribeToNotification:(NSDictionary<NSString *, id> *)params) {
    [actions subscribeToNotification:params];
}

RCT_EXPORT_METHOD(unsubscribeFromNotification:(NSDictionary<NSString *, id> *)params) {
    [actions unsubscribeFromNotification:params];
}

@end
