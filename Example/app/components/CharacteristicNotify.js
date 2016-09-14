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
    console.log("Received notification", detail);
    this.setState({
      characteristicStatus: detail.value ? detail.value.toString('hex') : "No value passed in notification",
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
        <View style={ styles.resultHolder }>
          <Text>{this.state.characteristicStatus}</Text>
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
  },
  buttonStyle: {
    width: 120,
    marginRight: 10,
  }
});

CharacteristicNotify.propTypes = {
  characteristic: PropTypes.object.isRequired,
  backAction: PropTypes.func,
};

export default CharacteristicNotify;
