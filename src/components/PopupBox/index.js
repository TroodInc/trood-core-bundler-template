import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import TClickOutside from '$trood/components/TClickOutside'
import FlexiblePopup from '$trood/components/FlexiblePopup'

import { POPUP_POSITION } from './constants'
import style from './index.css'

/**
 * Component for output popup box.
 */

class PopupBox extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** set control */
    control: PropTypes.node,
    /** position is one of POPUP_POSITION.topLeft, POPUP_POSITION.topRight, POPUP_POSITION.topMiddle,
     * POPUP_POSITION.bottomLeft, POPUP_POSITION.bottomRight, POPUP_POSITION.bottomMiddle */
    position: PropTypes.oneOf(Object.values(POPUP_POSITION)),
    /** show arrow or not */
    arrow: PropTypes.bool,
    /** tRef function */
    tRef: PropTypes.func,
    /** onOpen function */
    onOpen: PropTypes.func,
    /** onClose function */
    onClose: PropTypes.func,
    /** children node */
    children: PropTypes.node,
  }

  static defaultProps = {
    className: '',
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

    const { open } = this.state

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
