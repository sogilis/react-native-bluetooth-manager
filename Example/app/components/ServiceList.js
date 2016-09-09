import React, { PropTypes } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ListView,
  RecyclerViewBackedScrollView,
  View,
} from 'react-native';

const makeDataSource = services => {
  var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  return ds.cloneWithRows(services);
};

const renderServiceRow = service => {
  if (!service) return <View />;

  return (
    <TouchableOpacity
      onPress={() => {}}
      key={service.id}
      style={styles.textHolder}>
    <Text style={styles.serviceText}>{service.id}</Text>
  </TouchableOpacity>
  );
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

const ServiceList = ({services}) => (
  <ListView
    dataSource={makeDataSource(services)}
    renderRow={renderServiceRow}
    renderScrollComponent={scrollComponent}
    renderSeparator={renderSeparator}
    enableEmptySections={true}>
  </ListView>
);

ServiceList.propTypes = {
  services: PropTypes.array.isRequired,
};

var styles = StyleSheet.create({
  serviceText: {
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

export default ServiceList;
