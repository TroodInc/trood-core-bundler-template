import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { enableBatching } from 'redux-batched-actions'
import reduceReducers from 'reduce-reducers'

import { api, forms } from 'redux-restify'

import modals from '$trood/modals'

import { STATE_REPLACE_ACTION } from '$trood/mainConstants'


const getRootReducer = (history) => {
  return enableBatching(reduceReducers(
    (state, action) => {
      if (action.type === STATE_REPLACE_ACTION) {
        return {
          ...action.state,
        }
      }
      return state
    },
    combineReducers({
      router: connectRouter(history),
      [api.constants.NAME]: api.getRestifyApiReducer(),
      [forms.constants.NAME]: forms.getRestifyFormReducer(),
      [modals.constants.NAME]: modals.reducer,
    }),
  ))
}

export default getRootReducer
