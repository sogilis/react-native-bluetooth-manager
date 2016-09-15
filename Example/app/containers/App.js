import React from 'react';
import Routes from '../lib/Routes';
import { createStore, applyMiddleware, combineReducers, compose, } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import * as reducers from '../reducers';

const reducer = combineReducers(reducers);

const store = createStore(
  reducer, {},
  compose(
    applyMiddleware(thunk)
  )
);

if (module.hot) {
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers/index');
    const reducer = combineReducers(nextRootReducer);
    store.replaceReducer(reducer);
  });
}

const App = () => (
  <Provider store={store}>
    <Routes />
  </Provider>
);

export default App;
