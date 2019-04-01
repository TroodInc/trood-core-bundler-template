import {
  CONFIRM_MODAL_NAME,
  INPUT_MODAL_NAME,
  POPUP_NAME,
} from './constants'


export const getModalOpen = (modalName) => (state) => !!state.modals[modalName]

export const getModal = (modalName) => (state) => state.modals[modalName]

export const getOpenByNameMap = (state) => Object.keys(state.modals).reduce((memo, key) => ({
  ...memo,
  [key]: !!state.modals[key],
}), {})

export const getModalsPropsByNameMap = (state) => Object.keys(state.modals).reduce((memo, key) => {
  if (!state.modals[key]) {
    return memo
  }
  return {
    ...memo,
    [key]: state.modals[key].params,
  }
}, {})

export const getModalsOrderByNameMap = (state) => Object.keys(state.modals).reduce((memo, key) => {
  if (!state.modals[key]) {
    return memo
  }
  return {
    ...memo,
    [key]: state.modals[key].order,
  }
}, {})

export const getConfirmModalOpen = getModalOpen(CONFIRM_MODAL_NAME)
export const getConfirmModal = (state) => state.modals[CONFIRM_MODAL_NAME] && state.modals[CONFIRM_MODAL_NAME].params

export const getInputModalOpen = getModalOpen(INPUT_MODAL_NAME)
export const getInputModal = (state) => state.modals[INPUT_MODAL_NAME] && state.modals[INPUT_MODAL_NAME].params

export const getPopupOpen = getModalOpen(POPUP_NAME)
export const getPopup = (state) => state.modals[POPUP_NAME] && state.modals[POPUP_NAME].params
