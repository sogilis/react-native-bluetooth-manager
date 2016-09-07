import React from 'react';
import { Text } from 'react-native';
import Routes from '../lib/Routes';
import Bluetooth from 'react-native-bluetooth';

const App = React.createClass({
  getInitialState() {
    return {
      bluetoothState: "unknown",
    };
  },

  componentWillMount() {
    this.unsubscribe = Bluetooth.didChangeState(newState => {
      this.setState({bluetoothState: newState});
    });
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  render() {
    if (this.state.bluetoothState == "enabled") {
      return (
        <Routes />
      );
    } else {
      return (
        <Text>Bluetooth state: {this.state.bluetoothState}</Text>
      );
    }
  },
});

export default App;
