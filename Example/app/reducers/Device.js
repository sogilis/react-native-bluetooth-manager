import * as types from '../actions/DeviceActionTypes';

const initialState = {
  services: [],
  disconnectionHandler: () => {},
  isConnected: false,
  connectionInProgress: false,
};

export default function device(state = initialState, action) {
  switch (action.type) {
    case types.SERVICEDISCOVERED:
      return {
        ...state,
        services: [...state.services, action.service],
      };
    case types.DISCONNECTIONHANDLER:
      return {
        ...state,
        disconnectionHandler: action.handler,
      };
    case types.CONNECTIONSTATUS:
      return {
        ...state,
        isConnected: action.isConnected,
      };
    case types.CONNECTIONINPROGRESS:
      return {
        ...state,
        connectionInProgress: action.inProgress,
      };
    case types.RESETSERVICES:
      return {
        ...state,
        services: [],
      };
    default:
      return state;
  }
}
