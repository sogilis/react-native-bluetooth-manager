import React, { PropTypes } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';

import DeviceList from '../components/DeviceList';
import TopBar from '../components/TopBar';
import Bluetooth from 'react-native-bluetooth-manager';

import {
  deviceDiscovered,
  discoveryStatusChange,
  resetDevices,
} from '../actions/DiscoveryActions';

import { applicationError } from '../actions/GlobalActions';
import { setDevice } from '../actions/DeviceContextActions';

const ScanOptions = {
  uuids: null,
};

const DeviceDiscovery = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
    deviceDiscovered: PropTypes.func.isRequired,
    discoveryStatusChange: PropTypes.func.isRequired,
    resetDevices: PropTypes.func.isRequired,
    applicationError: PropTypes.func.isRequired,
    discoveryStatus: PropTypes.string.isRequired,
    devicesDiscovered: PropTypes.array.isRequired,
    setDevice: PropTypes.func.isRequired,
  },

  componentWillMount() {
    const { deviceDiscovered, discoveryStatusChange, applicationError, resetDevices } = this.props;

    resetDevices();
    discoveryStatusChange("Connecting");

    this.unsubscribe = Bluetooth.didDiscoverDevice((device) => {
      deviceDiscovered(device);
    });

    this.scanStoppedUnsubscribe = Bluetooth.scanDidStop(() => {
      discoveryStatusChange("Done");
    });

    Bluetooth.startScan(ScanOptions)
      .then(scan => scan.stopAfter(15000))
      .catch(error => applicationError(error.message));
  },

  componentWillUnmount() {
    this.scanStoppedUnsubscribe();
    this.unsubscribe();

    Bluetooth.stopScan();
  },

  scanInProgress() {
    return this.props.discoveryStatus != "Done";
  },

  deviceSelected(device) {
    const { setDevice, navigator } = this.props;

    setDevice(device);

    navigator('DeviceDetail');
  },

  render() {
    const { devicesDiscovered } = this.props;

    return (
      <View style={styles.container}>
        <TopBar headerText="Device List" />
        <View style={styles.deviceListContainer}>
          <ActivityIndicator animating={this.scanInProgress()} />
          <DeviceList devices={devicesDiscovered} selectDevice={this.deviceSelected} />
        </View>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deviceListContainer: {
    flex: 1,
  },
});

const mapStateToProps = state => {
  return state.discovery;
};

const mapDispatchToProps = dispatch => {
  return {
    deviceDiscovered: device => {
      dispatch(deviceDiscovered(device));
    },
    discoveryStatusChange: status => {
      dispatch(discoveryStatusChange(status));
    },
    resetDevices: () => {
      dispatch(resetDevices());
    },
    setDevice: device => {
      dispatch(setDevice(device));
    },
    applicationError: (message) => {
      dispatch(applicationError(message));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(DeviceDiscovery);
