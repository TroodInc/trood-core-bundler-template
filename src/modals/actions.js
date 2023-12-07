import {
  ACTIONS_TYPES,
  CONFIRM_MODAL_NAME,
  INPUT_MODAL_NAME,
  POPUP_NAME,
  MODAL_SIZES,
  POPUP_COLORS,
} from './constants'

import localeService, { intlObject } from '$trood/localeService'


export const showModal = (open, name, params, mode) => ({
  type: ACTIONS_TYPES.modals.showModal,
  open,
  name,
  params,
  mode,
})

export const toggleModalMinimize = name => ({
  type: ACTIONS_TYPES.modals.toggleMinimize,
  name,
})

export const showConfirmModal = ({
  onAccept = () => {},
  onDecline = () => {},
  ...other
} = {}) => (dispatch) => {
  dispatch(showModal(true, CONFIRM_MODAL_NAME, {
    onAny: () => dispatch(showModal(false, CONFIRM_MODAL_NAME)),
    onAccept,
    onDecline,
    size: MODAL_SIZES.confirm,
    ...other,
  }, 'static'))
}

export const showInputModal = ({
  onAccept = () => {},
  onDecline = () => {},
  ...other
} = {}) => (dispatch) => {
  dispatch(showModal(true, INPUT_MODAL_NAME, {
    onAny: () => dispatch(showModal(false, INPUT_MODAL_NAME)),
    onAccept,
    onDecline,
    size: MODAL_SIZES.small,
    text: intlObject.intl.formatMessage(localeService.generalMessages.selectValue),
    acceptButtonText: intlObject.intl.formatMessage(localeService.generalMessages.ok),
    declineButtonText: intlObject.intl.formatMessage(localeService.generalMessages.cancel),
    ...other,
  }, 'static'))
}

export const showMessageBoxModal = ({
  onAccept = () => {},
  ...other
} = {}) => (dispatch) => {
  dispatch(showModal(true, CONFIRM_MODAL_NAME, {
    onAny: () => dispatch(showModal(false, CONFIRM_MODAL_NAME)),
    onAccept,
    showDecline: false,
    size: MODAL_SIZES.confirm,
    acceptButtonText: intlObject.intl.formatMessage(localeService.generalMessages.ok),
    ...other,
  }, 'static'))
}

const showPopup = color => (text, props) => (dispatch) => {
  dispatch(showModal(true, POPUP_NAME, {
    color,
    text,
    onAny: () => dispatch(showModal(false, POPUP_NAME)),
    ...props,
  }, 'static'))
}

export const showInfoPopup = showPopup(POPUP_COLORS.blue)
export const showSuccessPopup = showPopup(POPUP_COLORS.green)
export const showErrorPopup = showPopup(POPUP_COLORS.red)
