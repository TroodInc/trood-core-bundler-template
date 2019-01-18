import flow from 'lodash/flow'

import { RESTIFY_CONFIG, api, setRestifyStore } from 'redux-restify'

import createHistory from 'history/createBrowserHistory'
import { stringify, parse } from 'qs'
import qhistory from 'qhistory'

import configRestify from '../configRestify'
import getStore from '../store'

import config from '../config'

import { STATE_REPLACE_ACTION } from '$trood/mainConstants'


const LIBRARY_FOR_TEST = 'HandymanBusinessObjects'
const currentLibraryApiName = flow(
  array => array.find(library => library.name === LIBRARY_FOR_TEST),
  library => library.name + library.endpoint,
)(config.businessObjects)

export const history = qhistory(
  createHistory(),
  stringify,
  parse,
)
configRestify()
export const store = getStore(history)
setRestifyStore(store)

export const registeredBusinessObjects = Object.keys(RESTIFY_CONFIG.registeredModels).filter(key => {
  return RESTIFY_CONFIG.registeredModels[key].apiName === currentLibraryApiName
})

export const beforeEachFunc = () => {
  store.dispatch({
    type: STATE_REPLACE_ACTION,
  })
}
