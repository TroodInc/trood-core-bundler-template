import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as selectors from './selectors'

import { registeredModals } from './constants'
import ModalWrapper from './components/ModalWrapper'
import PopupWrapper from './components/PopupWrapper'
import ConfirmModal from './components/ConfirmModal'
import InputModal from './components/InputModal'


const context = require.context('../', true, /.*\/modals\/[A-z0-9-_]*\.modal\.js$/)


class ModalsComp extends Component {
  shouldComponentUpdate(prevProps) {
    return prevProps.openByNameMap !== this.props.openByNameMap ||
      prevProps.paramsByNameMap !== this.props.paramsByNameMap ||
      this.registeredModalsCount !== registeredModals.length
  }

  render() {
    const {
      openByNameMap,
      paramsByNameMap,
      modalsOrderByNameMap,
      confirmModalOpen = false,
      confirmModalProps = {},
      inputModalOpen = false,
      inputModalProps = {},
      popupOpen = false,
      popupProps = {},
      ...other
    } = this.props

    this.registeredModalsCount = registeredModals.length

    return (
      <span>
        {context.keys().concat(registeredModals).map((key, index) => {
          let ModalComp = key
          if (typeof ModalComp !== 'function') {
            ModalComp = context(key).default
          }
          return (
            <ModalComp {...{
              key: typeof key === 'function' ? index : key,
              openByNameMap,
              paramsByNameMap,
              modalsOrderByNameMap,
              ...other,
            }} />
          )
        })}
        <ModalWrapper {...{
          order: 99999,
          show: inputModalOpen,
          showClose: inputModalProps.showClose,
          closeAction: () => {
            if (inputModalProps.onAny) {
              inputModalProps.onAny()
            }
            if (inputModalProps.onDecline) {
              inputModalProps.onDecline()
            }
          },
          size: inputModalProps.size,
          ...other,
        }}>
          <InputModal {...inputModalProps} />
        </ModalWrapper>
        <ModalWrapper {...{
          order: 999999,
          show: confirmModalOpen,
          showClose: confirmModalProps.showClose,
          closeAction: () => {
            if (confirmModalProps.onAny) {
              confirmModalProps.onAny()
            }
            if (confirmModalProps.onDecline) {
              confirmModalProps.onDecline()
            }
          },
          size: confirmModalProps.size,
          ...other,
        }}>
          <ConfirmModal {...confirmModalProps} />
        </ModalWrapper>
        <PopupWrapper {...{
          order: 9999999,
          show: popupOpen,
          timeout: popupProps.timeout,
          color: popupProps.color,
          closeAction: popupProps.onAny,
          ...other,
        }}>
          {popupProps.text}
        </PopupWrapper>
      </span>
    )
  }
}

const stateToProps = (state, props) => {
  return ({
    ...props,
    openByNameMap: selectors.getOpenByNameMap(state),
    paramsByNameMap: selectors.getModalsPropsByNameMap(state),
    modalsOrderByNameMap: selectors.getModalsOrderByNameMap(state),
    confirmModalOpen: selectors.getConfirmModalOpen(state),
    confirmModalProps: selectors.getConfirmModal(state),
    inputModalOpen: selectors.getInputModalOpen(state),
    inputModalProps: selectors.getInputModal(state),
    popupOpen: selectors.getPopupOpen(state),
    popupProps: selectors.getPopup(state),
  })
}

export default connect(stateToProps)(ModalsComp)
