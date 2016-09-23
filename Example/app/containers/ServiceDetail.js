import React, { PropTypes } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import TopBar from '../components/TopBar';
import CharacteristicList from '../components/CharacteristicList';
import Bluetooth from 'react-native-bluetooth';

import { applicationError } from '../actions/GlobalActions';
import { setCharacteristic, setService } from '../actions/DeviceContextActions';
import { characteristicDiscovered, resetCharacteristics } from '../actions/ServiceActions';

const ServiceDetail = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
    applicationError: PropTypes.func.isRequired,
    setService: PropTypes.func.isRequired,
    setCharacteristic: PropTypes.func.isRequired,
    resetCharacteristics: PropTypes.func.isRequired,
    characteristicDiscovered: PropTypes.func.isRequired,
    service: PropTypes.object.isRequired,
    characteristics: PropTypes.array.isRequired,
  },

  componentWillMount() {
    const { service, characteristicDiscovered, applicationError, characteristics } = this.props;

    if ((characteristics || []).length > 0) {
      return;
    }

    Bluetooth.discoverCharacteristics(service, null)
    .then(discoveredItems => {
      discoveredItems.forEach(c => characteristicDiscovered(c));
    })
    .catch(error => {
      applicationError(error.message);
    });
  },

  characteristicSelected(characteristic) {
    const { setCharacteristic, navigator } = this.props;

    setCharacteristic(characteristic);

    navigator('CharacteristicDetail');
  },

  goBack() {
    const { setService, resetCharacteristics, navigator } = this.props;

    setService(null);
    resetCharacteristics();

    navigator('DeviceDetail');
  },

  render() {
    const { characteristics } = this.props;

    return (
      <View style={styles.container}>
        <TopBar
          headerText={"Service Detail"}
          backAction={this.goBack} />
        <Text style={styles.labelText}>Characteristics</Text>
        <View style={styles.listContainer}>
          <CharacteristicList
            characteristics={characteristics}
            selectCharacteristic={this.characteristicSelected} />
        </View>
      </View>
    );
  },
});

const styles = StyleSheet.create({
  labelText: {
    fontSize: 20,
    color: 'grey',
    marginLeft: 15,
  },
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});

const mapStateToProps = state => {
  const { service } = state.deviceContext;

  return {
    ...state.service,
    service: service,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    applicationError: message => {
      dispatch(applicationError(message));
    },
    setService: service => {
      dispatch(setService(service));
    },
    setCharacteristic: characteristic => {
      dispatch(setCharacteristic(characteristic));
    },
    characteristicDiscovered: characteristic => {
      dispatch(characteristicDiscovered(characteristic));
    },
    resetCharacteristics: () => {
      dispatch(resetCharacteristics());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(ServiceDetail);
