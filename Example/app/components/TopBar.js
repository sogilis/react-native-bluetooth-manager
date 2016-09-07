import React, { PropTypes } from 'react';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const renderBackIfNeeded = backAction => {
  if (!backAction) return <View />;

  return (
    <View>
      <TouchableOpacity onPress={backAction}>
        <Text style={styles.backStyle}>{"<"}</Text>
      </TouchableOpacity>
    </View>);
};

const renderDummyIfNeeded = needed => {
  if (!needed) return null;
  return <View />;
};

const TopBar = ({headerText, backAction}) => (
  <View style={styles.container}>
    {renderBackIfNeeded(backAction)}
    <Text style={styles.headerText}>{headerText}</Text>
    {renderDummyIfNeeded(backAction != null)}
    <View />
  </View>
);

TopBar.propTypes = {
  text: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#00AFEE',
    marginBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
  },
  backStyle: {
    fontSize: 30,
    color: 'white',
    marginLeft: 8,
  },
});

TopBar.propTypes = {
  headerText: PropTypes.string.isRequired,
  backAction: PropTypes.func,
};

export default TopBar;
