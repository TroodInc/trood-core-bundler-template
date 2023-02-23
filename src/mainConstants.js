import { snakeToCamel } from './helpers/namingNotation'


export const INIT_ACTION = '@@INIT'
export const ROUTER_LOCATION_CHANGE_ACTION = '@@router/LOCATION_CHANGE'
export const STATE_REPLACE_ACTION = 'STATE_REPLACE'

export const EMAIL_REGEXP = /[^@]+@[^@]+\.[^@]+|^$/
export const UUID_REGEXP = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
export const WHOLE_STRING_UUID_REGEXP = new RegExp(`^${UUID_REGEXP.source}$`)
export const DEFAULT_PHONE_LENGTH = 10

export const KEY_CODES = {
  backspace: 'Backspace',
  delete: 'Delete',
  enter: 'Enter',
  esc: 'Escape',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  arrowDown: 'ArrowDown',
  arrowUp: 'ArrowUp',
  end: 'End',
  home: 'Home',
  pageDown: 'PageDown',
  pageUp: 'PageUp',
}

export const NAVIGATION_KEYS = [
  KEY_CODES.arrowDown,
  KEY_CODES.arrowLeft,
  KEY_CODES.arrowRight,
  KEY_CODES.arrowUp,
  KEY_CODES.end,
  KEY_CODES.home,
  KEY_CODES.pageDown,
  KEY_CODES.pageUp,
]

export const SEARCH_DEBOUNCE = 500
export const DISPATCH_DEBOUNCE = 50

export const DEFAULT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SZ'
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

export const DEFAULT_SCROLLING_CONTAINER_ID = 'troodAppScroll'

export const ABAC_FRONTEND_DOMAIN = snakeToCamel(process.env.ABAC_FRONTEND_DOMAIN || 'FRONTEND')
export const ABAC_CUSTODIAN_DOMAIN = snakeToCamel(process.env.ABAC_FRONTEND_DOMAIN || 'CUSTODIAN')
