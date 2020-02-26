import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'

import { POPUP_ARROW_POSITION } from './constants'

/**
 * Component for view flexible popup.
 */

class FlexiblePopup extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** title for component */
    title: PropTypes.node,
    /** position for component, all position you can see in constants */
    position: PropTypes.oneOf(Object.values(POPUP_ARROW_POSITION)),
    /** close or not */
    close: PropTypes.bool,
    /** onClose function, for onClick in component TIcon */
    onClose: PropTypes.func,
    /** children node */
    children: PropTypes.node,
  }

  static defaultProps = {
    className: '',
    onClose: () => {},
    close: false,
  }

  render() {
    const {
      className,

      title,
      position,

      onClose,
      close,

      children,
    } = this.props

    return (
      <div className={classNames(style.root, className)}>
        {position && <div className={style[position]} />}
        {(title || close) &&
          <div className={style.head}>
            <div className={style.title}>{title}</div>
            {close &&
              <TIcon {...{
                size: 32,
                type: ICONS_TYPES.close,
                className: style.svgClear,
                onClick: onClose,
              }} />
            }
          </div>
        }
        <div className={style.content}>
          {children}
        </div>
      </div>
    )
  }
}

export { POPUP_ARROW_POSITION } from './constants'

export default FlexiblePopup
