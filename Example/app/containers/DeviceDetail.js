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
    const { selectedDevice, isConnected, services } = getAppState();
    this.unsubscribe = () => {};

    return {
      device: selectedDevice,
      error: null,
      services: services || [],
      isConnected: isConnected || false,
      connectionInProgress: false,
    };
  },

  componentWillMount() {
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  connect() {
    if (this.state.isConnected) {
      this.setState({
        isConnected: false,
        connectionInProgress: true,
      });

      Bluetooth.disconnect(this.state.device)
      .then(() => {
        setAppState({ isConnected: false });

        this.setState({
          isConnected: false,
          connectionInProgress: false,
          services: [],
        });
      });

      return;
    }

    setAppState({ isConnected: false });
    this.setState({
      isConnected: false,
      connectionInProgress: true,
    });

    Bluetooth.connect(this.state.device)
    .then(() => {
      setAppState({ isConnected: true });

      this.setState({
        isConnected: true,
        connectionInProgress: false,
      });

      return Bluetooth.discoverServices(this.state.device, null, service => {
          this.setState({
            services: [...this.state.services, service]
          });
        });
    })
    .then(unsubscribe => this.unsubscribe = unsubscribe)
    .catch(error => {
      this.setState({
        error: error,
      });
    });
  },

  serviceSelected(service) {
    setAppState({
      selectedService: service,
      services: this.state.services,
    });

    this.props.navigator('ServiceDetail');
  },

  goBack() {
    Bluetooth.disconnect(this.state.device);

    setAppState({
      selectedDevice: null,
      isConnected: false,
      services: [],
    });

    this.props.navigator('DeviceDiscovery');
  },

  renderError() {
    if (this.state.error == null) return null;

    return (<Text style={styles.errorText}>{this.state.error}</Text>);
  },

  renderStatus() {
    if (this.state.connectionInProgress) {
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
          backAction={ this.goBack } />
        {this.renderError()}
        {this.renderStatus()}
        <View style={styles.listContainer}>
          <ServiceList services={this.state.services} selectService={this.serviceSelected} />
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
