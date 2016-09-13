import React, { PropTypes } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import Bluetooth from 'react-native-bluetooth';

import Button from './Button';

const CharacteristicNotify = React.createClass({
  propTypes: {
    characteristic: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      operationInProgress: false,
      characteristicStatus: "Not subscribed",
      isSubscribed: false,
    };
  },

  showNotifyAlert(detail) {
    Alert.alert(
      'Notify Subscription Error',
      detail
    );
  },

  componentWillMount() {
    this.unsubscribe = () => {};
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  unsubscribeFromNotification() {
    this.unsubscribe();

    this.setState({
      isSubscribed: false,
      characteristicStatus: "Not subscribed",
    });
  },

  onNotificationReceived(detail) {
    this.setState({
      characteristicStatus: detail.value || "Unable to read value",
    });
  },

  subscribeToNotifyValue() {
    if (this.state.isSubscribed) {
      this.unsubscribeFromNotification();
      return;
    }

    this.setState({
      operationInProgress: true,
      characteristicStatus: "",
    });

    this.unsubscribe =
      Bluetooth.characteristicDidNotify(this.props.characteristic, this.onNotificationReceived);

    this.setState({
          isConnected: true,
          characteristicStatus: "Waiting for value",
          operationInProgress: false,
        });
  },

  render() {
    if (!this.props.characteristic.properties.notify) return null;

    return (
      <View style={styles.container}>
        <Button onPress={this.subscribeToNotifyValue} style={styles.buttonStyle}>Notify</Button>
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

CharacteristicNotify.propTypes = {
  characteristic: PropTypes.object.isRequired,
  backAction: PropTypes.func,
};

export default CharacteristicNotify;
