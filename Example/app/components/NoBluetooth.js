import React, { PropTypes } from 'react';

import TopBar from '../components/TopBar';
import { StyleSheet, View, Text } from 'react-native';

const NoBluetooth = ({state}) => (
  <View style={styles.mainContainer}>
    <TopBar
      headerText={"Bluetooth status error"}
      backAction={ this.goBack } />
    <Text>Bluetooth is not valid. Current status: {state}</Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
  },
});

NoBluetooth.propTypes = {
  state: PropTypes.string.isRequired,
};

export default NoBluetooth;
