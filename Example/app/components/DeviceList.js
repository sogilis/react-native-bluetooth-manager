import React, { Component, PropTypes } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native';
import Bluetooth from 'react-native-bluetooth';

class DeviceList extends Component {
  render() {
    var deviceNodes = this.props.devices.map(device => (
      <TouchableOpacity onPress={() => this.props.selectDevice(device)}
                        key={device.address}>
        <Text>{device.name}</Text>
      </TouchableOpacity>
    ))
    return (
      <ScrollView showsVerticalScrollIndicator={true}>
        {deviceNodes}
      </ScrollView>
    );
  }
}

export default DeviceList;
