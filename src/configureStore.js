import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'connected-react-router'

import thunk from 'redux-thunk'

import getRootReducer from './reducer'


const configureStore = (history, initialState) => {
  const middlewareList = [
    routerMiddleware(history),
    thunk,
  ]

  const middlewares = applyMiddleware(...middlewareList)
  const devTool = window.devToolsExtension
  const store = createStore(
    getRootReducer(history),
    initialState,
    compose(
      middlewares,
      devTool ? devTool() : f => f,
    ),
  )

  if (module.hot) {
    module.hot.accept('./reducer', () => {
      const nextRootReducer = require('./reducer').default
      store.replaceReducer(nextRootReducer(history))
    })
  }

  return store
}

export default configureStore
