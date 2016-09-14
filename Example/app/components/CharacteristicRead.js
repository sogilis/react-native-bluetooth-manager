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
      detail
    );
  },

  readCharacteristicValue() {
    this.setState({
      operationInProgress: true,
      characteristicValue: "",
    });

    Bluetooth.readCharacteristicValue(this.props.characteristic)
    .then(c => {
      const toDisplay = c.value.toString('hex');
      this.setState({characteristicValue: toDisplay});
    })
    .catch(e => {
      this.setState({
        characteristicValue: "No Value",
      });

      const message = "message" in e ? e.message : e;
      this.showReadAlert(message);
    })
    .finally(() => this.setState({operationInProgress: false}));
  },

  render() {
    if (!this.props.characteristic.properties.read) return null;

    return (
      <View style={styles.container}>
        <Button onPress={this.readCharacteristicValue} style={styles.buttonStyle}>Read</Button>
        <View style={ styles.resultHolder }>
          <Text>{this.state.characteristicValue}</Text>
          <ActivityIndicator animating={this.state.operationInProgress} />
        </View>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
  },
  resultHolder: {
    borderWidth: 2,
    borderColor: 'grey',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    overflow: 'hidden',
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
