import React, { PropTypes } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import TopBar from '../components/TopBar';
import ServiceList from '../components/ServiceList';
import Bluetooth from 'react-native-bluetooth';
import { getAppState, setAppState } from '../lib/GlobalState';

const DeviceDetail = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
  },

  getInitialState() {
    const { selectedDevice } = getAppState();
    this.unsubscribe = () => {};

    return {
      device: selectedDevice,
      error: null,
      services: [],
      isConnected: false,
      connectionInProgress: false,
    };
  },

  componentWillMount() {
  },

  componentWillUnmount() {
    this.unsubscribe();

    Bluetooth.disconnect(this.state.device);

    setAppState({
      selectedDevice: null,
    });
  },

  connect() {
    if (this.state.isConnected) {
      this.setState({
        isConnected: false,
        connectionInProgress: true,
      });

      Bluetooth.disconnect(this.state.device)
      .then(() => {
        this.setState({
          isConnected: true,
          connectionInProgress: false,
        });

      });

      return;
    }

    this.setState({
      isConnected: false,
      connectionInProgress: true,
    });

    Bluetooth.connect(this.state.device)
    .then(() => {
      this.setState({
        isConnected: true,
        connectionInProgress: false,
      });

      this.unsubscribe = Bluetooth.discoverServices(this.state.device, null, service => {
        this.setState({
          services: [...this.state.services, service]
        });
      });
    })
    .catch(error => {
      this.setState({
        error: error,
      });
    });
  },

  scanInProgress() {
    return this.state.error == null && this.state.status != "Done";
  },

  renderError() {
    if (this.state.error == null) return null;

    return (<Text style={styles.errorText}>{this.state.error}</Text>);
  },

  renderStatus() {
    if (this.state.connectionInProgress)
    {
        return <ActivityIndicator animating={true} />;
    }

    return (
      <View style={styles.statusContainer}>
        <TouchableOpacity onPress={this.connect}>
          <Text style={styles.statusText}>{this.state.isConnected ? 'Disconnect' : 'Connect'}</Text>
        </TouchableOpacity>
      </View>
    );
  },

  render() {
    return (
      <View style={styles.container}>
        <TopBar
          headerText={"Device - " + this.state.device.name}
          backAction={() => this.props.navigator('DeviceDiscovery')} />
        {this.renderError()}
        {this.renderStatus()}
        <View style={styles.listContainer}>
          <ServiceList services={this.state.services} />
        </View>
      </View>
    );
  },
});

const styles = StyleSheet.create({
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  statusText: {
    fontSize: 20,
    color: '#00AFEE',
  },
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
});

export default DeviceDetail;
