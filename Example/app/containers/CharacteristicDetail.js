import React, { PropTypes } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TopBar from '../components/TopBar';
import { getAppState, setAppState } from '../lib/GlobalState';

import CharacteristicRead from '../components/CharacteristicRead';

const CharacteristicDetail = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
  },

  getInitialState() {
    const { selectedCharacteristic } = getAppState();
    this.unsubscribe = () => {};

    return {
      characteristic: selectedCharacteristic,
      error: null,
    };
  },

  componentWillMount() {
  },

  componentWillUnmount() {
    this.unsubscribe();

    setAppState({
      selectedCharacteristic: null,
    });
  },

  renderError() {
    if (this.state.error == null) return null;

    return (<Text style={styles.errorText}>{this.state.error}</Text>);
  },

  formatProperties() {
    const characteristic = this.state.characteristic;

    if (!characteristic.properties)
      return "";

    const writeString = characteristic.properties.write ? " WRITE " : "";
    const readString = characteristic.properties.read ? " READ " : "";
    const notifyString = characteristic.properties.notify ? " NOTIFY " : "";
    return `${writeString}${readString}${notifyString}`;
  },

  render() {
    return (
      <View style={styles.container}>
        <TopBar
          headerText={"Characteristic Detail"}
          backAction={() => this.props.navigator('ServiceDetail')} />
        {this.renderError()}
        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>UUID: {this.state.characteristic.id}</Text>
          <Text style={styles.detailText}>Properties: {this.formatProperties()}</Text>
          <CharacteristicRead characteristic={this.state.characteristic} />
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
  detailText: {
    fontSize: 16,
    color: 'grey',
    marginTop: 10,
  },
  container: {
    flex: 1,
  },
  detailContainer: {
    flex: 1,
    paddingLeft: 5,
  },
});

export default CharacteristicDetail;
