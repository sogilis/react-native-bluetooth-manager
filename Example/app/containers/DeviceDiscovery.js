import React, { PropTypes } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import DeviceList from '../components/DeviceList';
import TopBar from '../components/TopBar';
import Bluetooth from 'react-native-bluetooth';
import { setAppState } from '../lib/GlobalState';

const ScanOptions = {
  uuids: null,
};

const DeviceDiscovery = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      devices: [],
      error: null,
      status: "",
    };
  },

  componentWillMount() {
    this.unsubscribe = Bluetooth.didDiscoverDevice((device) => {
      this.setState({
        devices: [...this.state.devices, device],
        status: "Connecting",
      });
    });

    Bluetooth.startScan(ScanOptions)
      .then(scan => scan.stopAfter(15000))
      .then(() => this.setState({status: "Done"}))
      .catch(error => this.setState({"error": error.message}));
  },

  componentWillUnmount() {
    Bluetooth.stopScan();
    this.unsubscribe();
  },

  scanInProgress() {
    return (this.state.error == null || this.state.error == "" ) && this.state.status != "Done";
  },

  deviceSelected(device) {
    setAppState({
      selectedDevice: device,
    });

    this.props.navigator('DeviceDetail');
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
          <DeviceList devices={this.state.devices} selectDevice={this.deviceSelected} />
        </View>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 5,
    padding: 5,
  },
  container: {
    flex: 1,
  },
  deviceListContainer: {
    flex: 1,
  },
});

export default DeviceDiscovery;
