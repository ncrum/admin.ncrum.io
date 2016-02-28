import '../core/util/util'
import React from 'react'
import ReactDOM from 'react-dom'
import thunkMiddleware from 'redux-thunk'
import multiMiddleware from 'redux-multi'
import { createStore, combineReducers, applyMiddleware, compose} from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import reducers from '../core/reducers'
import getRoutes from '../core/root'

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routerReducer
}))

const createStoreWithMiddleware = compose(
  applyMiddleware(routerMiddleware(browserHistory), thunkMiddleware, multiMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

const store = createStoreWithMiddleware(reducer, window.__INITIAL_STATE__);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      {getRoutes()}
    </Router>
  </Provider>,
  document.getElementById('mount')
)
