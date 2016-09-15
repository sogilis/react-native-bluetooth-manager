import React, { PropTypes } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import TopBar from '../components/TopBar';

import { applicationError } from '../actions/GlobalActions';
import { setCharacteristic } from '../actions/DeviceContextActions';

import CharacteristicRead from '../components/CharacteristicRead';
import CharacteristicWrite from '../components/CharacteristicWrite';
import CharacteristicNotify from '../components/CharacteristicNotify';

const CharacteristicDetail = React.createClass({
  propTypes: {
    navigator: PropTypes.func.isRequired,
    setCharacteristic: PropTypes.func.isRequired,
    applicationError: PropTypes.func.isRequired,
    characteristic: PropTypes.object.isRequired,
  },

  goBack() {
    const { setCharacteristic, navigator } = this.props;

    setCharacteristic(null);
    navigator('ServiceDetail');
  },

  formatProperties() {
    const { characteristic } = this.props;

    if (!characteristic.properties)
      return "";

    const writeString = characteristic.properties.write ? " WRITE " : "";
    const readString = characteristic.properties.read ? " READ " : "";
    const notifyString = characteristic.properties.notify ? " NOTIFY " : "";
    return `${writeString}${readString}${notifyString}`;
  },

  render() {
    const { characteristic } = this.props;

    return (
      <View style={styles.container}>
        <TopBar
          headerText={"Characteristic Detail"}
          backAction={this.goBack} />
        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>UUID: {characteristic.id}</Text>
          <Text style={styles.detailText}>Properties: {this.formatProperties()}</Text>
          <CharacteristicWrite characteristic={characteristic} />
          <CharacteristicRead characteristic={characteristic} />
          <CharacteristicNotify characteristic={characteristic} />
        </View>
      </View>
    );
  },
});

const styles = StyleSheet.create({
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

const mapStateToProps = state => {
  const { characteristic } = state.deviceContext;

  return {
    characteristic: characteristic,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    applicationError: message => {
      dispatch(applicationError(message));
    },
    setCharacteristic: characteristic => {
      dispatch(setCharacteristic(characteristic));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(CharacteristicDetail);
