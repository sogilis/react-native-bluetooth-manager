import * as types from '../actions/DiscoveryActionTypes';
import _ from 'lodash';

const initialState = {
  devicesDiscovered: [],
  discoveryStatus: "",
};

export default function discovery(state = initialState, action) {
  switch (action.type) {
    case types.DEVICEDISCOVERED:
      return {
        ...state,
        devicesDiscovered: _.uniq([...state.devicesDiscovered, action.device]),
      };
    case types.DISCOVERYSTATUSCHANGE:
      return {
        ...state,
        discoveryStatus: action.status,
      };
    case types.RESETDEVICES:
      return {
        ...state,
        devicesDiscovered: [],
      };
    default:
      return state;
  }
}
