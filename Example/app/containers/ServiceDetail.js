import React, { PropTypes } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TopBar from '../components/TopBar';
import CharacteristicList from '../components/CharacteristicList';
import Bluetooth from 'react-native-bluetooth';
import { getAppState, setAppState } from '../lib/GlobalState';

const ServiceDetail = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
  },

  getInitialState() {
    const { selectedService } = getAppState();
    this.unsubscribe = () => {};

    return {
      service: selectedService,
      error: null,
      characteristics: [],
    };
  },

  componentWillMount() {
    Bluetooth.discoverCharacteristics(this.state.service, null, characteristic => {
      this.setState({
        characteristics: [...this.state.characteristic, characteristic]
      });
    })
    .then(unsubscribe => this.unsubscribe = unsubscribe)
      .catch(error => {
        this.setState({
          error: error,
        });
      });
  },

  componentWillUnmount() {
    this.unsubscribe();

    setAppState({
      selectedService: null,
    });
  },

  characteristicSelected(characteristic) {
    setAppState({
      selectedCharacteristic: characteristic,
    });

    console.log('Characteristic selected', characteristic);
    // this.props.navigator('CharacteristicDetail');
  },

  renderError() {
    if (this.state.error == null) return null;

    return (<Text style={styles.errorText}>{this.state.error}</Text>);
  },

  render() {
    return (
      <View style={styles.container}>
        <TopBar
          headerText={"Service - " + this.state.service.id}
          backAction={() => this.props.navigator('DeviceDetail')} />
        {this.renderError()}
        <View style={styles.listContainer}>
          <CharacteristicList
            characteristics={this.state.characteristics}
            selectCharacteristic={this.characteristicSelected} />
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
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});

export default ServiceDetail;
