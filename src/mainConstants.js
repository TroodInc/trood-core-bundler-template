import { defineMessages } from 'react-intl'


export const INIT_ACTION = '@@INIT'
export const ROUTER_LOCATION_CHANGE_ACTION = '@@router/LOCATION_CHANGE'
export const STATE_REPLACE_ACTION = 'STATE_REPLACE'

export const EMAIL_REGEXP = /[^@]+@[^@]+\.[^@]+|^$/
export const UUID_REGEXP = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
export const WHOLE_STRING_UUID_REGEXP = new RegExp(`^${UUID_REGEXP.source}$`)
export const DEFAULT_PHONE_LENGTH = 10

export const KEY_CODES = {
  backspace: 8,
  enter: 13,
  esc: 27,
  arrowLeft: 37,
  arrowRight: 39,
  delete: 46,
}

export const SEARCH_DEBOUNCE = 500
export const DISPATCH_DEBOUNCE = 50

export const DEFAULT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SZ'
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

export const DEFAULT_SCROLLING_CONTAINER_ID = 'troodAppScroll'

export const messages = defineMessages({
  error: {
    id: '$trood.error',
    defaultMessage: 'Error!',
  },
  serverError: {
    id: '$trood.server_error',
    defaultMessage: 'Server error! Try to refresh page!',
  },
  requiredField: {
    id: '$trood.required_field',
    defaultMessage: 'This field is required!',
  },
  outOfRangeValue: {
    id: '$trood.out_of_range_value',
    defaultMessage: 'Value is out of range!',
  },
  incorrectFormat: {
    id: '$trood.incorrect_format',
    defaultMessage: 'Value is incorrect!',
  },
  maxLength: {
    id: '$trood.max_length',
    defaultMessage: 'Max length: {number}',
  },
  minLength: {
    id: '$trood.min_length',
    defaultMessage: 'Min length: {number}',
  },
  emptyMessage: {
    id: '$trood.empty_message',
    defaultMessage: 'Empty',
  },
  logout: {
    id: '$trood.logout',
    defaultMessage: 'Logout',
  },
  edit: {
    id: '$trood.edit',
    defaultMessage: 'Edit',
  },
  create: {
    id: '$trood.create',
    defaultMessage: 'Create',
  },
  save: {
    id: '$trood.save',
    defaultMessage: 'Save',
  },
  ok: {
    id: '$trood.ok',
    defaultMessage: 'OK',
  },
  cancel: {
    id: '$trood.cancel',
    defaultMessage: 'Cancel',
  },
  true: {
    id: '$trood.true',
    defaultMessage: 'Yes',
  },
  false: {
    id: '$trood.false',
    defaultMessage: 'No',
  },
  sureAsk: {
    id: '$trood.sureAsk',
    defaultMessage: 'Are you sure?',
  },
  yes: {
    id: '$trood.yes',
    defaultMessage: 'Yes',
  },
  no: {
    id: '$trood.no',
    defaultMessage: 'No',
  },
  selectValue: {
    id: '$trood.select_value',
    defaultMessage: 'Select value',
  },
  notSet: {
    id: '$trood.not_set',
    defaultMessage: 'Not set',
  },
  search: {
    id: '$trood.search',
    defaultMessage: 'Search',
  },
  upload: {
    id: '$trood.upload',
    defaultMessage: 'Upload',
  },
  accessDenied: {
    id: '$trood.accessDenied',
    defaultMessage: 'Access denied',
  },
  deletionQuestion: {
    id: '$trood.deletionQuestion',
    defaultMessage: 'Delete it?',
  },
})
