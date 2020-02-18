import { snakeToCamel } from '$trood/helpers/namingNotation'

export const NAME = 'webSocket'

export const WS_MESSAGE_TYPE_UPDATE = 'update'
export const WS_MESSAGE_TYPE_CREATE = 'create'
export const WS_MESSAGE_TYPE_DELETE = 'delete'
export const WS_MESSAGE_TYPE_UI = 'ui_message'

export const WS_MESSAGE_TYPES = {
  [snakeToCamel(WS_MESSAGE_TYPE_UPDATE)]: WS_MESSAGE_TYPE_UPDATE,
  [snakeToCamel(WS_MESSAGE_TYPE_CREATE)]: WS_MESSAGE_TYPE_CREATE,
  [snakeToCamel(WS_MESSAGE_TYPE_DELETE)]: WS_MESSAGE_TYPE_DELETE,
  [snakeToCamel(WS_MESSAGE_TYPE_UI)]: WS_MESSAGE_TYPE_UI,
}

export const WS_URL =
  process.env.WEBSOCKET_API_HOST ||
  (typeof window !== 'undefined' ? `${window.location.protocol.replace('http', 'ws')}//${window.location.host}` : '')
export const WS_PROTOCOL = 'WS'
export const WS_PING_MESSAGE_TEXT = 'ping'
export const WS_PING_MESSAGE_INTERVAL = 29000

export const WS_DEBOUNCE_INTERVAL = 10000

export const WS_DOMAIN_CUSTODIAN = 'CUSTODIAN'

export const WS_DOMAINS = {
  [snakeToCamel(WS_DOMAIN_CUSTODIAN)]: WS_DOMAIN_CUSTODIAN,
}

export const WS_ACTION_SUBSCRIBE = 'SUBSCRIBE'
export const WS_ACTION_UNSUBSCRIBE = 'UNSUBSCRIBE'

export const WS_ACTIONS = {
  [snakeToCamel(WS_ACTION_SUBSCRIBE)]: WS_ACTION_SUBSCRIBE,
  [snakeToCamel(WS_ACTION_UNSUBSCRIBE)]: WS_ACTION_UNSUBSCRIBE,
}

export const WS_CLOSE_ARGS = [1000, 'WS usage has been canceled by client side']
// https://developer.mozilla.org/ru/docs/Web/API/WebSocket#Ready_state_constants

export const WS_STATES = {
  connecting:	0,
  open: 1,
  closing: 2,
  closed:	3,
}
