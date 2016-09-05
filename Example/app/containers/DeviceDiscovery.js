import React, { Component } from 'react';
import { Text, View } from 'react-native';
import DeviceList from '../components/DeviceList';
import Bluetooth from 'react-native-bluetooth';

const ScanOptions = {
  uuids: ["C40D40D2-AEA2-61B7-8A42-0C410D105395"],
};

const DeviceDiscovery = React.createClass({
  getInitialState() {
    return {
      devicesByAddress: {},
      error: null,
    };
  },

  componentWillMount() {
    this.unsubscribe = Bluetooth.didDiscoverDevice((device) => {
      this.setState(Object.assign({}, this.state, {
        devicesByAddress: Object.assign({}, this.state.devicesByAddress, {
          address: device,
        }),
      }));
    });

    Bluetooth.startScan(ScanOptions)
      .then(scan => scan.stopAfter(3000))
      .then(() => this.setState({...this.state, status: "Done"}))
      .catch(error => this.setState({...this.state, "error": error}));
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  status() {
    if (this.state.error != null) {
      return this.state.error;
    } else {
      return "Scanning for bluetooth devices...";
    }
  },

  render() {
    return (
      <View>
        <DeviceList devices={Object.values(this.state.devicesByAddress)} />
        <Text>{this.status()}</Text>
      </View>
    );
  },
});

export default DeviceDiscovery;
