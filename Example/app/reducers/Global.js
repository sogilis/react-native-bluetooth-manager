import * as types from '../actions/GlobalActionTypes';

const initialState = {
  error: null
};

export default function discovery(state = initialState, action) {
  switch (action.type) {
    case types.APPLICATIONERROR:
      return {
        ...state,
        error: action.error,
      };
    case types.RESETERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}
