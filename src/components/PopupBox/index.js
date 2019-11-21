import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import TClickOutside from '$trood/components/TClickOutside'
import FlexiblePopup from '$trood/components/FlexiblePopup'

import { POPUP_POSITION } from './constants'
import style from './index.css'


class PopupBox extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    control: PropTypes.node,
    position: PropTypes.oneOf(Object.values(POPUP_POSITION)),
    close: PropTypes.bool,
    arrow: PropTypes.bool,

    tRef: PropTypes.func,

    onOpen: PropTypes.func,
    onClose: PropTypes.func,

    children: PropTypes.node,
  }

  static defaultProps = {
    className: '',
    close: false,
    position: POPUP_POSITION.topRight,

    onOpen: () => {},
    onClose: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      open: false,
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen(open) {
    let newOpen = open
    const oldOpen = this.state.open
    if (newOpen === undefined) {
      newOpen = !oldOpen
    }
    this.setState({
      open: newOpen,
    })
    if (oldOpen !== newOpen) {
      if (newOpen) {
        this.props.onOpen()
      } else {
        this.props.onClose()
      }
    }
  }

  render() {
    const {
      className,

      position,
      arrow,
      control,

      tRef,

      children,
    } = this.props
    const {
      open,
    } = this.state

    const getChildren = typeof children === 'function' ? children : () => children

    return (
      <div className={classNames(style.root, className, arrow && style.arrow)} ref={tRef}>
        <TClickOutside {...{
          className: style.popup,
          onClick: () => this.toggleOpen(false),
        }}>
          <div className={style.controlWrapper} onClick={() => this.toggleOpen()}>
            {control}
          </div>
          {open &&
            <FlexiblePopup {...{
              position: arrow && position,
              className: style[position],
              onClose: () => this.toggleOpen(false),
            }}>
              {getChildren()}
            </FlexiblePopup>
          }
        </TClickOutside>
      </div>
    )
  }
}

export { POPUP_POSITION } from './constants'

export default PopupBox
