import { api } from 'redux-restify'

import { getToken } from '$trood/storage'
import { objectToCamel, snakeToCamel } from '$trood/helpers/namingNotation'

import {
  WS_URL,
  WS_PROTOCOL,
  WS_OPEN_STATE,

  WS_MESSAGE_TYPES,
  WS_DOMAINS,
  WS_ACTIONS,

  WS_PING_MESSAGE_TEXT,
  WS_PING_MESSAGE_INTERVAL,

  WS_CLOSE_OK_CODE,
  WS_CLOSE_OK_TEXT,
} from './constants'


let socket = null
let pingInterval = null

const onMessage = (event, externalOnMessage) => dispatch => {
  try {
    const dataParsed = objectToCamel(JSON.parse(event.data))

    if (Array.isArray(dataParsed) && dataParsed.length > 0) {
      dataParsed.forEach(item => {
        if (item.data && item.domain === WS_DOMAINS.custodian) {
          const { messageType, type, data } = item
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

        if (typeof externalOnMessage === 'function') externalOnMessage(item)
      })
    }
  } catch (e) {
    console.warn('Failed to parse WS message data', e, event.data)
  }
}

const sendData = data => {
  if (socket) {
    try {
      const dataJSON = JSON.stringify(data)
      socket.send(dataJSON)
    } catch (e) {
      console.warn('WS Data to JSON failed', e, data)
    }
  }
}

export const init = (externalOnMessage, data) => dispatch => {
  const token = getToken()

  if (token && !socket) {
    socket = new WebSocket(`${WS_URL}?token=${token}`)
    socket.onmessage = event => dispatch(onMessage(event, externalOnMessage))
    socket.onopen = () => {
      pingInterval = setInterval(
        () => sendData(WS_PING_MESSAGE_TEXT),
        WS_PING_MESSAGE_INTERVAL,
      )
      sendData(data)
    }
    socket.onclose = () => clearInterval(pingInterval)
    socket.onerror = e => console.warn('An error in socket.onerror appeared', e)
  }
}

export const close = () => () => {
  if (socket && socket.readyState === WS_OPEN_STATE) socket.close(WS_CLOSE_OK_CODE, WS_CLOSE_OK_TEXT)
}

export const subscribe = (params = {}) => dispatch => {
  const {
    recipients = [],
    domain = WS_DOMAINS.custodian,
    data = [],

    externalOnMessage,
  } = params

  const config = {
    protocol: WS_PROTOCOL,
    recipients: [...recipients],
    data: {
      domain,
      action: WS_ACTIONS.subscribe,
      data: [...data],
    },
  }

  dispatch(init(externalOnMessage, config))
}
