import React from 'react';
import { Text, View, StyleSheet} from 'react-native';
import TopBar from '../components/TopBar';
// import Bluetooth from 'react-native-bluetooth';
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
  },

  componentWillUnmount() {
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
        <TopBar headerText="Device List" />
        {this.renderError()}
        <Text>TODO:</Text>
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

export default DeviceDetail;
