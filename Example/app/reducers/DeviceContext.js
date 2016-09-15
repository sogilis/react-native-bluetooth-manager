import * as types from '../actions/DeviceContextActionTypes';

const initialState = {
  device: null,
};

export default function deviceContext(state = initialState, action) {
  switch (action.type) {
    case types.SETDEVICE:
      return {
        ...state,
        device: action.device,
      };
    default:
      return state;
  }
}
