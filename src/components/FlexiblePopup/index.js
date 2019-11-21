import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'

import { POPUP_ARROW_POSITION } from './constants'
import style from './index.css'


class FlexiblePopup extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    title: PropTypes.node,
    position: PropTypes.oneOf(Object.values(POPUP_ARROW_POSITION)),
    close: PropTypes.bool,

    onClose: PropTypes.func,
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
