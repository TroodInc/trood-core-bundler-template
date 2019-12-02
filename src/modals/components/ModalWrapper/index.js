import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Modal from 'react-modal'

import modalsStyle from '$trood/styles/modals.css'
import style from './index.css'
import fadeInUp from '$trood/styles/transitions/fadeInUp.css'

import { ICONS_TYPES } from '$trood/components/TIcon/constants'
import TIcon from '$trood/components/TIcon'
import ErrorBoundary from '$trood/components/ErrorBoundary'

import { MODAL_SIZES } from '../../constants'


class ModalWrapper extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    shouldCloseOnOverlayClick: PropTypes.bool,
    className: PropTypes.string,
    cancelAction: PropTypes.func,
    closeAction: PropTypes.func,
    deleteAction: PropTypes.func,
    editAction: PropTypes.func,
    title: PropTypes.node,
    size: PropTypes.oneOf(Object.values(MODAL_SIZES)),
    order: PropTypes.number,
    buttons: PropTypes.func,
  }

  static defaultProps = {
    show: true,
    shouldCloseOnOverlayClick: false,
    className: '',
    closeAction: () => {},
    size: MODAL_SIZES.medium,
  }

  render() {
    const {
      name,
      show,
      shouldCloseOnOverlayClick,
      closeOnEdit,
      closeAction,
      className,
      children,
      title,
      size,
      order,
      cancelAction,
      deleteAction,
      editAction,
      buttons,
    } = this.props

    const closeAndCancel = () => {
      if (cancelAction) {
        cancelAction()
      }
      if (closeAction) {
        closeAction()
      }
    }

    const closeButton = (
      <TIcon {...{
        type: ICONS_TYPES.clear,
        className: title ? style.close : style.closeAbsolute,
        onClick: closeAndCancel,
        size: 25,
      }} />
    )

    const transitionProps = {
      key: 'modalTransitions',
      className: fadeInUp,
      timeout: {
        enter: 500,
        exit: 500,
      },
    }

    const modalProps = {
      key: 'modal',
      contentLabel: 'Modal',
      appElement: document.body,
    }

    if (!show) {
      return (
        <Modal {...{
          ...modalProps,
          isOpen: true,
          className: style.hiddenModal,
          overlayClassName: style.hiddenOverlay,
        }} >
          <CSSTransition {...transitionProps}>
            <div />
          </CSSTransition>
        </Modal>
      )
    }

    return (
      <Modal {...{
        ...modalProps,
        isOpen: show,
        onRequestClose: closeAndCancel,
        shouldCloseOnOverlayClick,
        className: style[size],
        style: {
          overlay: {
            zIndex: 5000 + (order || 0),
          },
        },
        overlayClassName: style.overlay,
      }} >
        <div className={style.closeOverlay} onClick={(shouldCloseOnOverlayClick ? closeAndCancel : undefined)} />
        <CSSTransition {...transitionProps}>
          <div className={classNames(style.root, className)} data-cy={name}>
            {
              title &&
              <div className={style.title}>
                <div className={style.titleText}>{title}</div>
                {
                  editAction &&
                  <React.Fragment>
                    <TIcon {...{
                      type: ICONS_TYPES.edit,
                      className: style.toolBarIcon,
                      onClick: async () => {
                        await editAction()
                        if (closeOnEdit) closeAction()
                      },
                      size: 17,
                    }} />
                    {
                      size !== MODAL_SIZES.full &&
                      <div className={style.delimeter} />
                    }
                  </React.Fragment>
                }
                {
                  deleteAction &&
                  <React.Fragment>
                    <TIcon {...{
                      type: ICONS_TYPES.trashBin,
                      className: style.toolBarIcon,
                      onClick: async () => {
                        await deleteAction()
                        closeAction()
                      },
                      size: 17,
                    }} />
                    {
                      size !== MODAL_SIZES.full &&
                      <div className={style.delimeter} />
                    }
                  </React.Fragment>
                }
                {closeAction && closeButton}
                {
                  !!buttons && size === MODAL_SIZES.full &&
                  <div className={style.fullButtons}>
                    {buttons(this.props)}
                  </div>
                }
              </div>
            }
            <div className={style.children}>
              <ErrorBoundary errorClassName={modalsStyle.root}>
                {children}
                {
                  !!buttons && size !== MODAL_SIZES.full &&
                  <div className={modalsStyle.buttonsContainer}>
                    {buttons(this.props)}
                  </div>
                }
              </ErrorBoundary>
            </div>
            {!title && closeAction && closeButton}
          </div>
        </CSSTransition>
      </Modal>
    )
  }
}

export default ModalWrapper
