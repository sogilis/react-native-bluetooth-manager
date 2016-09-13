import React, { PropTypes } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import Bluetooth from 'react-native-bluetooth';
import { Buffer } from 'buffer';

import Button from './Button';

const CharacteristicWrite = React.createClass({
  propTypes: {
    characteristic: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      operationInProgress: false,
      characteristicStatus: "Waiting for write",
    };
  },

  showWriteAlert(detail) {
    Alert.alert(
      'Write Characteristic Error',
      detail
    );
  },

  writeCharacteristicValue() {
    this.setState({
      operationInProgress: true,
      characteristicStatus: "In progress",
    });

    const valueToWrite = new Buffer("\0\u{01}\u{02}\u{03}\u{04}\u{05}\u{06}\u{07}");

    Bluetooth.writeCharacteristicValue(this.props.characteristic, valueToWrite, true)
    .then(() => this.setState({characteristicStatus: "Written"}))
    .catch(e => {
      this.setState({
        characteristicStatus: "Write error",
      });
      this.showWriteAlert(e);
    })
    .finally(() => this.setState({operationInProgress: false}));
  },

  render() {
    if (!this.props.characteristic.properties.write) return null;

    return (
      <View style={styles.container}>
        <Button onPress={this.writeCharacteristicValue} style={styles.buttonStyle}>Write</Button>
        <Text>{this.state.characteristicStatus}</Text>
        <ActivityIndicator animating={this.state.operationInProgress} />
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonStyle: {
    width: 120,
  }
});

CharacteristicWrite.propTypes = {
  characteristic: PropTypes.object.isRequired,
  backAction: PropTypes.func,
};

export default CharacteristicWrite;
