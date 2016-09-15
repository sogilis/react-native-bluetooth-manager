import * as types from './GlobalActionTypes';

export function applicationError(error) {
  return {
    type: types.APPLICATIONERROR,
    error: error,
  };
}

export function resetApplicationError() {
  return {
    type: types.RESETERROR,
  };
}
