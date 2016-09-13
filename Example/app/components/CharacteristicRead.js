import React, { PropTypes } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import Bluetooth from 'react-native-bluetooth';

import Button from './Button';

const CharacteristicRead = React.createClass({
  propTypes: {
    characteristic: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      operationInProgress: false,
      characteristicValue: "No Value",
    };
  },

  showReadAlert(detail) {
    Alert.alert(
      'Read Characteristic Error',
      // detail.error
      JSON.Stringify(detail)
    );
  },

  readCharacteristicValue() {
    this.setState({
      operationInProgress: true,
      characteristicValue: "",
    });
    console.log(this.props.characteristic);

    Bluetooth.readCharacteristicValue(this.props.characteristic)
    .then(c => this.setState({characteristicValue: c.value || ""}))
    .catch(e => {
      this.setState({
        characteristicValue: "No Value",
      });
      this.showReadAlert(e);
    })
    .finally(() => this.setState({operationInProgress: false}));
  },

  render() {
    // if (!this.props.characteristic.properties.read) return null;

    return (
      <View style={styles.container}>
        <Button onPress={this.readCharacteristicValue} style={styles.buttonStyle}>Read</Button>
        <Text>{this.state.characteristicValue}</Text>
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

CharacteristicRead.propTypes = {
  characteristic: PropTypes.object.isRequired,
  backAction: PropTypes.func,
};

export default CharacteristicRead;
