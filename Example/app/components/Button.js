import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

const Button = React.createClass({
  propTypes: {
    onPress: PropTypes.func,
    style: View.propTypes.style,
    children: PropTypes.string,
  },

  getInitialState() {
    return {
      active: false,
    };
  },

  onHighlight() {
    this.setState({active: true});
  },

  onUnhighlight() {
    this.setState({active: false});
  },

  render() {
    return (
      <ButtonRender
        {...this.props}
        isActive={this.state.active}
        onHighlight={this.onHighlight}
        onUnhighlight={this.onUnhighlight}
        />
    );
  }
});

const ButtonRender = ({onHighlight, onUnhighlight,  onPress, isActive, children, style}) => {
  const colorStyle = {
    backgroundColor: isActive ? 'grey' : '#00AFEE',
  };

  return (
    <TouchableHighlight
      onHideUnderlay={onUnhighlight}
      onPress={onPress}
      onShowUnderlay={onHighlight}
      style={[styles.button, colorStyle, style]}
      underlayColor="#a9d9d4">
        <Text style={[styles.buttonText, colorStyle]}>{children}</Text>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 18,
    margin: 5,
    textAlign: 'center',
    color: 'white',
  },
});


ButtonRender.propTypes = {
  onHighlight: PropTypes.func,
  onUnhighlight: PropTypes.func,
  onPress: PropTypes.func,
  isActive: PropTypes.bool,
  children: PropTypes.node,
  style: View.propTypes.style,
};

export default Button;

