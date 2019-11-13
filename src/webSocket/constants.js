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

export const WS_URL = 'ws://legal.dev.trood.ru/events/ws/'
export const WS_PROTOCOL = 'WS'
export const WS_PING_MESSAGE_TEXT = 'ping'
export const WS_PING_MESSAGE_INTERVAL = 25000

export const WS_DOMAIN_CUSTODIAN = 'CUSTODIAN'

export const WS_DOMAINS = {
  [snakeToCamel(WS_DOMAIN_CUSTODIAN)]: WS_DOMAIN_CUSTODIAN,
}

export const WS_ACTION_SUBSCRIBE = 'SUBSCRIBE'

export const WS_ACTIONS = {
  [snakeToCamel(WS_ACTION_SUBSCRIBE)]: WS_ACTION_SUBSCRIBE,
}

export const WS_CLOSE_OK_CODE = 1000
export const WS_CLOSE_OK_TEXT = 'WS usage has been canceled by client side'
// https://developer.mozilla.org/ru/docs/Web/API/WebSocket#Ready_state_constants
export const WS_OPEN_STATE = 1
