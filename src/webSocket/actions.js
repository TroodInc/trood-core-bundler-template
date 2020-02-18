import uuidV4 from 'uuid/v4'
import debounce from 'lodash/debounce'

import { api } from 'redux-restify'

import auth from '$trood/auth'
import { getToken } from '$trood/storage'
import { objectToCamel, snakeToCamel } from '$trood/helpers/namingNotation'

import {
  WS_URL,
  WS_PROTOCOL,
  WS_STATES,

  WS_MESSAGE_TYPES,
  WS_DOMAINS,
  WS_ACTIONS,

  WS_PING_MESSAGE_TEXT,
  WS_PING_MESSAGE_INTERVAL,
  WS_DEBOUNCE_INTERVAL,

  WS_CLOSE_ARGS,
} from './constants'


let WS_ON_MESSAGE_CALLBACKS = {}
let WS_SUBSCRIBES = {}
let WS_MESSAGES = []

let socket = null

const onMessage = event => dispatch => {
  try {
    const dataParsed = objectToCamel(JSON.parse(event.data))

    if (Array.isArray(dataParsed) && dataParsed.length > 0) {
      dataParsed.forEach(item => {
        const { domain, messageType, type, data } = item
        if (data && data.id && domain === WS_DOMAINS.custodian) {
          const entityName = snakeToCamel(type)

          switch (messageType) {
            case WS_MESSAGE_TYPES.create:
            case WS_MESSAGE_TYPES.update:
              dispatch(api.actions.entityManager[entityName].updateById(data.id, data))
              break
            case WS_MESSAGE_TYPES.delete:
              dispatch(api.actions.entityManager[entityName].updateById(data.id, { $deleted: true }))
              break
            default:
          }
        }

        Object.values(WS_ON_MESSAGE_CALLBACKS).forEach(callback => {
          if (typeof callback === 'function') callback(item)
        })
      })
    }
  } catch (e) {
    console.warn('Failed to parse WS message data', e, event.data)
  }
}

const sendMessages = () => {
  if (socket && socket.readyState === WS_STATES.open) {
    WS_MESSAGES.forEach((data, i) => {
      if (data) socket.send(data)
      WS_MESSAGES[i] = null
    })
    WS_MESSAGES = WS_MESSAGES.filter(v => v)
  }
}
const debounceSendMessages = debounce(sendMessages, WS_DEBOUNCE_INTERVAL)

const pushMessage = message => {
  WS_MESSAGES.push(message)
  debounceSendMessages()
}

const initAction = dispatch => {
  const token = getToken()

  if (token && !socket) {
    const ws = new WebSocket(`${WS_URL}?token=${token}`)
    let pingInterval

    ws.onopen = () => {
      pingInterval = setInterval(
        () => {
          if (!WS_MESSAGES.length) pushMessage(WS_PING_MESSAGE_TEXT)
        },
        WS_PING_MESSAGE_INTERVAL,
      )
      debounceSendMessages()
      socket = ws
    }

    ws.onclose = () => {
      clearInterval(pingInterval)
      socket = null
    }

    ws.onmessage = event => dispatch(onMessage(event))

    ws.onerror = e => console.warn('An error in socket.onerror appeared', e)
  }
}
const debounceInit = debounce(initAction, WS_DEBOUNCE_INTERVAL)
const init = () => dispatch => debounceInit(dispatch)

export const close = () => () => {
  if (socket && socket.readyState === WS_STATES.open) {
    socket.close(...WS_CLOSE_ARGS)
  }
}

export const subscribe = ({
  domain = WS_DOMAINS.custodian,
  data = [],
  onMessageCallback,
} = {}) => (dispatch, getState) => {
  dispatch(init())

  const authData = auth.selectors.getAuthData(getState())
  const subscribeUuid = uuidV4()
  const config = {
    subscribeUuid,
    protocol: WS_PROTOCOL,
    recipients: [authData.login],
    data: {
      domain,
      action: WS_ACTIONS.subscribe,
      data: [...data],
    },
  }

  try {
    const data = JSON.stringify(config)
    pushMessage(data)
    WS_SUBSCRIBES[subscribeUuid] = config
    if (onMessageCallback) {
      WS_ON_MESSAGE_CALLBACKS[subscribeUuid] = onMessageCallback
    }
    return subscribeUuid
  } catch (e) {
    console.warn('WS Data to JSON failed', e, config)
  }
  return undefined
}

export const unSubscribe = subscribeUuid => () => {
  const subscribe = WS_SUBSCRIBES[subscribeUuid]
  if (subscribe && socket && socket.readyState === WS_STATES.open) {
    try {
      const data = {
        ...subscribe,
        data: {
          ...subscribe.data,
          action: WS_ACTIONS.unsubscribe,
        },
      }
      pushMessage(JSON.stringify(data))
    } catch (e) {
      console.warn('WS Data to JSON failed', e, subscribe)
    }
  } else {
    WS_MESSAGES = WS_MESSAGES.filter(v => v.indexOf(subscribeUuid) < 0)
  }
  delete WS_SUBSCRIBES[subscribeUuid]
  delete WS_ON_MESSAGE_CALLBACKS[subscribeUuid]
}
