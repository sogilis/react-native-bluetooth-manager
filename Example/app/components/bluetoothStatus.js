import React, { Component } from 'react';
import { Text } from 'react-native';
import Bluetooth from 'react-native-bluetooth';

const BluetoothStatus = React.createClass({
  getInitialState() {
    return {bluetoothState: "N/A"};
  },

  componentWillMount() {
    Bluetooth.didChangeState(function(newState) {
      this.setState({bluetoothState: newState});
    }.bind(this));
  },

  render() {
    return (
      <Text>{this.state.bluetoothState}</Text>
    );
  },
});

export default BluetoothStatus;
