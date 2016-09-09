var state = { };

const setAppState = newState => {
  console.log("Pre merge app state is", state, newState);
  state = { ...state, ...newState };
  console.log("App state is", state);
};

const getAppState = () => {
  return state;
};

export {
  getAppState,
  setAppState,
};
