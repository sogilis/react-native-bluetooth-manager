import React from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import DeviceList from '../components/DeviceList';
import TopBar from '../components/TopBar';
import Bluetooth from 'react-native-bluetooth';

const ScanOptions = {
  // uuids: ["C40D40D2-AEA2-61B7-8A42-0C410D105395"],
  uuids: null,
};

const DeviceDiscovery = React.createClass({
  // propTypes: {
  //   onPress: PropTypes.func,
  //   style: View.propTypes.style,
  //   children: PropTypes.string,
  // },

  getInitialState() {
    return {
      devices: [],
      error: null,
    };
  },

  componentWillMount() {
    this.unsubscribe = Bluetooth.didDiscoverDevice((device) => {
      this.setState({
        devices: [...this.state.devices, device]
      });
    });

    Bluetooth.startScan(ScanOptions)
      .then(scan => scan.stopAfter(15000))
      .then(() => this.setState({status: "Done"}))
      .catch(error => this.setState({"error": error}));
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  scanInProgress() {
    return this.state.error == null && this.state.status != "Done";
  },

  renderError() {
    if (this.state.error == null) return null;

    return (<Text style={styles.errorText}>{this.state.error}</Text>);
  },

  render() {
    return (
      <View style={styles.container}>
        <TopBar headerText="Device List" />
        {this.renderError()}
        <View style={styles.deviceListContainer}>
          <ActivityIndicator animating={this.scanInProgress()} />
          <DeviceList devices={this.state.devices} selectDevice={device => console.log(device)} />
        </View>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  container: {
    flex: 1,
  },
  deviceListContainer: {
    flex: 1,
  },
});

export default DeviceDiscovery;
