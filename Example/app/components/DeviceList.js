import React, { PropTypes } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ListView,
  RecyclerViewBackedScrollView,
  View,
} from 'react-native';

const makeDataSource = devices => {
  var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  return ds.cloneWithRows(devices);
};

const renderDeviceRow = selectDevice => {
  return device => {
    return (
      <TouchableOpacity
        onPress={() => selectDevice(device)}
        key={device.address}
        style={styles.textHolder}>
      <Text style={styles.deviceText}>{device.name}</Text>
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

const DeviceList = ({devices, selectDevice}) => (
  <ListView
    dataSource={makeDataSource(devices)}
    renderRow={renderDeviceRow(selectDevice)}
    renderScrollComponent={scrollComponent}
    renderSeparator={renderSeparator}
    enableEmptySections={true}>
  </ListView>
);

DeviceList.propTypes = {
  devices: PropTypes.array.isRequired,
  selectDevice: PropTypes.func.isRequired,
};

var styles = StyleSheet.create({
  deviceText: {
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

export default DeviceList;
