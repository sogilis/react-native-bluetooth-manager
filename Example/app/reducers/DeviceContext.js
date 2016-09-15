import * as types from '../actions/DeviceContextActionTypes';

const initialState = {
  device: null,
  service: null,
  characteristic: null,
};

export default function deviceContext(state = initialState, action) {
  switch (action.type) {
    case types.SETDEVICE:
      return {
        ...state,
        device: action.device,
      };
    case types.SETSERVICE:
      return {
        ...state,
        device: action.service,
      };
    case types.SETCHARACTERISTIC:
      return {
        ...state,
        characteristic: action.characteristic,
      };
    default:
      return state;
  }
}
