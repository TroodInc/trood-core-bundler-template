import 'babel-polyfill'
import './styles/reset.css'
import './styles/fonts.css'
import './styles/global.css'

import React from 'react'
import ReactDOM from 'react-dom'

import { api, setRestifyStore } from 'redux-restify'

import moment from 'moment'
import 'moment/locale/ru'

import history from './history'

import getStore from './store'
import Root from './Root'
// import { stateKey, readStorage } from './storage'
import addStorageWriter from './storeSerializer'
// import { STATE_REPLACE_ACTION } from './mainConstants'

import configRestify from './configRestify'

import registerServiceWorker from './registerServiceWorker'


if (!process.env.TEST) {
  configRestify()
  const store = getStore(history)
  setRestifyStore(store)
  addStorageWriter(store.getState)

  moment.locale('ru')

  store.dispatch({
    type: api.constants.ACTIONS_TYPES.loadsManager.reset,
  })

  const getWrappedRoot = (CurrentRoot) => {
    return (
      <CurrentRoot {...{ store, history }} />
    )
  }

  const container = document.getElementById('root')
  ReactDOM.render(
    getWrappedRoot(Root),
    container,
  )
  registerServiceWorker()

  /*
  window.addEventListener('storage', e => {
    if (e.key === stateKey) {
      store.dispatch({
        type: STATE_REPLACE_ACTION,
        state: readStorage(),
      })
    }
  })
  */

  // Remove loader
  setTimeout(() => {
    document.getElementById('loader').remove()
    document.getElementById('loader-style').remove()
  }, 700)
}
