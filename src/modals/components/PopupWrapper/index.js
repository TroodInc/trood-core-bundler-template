import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Modal from 'react-modal'
import debounce from 'lodash/debounce'

import style from './index.css'
import fadeInUp from '$trood/styles/transitions/fadeInUp.css'


const DEFAULT_TIMEOUT = 3000

class PopupWrapper extends PureComponent {
  static propTypes = {
    order: PropTypes.number,
    show: PropTypes.bool,
    timeout: PropTypes.number,
    color: PropTypes.string,
    closeAction: PropTypes.func,
  }

  static defaultProps = {
    show: true,
    timeout: DEFAULT_TIMEOUT,
    closeAction: () => {},
  }

  componentDidUpdate(prevProps) {
    if (this.props.closeAction && this.props.show && !prevProps.show) {
      this.debounceCloseAction = debounce(this.props.closeAction, this.props.timeout)
      this.debounceCloseAction()
    }
  }

  render() {
    const {
      order,
      show,
      color,
      closeAction,
      children,
    } = this.props

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
          className: style.hiddenRoot,
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
        onRequestClose: closeAction,
        shouldCloseOnOverlayClick: false,
        className: classNames(style.root, style[color]),
        style: {
          overlay: {
            zIndex: 5000 + (order || 0),
          },
        },
        overlayClassName: style.overlay,
      }} >
        <CSSTransition {...transitionProps}>
          <div>
            {children}
          </div>
        </CSSTransition>
      </Modal>
    )
  }
}

export default PopupWrapper
