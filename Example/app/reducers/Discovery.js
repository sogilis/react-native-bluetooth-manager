import * as types from '../actions/DiscoveryActionTypes';

const initialState = {
  devicesDiscovered: [],
  discoveryStatus: "",
};

export default function discovery(state = initialState, action) {
  switch (action.type) {
    case types.DEVICEDISCOVERED:
      return {
        ...state,
        devicesDiscovered: [...state.devicesDiscovered, action.device]
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
