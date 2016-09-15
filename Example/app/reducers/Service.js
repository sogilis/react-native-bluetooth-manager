import * as types from '../actions/ServiceActionTypes';

const initialState = {
  characteristics: [],
};

export default function service(state = initialState, action) {
  switch (action.type) {
    case types.CHARACTERISTICDISCOVERED:
      return {
        ...state,
        characteristics: [...state.characteristics, action.characteristic],
      };
    case types.RESETCHARACTERISTICS:
      return {
        ...state,
        characteristics: [],
      };
    default:
      return state;
  }
}
