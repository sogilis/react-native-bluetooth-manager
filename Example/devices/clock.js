var bleno = require('bleno');
var util = require('util');

var currentTimeString = function() {
  return new Date().toLocaleTimeString();
};


var ClockCharacteristic = function() {
  ClockCharacteristic.super_.call(this, {
    uuid: 'baedcf60-7b28-11e6-92be-67ce27ce051d',
    properties: ['read', 'notify'],
  });

  this._updateValueCallback = null;

  var makeCallback = () => {
    setTimeout(function() {
      if (this._updateValueCallback) {
        var value = currentTimeString();
        this._updateValueCallback(Buffer.from(value));
        if (this.active) {
          this.sendValue();
        }
        console.log('notified => ' + value);
      }
      makeCallback();
    }.bind(this), 1000);
  };

  makeCallback();
};

util.inherits(ClockCharacteristic, bleno.Characteristic);

ClockCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var value = currentTimeString();
  callback(this.RESULT_SUCCESS, Buffer.from(value));
  console.log('read => ' + value);
};

ClockCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  this._updateValueCallback = updateValueCallback;
  console.log('subscribed');
};

ClockCharacteristic.prototype.onUnsubscribe = function() {
  this._updateValueCallback = null;
  console.log('unsubscribed');
};

const ClockServiceUuid = 'c2d92c16-7b27-11e6-92bb-67ce27ce051d';

var ClockService = function() {
  ClockService.super_.call(this, {
    uuid: ClockServiceUuid,
    characteristics: [new ClockCharacteristic()],
  });
};

util.inherits(ClockService, bleno.PrimaryService);

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('Clock', [ClockServiceUuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  if (!error) {
    bleno.setServices([new ClockService()]);
  }
});
