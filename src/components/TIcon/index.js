import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import {
  ICONS_TYPES,
  ICON_COMPS,
  LABEL_POSITION_TYPES,
  ROTATE_TYPES,
  ROTATE_VALUES,
} from './constants'

import style from './index.css'


class TIcon extends PureComponent {
  static propTypes = {
    size: PropTypes.number,
    type: PropTypes.oneOf(Object.keys(ICONS_TYPES)),
    rotate: PropTypes.oneOfType([
      PropTypes.oneOf(Object.values(ROTATE_TYPES)),
      PropTypes.number,
    ]),
    label: PropTypes.node,
    labelPosition: PropTypes.oneOf(Object.keys(LABEL_POSITION_TYPES)),
    className: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    rotate: ROTATE_TYPES.up,
    labelPosition: LABEL_POSITION_TYPES.right,
    disabled: false,
  }

  render() {
    const {
      size,
      color,
      type,
      className,
      rotate,
      label,
      labelPosition,
      disabled,
      onClick,
      ...other
    } = this.props

    const inlineStyle = {
      transform: `rotate(${typeof rotate === 'string' ? ROTATE_VALUES[rotate] : rotate}deg)`,
      width: size,
      height: size,
    }
    return (
      <div {...{
        className: classNames(style.root, className),
        'data-cy': type,
        onClick: disabled ? undefined : onClick,
        style: {
          cursor: onClick && 'pointer',
          color,
        },
      }} >
        <div {...{
          className: style.svgWrapper,
          style: inlineStyle,
        }} >
          {!!type && React.createElement(ICON_COMPS[type], other)}
        </div>
        {label &&
          <div {...{
            className: style[labelPosition],
          }}>
            {label}
          </div>
        }
      </div>
    )
  }
}

export { ICONS_TYPES, ROTATE_TYPES, LABEL_POSITION_TYPES } from './constants'

export default TIcon
