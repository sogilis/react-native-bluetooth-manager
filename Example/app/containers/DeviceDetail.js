import React, { PropTypes } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import ServiceList from '../components/ServiceList';
import Bluetooth from 'react-native-bluetooth';

import { applicationError } from '../actions/GlobalActions';
import { setService, setDevice } from '../actions/DeviceContextActions';
import {
  serviceDiscovered,
  storeDisconnectionHandler,
  setConnectionStatus,
  setConnectionInProgress,
  resetServices
} from '../actions/DeviceActions';

const DeviceDetail = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
    applicationError: PropTypes.func.isRequired,
    setConnectionStatus: PropTypes.func.isRequired,
    setConnectionInProgress: PropTypes.func.isRequired,
    storeDisconnectionHandler: PropTypes.func.isRequired,
    setService: PropTypes.func.isRequired,
    setDevice: PropTypes.func.isRequired,
    resetServices: PropTypes.func.isRequired,
    serviceDiscovered: PropTypes.func.isRequired,
    disconnectionHandler: PropTypes.func.isRequired,
    isConnected: PropTypes.bool.isRequired,
    connectionInProgress: PropTypes.bool.isRequired,
    device: PropTypes.object.isRequired,
    services: PropTypes.array.isRequired,
  },

  disconnect() {
    const {
      setConnectionStatus,
      setConnectionInProgress,
      resetServices,
      applicationError,
      isConnected,
      device,
    } = this.props;

    if (isConnected) {
      setConnectionInProgress(true);
      this.endListeningForDisconnection();

      Bluetooth.disconnect(device)
      .then(() => {
        setConnectionStatus(false);
        setConnectionInProgress(false);
        resetServices();
      }).catch(e => {
        applicationError(e.message);
      });
    } else {
      resetServices();
    }
  },

  listenForDisconnect() {
    const {
      setConnectionStatus,
      resetServices,
    } = this.props;

    this.endListeningForDisconnection();

    setConnectionStatus(false);
    resetServices();

    applicationError('Device connection lost');
    this.props.navigator("DeviceDiscovery");
  },

  connect() {
    const {
      applicationError,
      setConnectionStatus,
      isConnected,
      setConnectionInProgress,
      storeDisconnectionHandler,
      serviceDiscovered,
      device
    } = this.props;

    if (isConnected) {
      this.disconnect();
      return;
    }

    setConnectionInProgress(true);

    const disconnectSubscription =
      Bluetooth.deviceDidDisconnect(device, this.listenForDisconnect);

    storeDisconnectionHandler(disconnectSubscription);

    if ((this.props.services || []).length > 0) {
      return;
    }

    Bluetooth.connect(device, null)
    .then(() => {
      setConnectionStatus(true);
      setConnectionInProgress(false);

      return Bluetooth.discoverServices(device, null);
    })
    .then(services => {
      services.forEach(service => serviceDiscovered(service));
    })
    .catch(error => applicationError(error.message));
  },

  serviceSelected(service) {
    const { setService, navigator } = this.props;
    setService(service);

    navigator('ServiceDetail');
  },

  endListeningForDisconnection() {
    const { disconnectionHandler, storeDisconnectionHandler } = this.props;
    disconnectionHandler();
    storeDisconnectionHandler(() => {});
  },

  goBack() {
    const {
      setDevice,
      navigator,
    } = this.props;

    this.disconnect();

    setDevice(null);
    navigator('DeviceDiscovery');
  },

  renderStatus() {
    const { connectionInProgress, isConnected } = this.props;

    if (connectionInProgress) {
      return <ActivityIndicator animating={true} />;
    }

    return (
      <View style={styles.statusContainer}>
        <TouchableOpacity onPress={this.connect}>
          <Text style={styles.statusText}>{isConnected ? 'Disconnect' : 'Connect'}</Text>
        </TouchableOpacity>
      </View>
    );
  },

  renderServiceLabel() {
    const { isConnected } = this.props;

    if (!isConnected) return null;

    return <Text style={styles.labelText}>Services</Text>;
  },

  render() {
    const { device, services } = this.props;

    return (
      <View style={styles.container}>
        <TopBar
          headerText={"Device - " + device.name}
          backAction={ this.goBack } />
        {this.renderStatus()}
        {this.renderServiceLabel()}
        <View style={styles.listContainer}>
          <ServiceList services={services} selectService={this.serviceSelected} />
        </View>
      </View>
    );
  },
});

const styles = StyleSheet.create({
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
  labelText: {
    fontSize: 20,
    color: 'grey',
    marginLeft: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
});

const mapStateToProps = state => {
  const { device } = state.deviceContext;

  return {
    ...state.device,
    device: device,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    applicationError: message => {
      dispatch(applicationError(message));
    },
    serviceDiscovered: service => {
      dispatch(serviceDiscovered(service));
    },
    storeDisconnectionHandler: handler => {
      dispatch(storeDisconnectionHandler(handler));
    },
    setConnectionStatus: status => {
      dispatch(setConnectionStatus(status));
    },
    setConnectionInProgress: inProgress => {
      dispatch(setConnectionInProgress(inProgress));
    },
    resetServices: () => {
      dispatch(resetServices());
    },
    setService: service => {
      dispatch(setService(service));
    },
    setDevice: device => {
      dispatch(setDevice(device));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(DeviceDetail);
