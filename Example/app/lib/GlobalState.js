var state = { };

const setAppState = newState => {
  state = { ...state, ...newState };
};

const getAppState = () => {
  return state;
};

export {
  getAppState,
  setAppState,
};
