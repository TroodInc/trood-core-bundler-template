import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'
import { POPUP_POSITION } from '$trood/components/PopupBox'
import PopupBox from '$trood/components/PopupBox'

import style from './index.css'

/**
 * Component for displaying a button by clicking on which a drop-down menu is displayed.
 */

class DotMenu extends PureComponent {
  static propTypes = {
    /** size icon in px */
    size: PropTypes.number,
    /** menu ref attribute */
    menuRef: PropTypes.func,

    /** class name for styling, for PopupBox */
    className: PropTypes.string,
    /** position is one of POPUP_POSITION.topLeft, POPUP_POSITION.topRight, POPUP_POSITION.topMiddle,
     * POPUP_POSITION.bottomLeft, POPUP_POSITION.bottomRight, POPUP_POSITION.bottomMiddle */
    position: PropTypes.oneOf(Object.values(POPUP_POSITION)),
    /** show arrow or not, for PopupBox */
    arrow: PropTypes.bool,
    /** onOpen function, for PopupBox */
    onOpen: PropTypes.func,
    /** onClose function, for PopupBox */
    onClose: PropTypes.func,
    /** children node, for PopupBox */
    children: PropTypes.node,
  }

  render() {
    const {
      size,
      menuRef,
    } = this.props

    return (
      <PopupBox {...{
        ...this.props,
        tRef: menuRef,
        control: (
          <TIcon {...{
            size,
            type: ICONS_TYPES.dotMenu,
            className: style.icon,
          }} />
        ),
      }} />
    )
  }
}

export { POPUP_POSITION } from '$trood/components/PopupBox'

export default DotMenu
