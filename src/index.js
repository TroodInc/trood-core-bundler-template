import React from 'react'
import ReactDOM from 'react-dom'
import './styles/reset.css'
import './styles/global.css'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { getStore } from 'trood-restify'
import { BrowserRouter as Router } from 'react-router-dom'
import StoreContext from 'core/StoreContext'
import PageStoreContext from 'core/PageStoreContext'
import { Page } from 'core/pageStore'
import AuthStoreContext from 'core/AuthStoreContext'
import { getAuthStore, getToken } from 'core/authStore'

const pageStore = Page.create({})
//TODO remove after debug
window.pageStore = pageStore
const meta = {
  custodian: {
    apiHost: 'http://legal.stage.trood.ru/',
    entityDataAddress: 'data',
    arrayDataAddress: 'data',
    arrayCountAddress: 'total_count',
    genericTypeAddress: '_object',
    paginationTemplate: 'q=limit({offset},{pageSize})',
    objects: {
      client: {
        pk: 'id',
        endpoint: '/custodian/data/client',
        fields: {
          id: 'number',
          name: 'string',
          client_type: 'fk(client_type)',
          client_active_status: 'fk(client_active_status)',
          responsible: 'fk(employee)',
        },
      },
      employee: {
        pk: 'id',
        endpoint: '/custodian/data/employee',
        fields: {
          id: 'number',
          name: 'string',
          email: 'string',
        },
      },
      task: {
        pk: 'id',
        endpoint: '/custodian/data/task',
        fields: {
          id: 'number',
          name: 'string',
        },
      },
      activity: {
        pk: 'id',
        endpoint: '/custodian/data/activity',
        fields: {
          id: 'number',
          name: 'string',
        },
      },
      client_type:{
        pk: 'id',
        endpoint: '/custodian/data/client_type',
        fields: {
          id: 'number',
          name: 'string',
          code: 'string',
        },
      },
      client_active_status:{
        pk: 'id',
        endpoint: '/custodian/data/client_active_status',
        fields: {
          id: 'number',
          name: 'string',
          code: 'string',
        },
      },
    },
  },
}
const store = getStore(meta, getToken)
const authStore = getAuthStore(store)

ReactDOM.render(
  <React.StrictMode>
    <StoreContext.Provider value={store}>
      <PageStoreContext.Provider value={pageStore}>
        <AuthStoreContext.Provider value={authStore}>
          <Router>
            <App />
          </Router>
        </AuthStoreContext.Provider>
      </PageStoreContext.Provider>
    </StoreContext.Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
