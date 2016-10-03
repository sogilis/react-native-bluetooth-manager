import React, { PropTypes } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TextInput } from 'react-native';
import Bluetooth from 'react-native-bluetooth-manager';
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
      textToSend: "",
    };
  },

  showWriteAlert(error) {
    Alert.alert(
      'Write Characteristic Error',
      error.message
    );
  },

  writeCharacteristicValue() {
    this.setState({
      operationInProgress: true,
      characteristicStatus: "",
    });

    const valueToWrite = new Buffer(this.state.textToSend);

    Bluetooth.writeCharacteristicValue(this.props.characteristic, valueToWrite, true)
    .then(() => this.setState({characteristicStatus: "\u2705"}))
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
        <View style={styles.statusContainer}>
          <Button onPress={this.writeCharacteristicValue} style={styles.buttonStyle}>Write</Button>
          <ActivityIndicator animating={this.state.operationInProgress} />
          <Text>{this.state.characteristicStatus}</Text>
        </View>
        <TextInput
          placeHolder="Enter text to send."
          style={styles.textEntry}
          onChangeText={text => this.setState({ textToSend: text })}
          value={this.state.textToSend}
        />
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textEntry: {
    borderWidth: 2,
    borderColor: 'grey',
    borderRadius: 5,
    marginTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    height: 40,
  },
  buttonStyle: {
    width: 120,
    marginRight: 20,
  }
});

CharacteristicWrite.propTypes = {
  characteristic: PropTypes.object.isRequired,
  backAction: PropTypes.func,
};

export default CharacteristicWrite;
