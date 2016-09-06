import React, { Component } from 'react';
import { Text, View } from 'react-native';
import DeviceDiscovery from './DeviceDiscovery';
import Bluetooth from 'react-native-bluetooth';

const App = React.createClass({
  getInitialState() {
    return {
      bluetoothState: "unknown",
    };
  },

  componentWillMount() {
    this.unsubscribe = Bluetooth.didChangeState(newState => {
      this.setState({bluetoothState: newState});
    });
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  render() {
    if (this.state.bluetoothState == "enabled") {
      return (
        <DeviceDiscovery />
      );
    } else {
      return (
        <Text>Bluetooth state: {this.state.bluetoothState}</Text>
      );
    }
  },
});

export default App;
