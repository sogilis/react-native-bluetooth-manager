import React, { PropTypes } from 'react';
import { Navigator, Alert } from 'react-native';
import Bluetooth from 'react-native-bluetooth';
import { connect } from 'react-redux';

import DeviceDiscovery from '../containers/DeviceDiscovery';
import DeviceDetail from '../containers/DeviceDetail';
import ServiceDetail from '../containers/ServiceDetail';
import CharacteristicDetail from '../containers/CharacteristicDetail';
import NoBluetooth from '../components/NoBluetooth';

import { resetApplicationError } from '../actions/GlobalActions';

const Routes = React.createClass({
  propTypes: {
    error: PropTypes.string,
    resetError: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      bluetoothState: "enabled",
    };
  },

  renderScene(route, navigator) {
    const navigate = routeName => navigator.replace( { name: routeName } );

    if (this.state.bluetoothState != 'enabled') {
      return <NoBluetooth />;
    }
    if (route.name == 'DeviceDiscovery') {
      return <DeviceDiscovery navigator={navigate} />;
    }
    if (route.name == 'DeviceDetail') {
      return <DeviceDetail navigator={navigate} />;
    }
    if (route.name == 'ServiceDetail') {
      return <ServiceDetail navigator={navigate} />;
    }
    if (route.name == 'CharacteristicDetail') {
      return <CharacteristicDetail navigator={navigate} />;
    }

    console.assert(false, "Invalid route name requested.");
  },

  componentWillReceiveProps(nextProps) {
    const { error } = nextProps;
    const { resetError } = this.props;

    if (error != null) {
      Alert.alert(
        'Application error',
        error
      );

      resetError();
    }
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
    return (
      <Navigator
        initialRoute={{ name: 'DeviceDiscovery' }}
        renderScene={ this.renderScene } />
    );
  }
});


const mapStateToProps = state => {
  const { error } = state.global;

  return {
    error: error,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    resetError: () => {
      dispatch(resetApplicationError());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(Routes);

