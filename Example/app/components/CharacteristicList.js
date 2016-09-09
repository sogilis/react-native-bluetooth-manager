import React, { PropTypes } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ListView,
  RecyclerViewBackedScrollView,
  View,
} from 'react-native';

const makeDataSource = characteristics => {
  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  return ds.cloneWithRows(characteristics);
};

const renderCharacteristicRow = selectCharacteristic => {
  return characteristic => {
    if (!characteristic) return <View />;

    return (
      <TouchableOpacity
        onPress={() => selectCharacteristic(characteristic)}
        key={characteristic.id}
        style={styles.textHolder}>
      <Text style={styles.characteristicText}>{characteristic.id}</Text>
    </TouchableOpacity>
    );
  };
};

const renderSeparator = (sectionID, rowID) => {
  return (
    <View
      key={`${sectionID}-${rowID}`}
      style={styles.seperator}
    />
  );
};

const scrollComponent = props => {
  return (<RecyclerViewBackedScrollView {...props} />);
};

const CharacteristicList = ({characteristics, selectCharacteristic}) => (
  <ListView
    dataSource={makeDataSource(characteristics)}
    renderRow={renderCharacteristicRow(selectCharacteristic)}
    renderScrollComponent={scrollComponent}
    renderSeparator={renderSeparator}
    enableEmptySections={true}>
  </ListView>
);

CharacteristicList.propTypes = {
  characteristics: PropTypes.array.isRequired,
  selectCharacteristic: PropTypes.func.isRequired,
};

var styles = StyleSheet.create({
  characteristicText: {
    fontSize: 18,
    color: 'grey',
  },
  seperator: {
    height: 2,
    backgroundColor: '#CCCCCC',
  },
  textHolder: {
    paddingLeft: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
});

export default CharacteristicList;
