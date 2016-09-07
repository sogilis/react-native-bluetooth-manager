import React, { PropTypes } from 'react';

import { StyleSheet, View, Text } from 'react-native';

const TopBar = ({headerText}) => (
  <View style={styles.container}>
    <Text style={styles.headerText}>{headerText}</Text>
  </View>
);

TopBar.propTypes = {
  text: PropTypes.string.isRequired,
};

var styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#00AFEE',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
  },
});

TopBar.propTypes = {
  headerText: PropTypes.string.isRequired,
};

export default TopBar;
