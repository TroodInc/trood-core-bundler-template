import { ACTIONS_TYPES } from './constants'

// import { ROUTER_LOCATION_CHANGE_ACTION } from '$trood/mainConstants'


export const init = {
  $modalsCounter: 0,
  $minimizedModalsCounter: 0,
}

const modals = (state = init, action) => {
  switch (action.type) {
    case ACTIONS_TYPES.modals.showModal: {
      if (!action.open && !action.name) return init
      const $modalsCounter = action.open ? state.$modalsCounter + 1 : state.$modalsCounter
      return {
        ...state,
        $modalsCounter,
        [action.name]: action.open ? {
          open: action.open,
          params: action.params,
          order: state.$modalsCounter,
          mode: action.mode || 'normal',
        } : action.open,
      }
    }
    case ACTIONS_TYPES.modals.toggleMinimize: {
      if (!action.name) return init
      const modal = state[action.name]
      let $minimizedModalsCounter = state.$minimizedModalsCounter
      if (!modal) return init
      let { mode } = modal
      const isNormal = mode === 'normal'
      mode = isNormal ? 'minimized' : 'normal'
      $minimizedModalsCounter += isNormal ? 1 : (-1)
      return {
        ...state,
        $minimizedModalsCounter,
        [action.name]: {
          ...modal,
          mode,

          order: $minimizedModalsCounter,
        },
      }
    }
    /*
    case ROUTER_LOCATION_CHANGE_ACTION:
      if (action.payload.action === 'REPLACE') return state
      return init
     */
    default:
      return state
  }
}

export default modals
