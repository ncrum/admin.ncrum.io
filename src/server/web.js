import '../core/util/util'
import Router from 'koa-router'
import wreq     from 'koa-watchify'
import watchify from 'watchify'
import browserify from 'browserify'
import serve from 'koa-static'
import path     from 'path'

import React from 'react'
import {renderToString} from 'react-dom/server'
import {createMemoryHistory, match, RouterContext} from 'react-router'
import thunkMiddleware from 'redux-thunk'
import multiMiddleware from 'redux-multi'
import { createStore, combineReducers, applyMiddleware, compose} from 'redux'
import { Provider } from 'react-redux'
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import reducers from '../core/reducers'
import getRoutes from '../core/root'

export default function(app) {
  const router = new Router()

  if ('production' != process.env.NODE_ENV) {
    var bundle = browserify({
      entries: [path.join(__dirname, '../site/index.js')],
      fullPaths: true,
      packageCache: {},
      cache: {},
      transform: [['babelify', { presets: ['es2015', 'react', 'stage-2']}]]
    })
    bundle = watchify(bundle)
    router.get('/bundle.js', wreq(bundle))
  } else {
    app.use(serve(path.join(__dirname, '../site')))
  }

  function renderHtml(html, initialState) {
    return new Promise(function(resolve, reject) {
      resolve(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>admin.ncrum.io</title>
            <link rel="stylesheet" type="text/css" href="/style.css">
            <link rel="stylesheet" type="text/css" href="/darkula.css">
          </head>
          <body>
            <div id="mount">${html}</div>
            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
            </script>
            <script src="/bundle.js"></script>
          </body>
        </html>
      `)
    })
  }

  router.get('/*', function*() {
    let props;

    let reducer = combineReducers(Object.assign({}, reducers, {
      routing: routerReducer
    }));

    // Sync dispatched route actions to the history
    let memoryHistory = createMemoryHistory(this.path)
    let createStoreWithMiddleware = compose(
      applyMiddleware(routerMiddleware(memoryHistory), thunkMiddleware, multiMiddleware)
    )(createStore)

    let store = createStoreWithMiddleware(reducer)

    let history = syncHistoryWithStore(memoryHistory, store)

    match({ history, routes: getRoutes(), location: this.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        this.throw(error.message, 500);
      } else if (redirectLocation) {
        this.redirect(redirectLocation.pathname + redirectLocation.search)
      } else if (renderProps) {
        props = renderProps;
      } else {
        this.throw("Not Found", 404);
      }
    })

    function fetchReduxStatePromise() {
      let { query, params } = props;
      let promises = [];

      let i = 0;
      for (; i < props.components.length; i++) {
        let comp = props.components[i].WrappedComponent
        let promise = comp && comp.fetchData ?
          comp.fetchData({ query, params, store, history }) :
          Promise.resolve();

        promises.push(promise);
      }

      return Promise.all(promises);
    }

    if (props) {
      try {
        yield fetchReduxStatePromise()
      } catch (err) {
        this.throw(err, 500)
      }

      let html = renderToString(
        <Provider store={store}>
          <RouterContext {...props}/>
        </Provider>
      );

      this.body = yield renderHtml(html, store.getState())
    }
  })

  app.use(router.middleware())
}
