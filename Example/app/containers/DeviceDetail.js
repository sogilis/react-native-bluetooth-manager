import React from 'react';
import { Text, View, StyleSheet} from 'react-native';
import TopBar from '../components/TopBar';
// import ServiceList from '../components/ServiceList';
import Bluetooth from 'react-native-bluetooth';
import { getAppState, setAppState } from '../lib/GlobalState';

const DeviceDetail = React.createClass({
  propTypes: {
    // navigator: PropTypes.func.isRequired,
  },

  getInitialState() {
    const { selectedDevice } = getAppState();
    console.log('Device', selectedDevice);

    return {
      device: selectedDevice,
      error: null,
    };
  },

  componentWillMount() {
    // TODO: button for connect?
    Bluetooth.connect(this.state.device);
  },

  componentWillUnmount() {
    Bluetooth.disconnect(this.state.device);

    setAppState({
      selectedDevice: null,
    });
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
        <TopBar headerText={"Device - " + this.state.device.name} />
        {this.renderError()}
        <Text>Device name - {this.state.device.name}</Text>
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
});

export default DeviceDetail;
