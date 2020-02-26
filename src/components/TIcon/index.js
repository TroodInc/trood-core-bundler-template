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

/**
 * Component for output icon.
 */

class TIcon extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** width and height size icon in px */
    size: PropTypes.number,
    /** all types you can see in components */
    type: PropTypes.oneOf(Object.keys(ICONS_TYPES)),
    /** default type for rotate you can see in constants, or send number in deg */
    rotate: PropTypes.oneOfType([
      PropTypes.oneOf(Object.values(ROTATE_TYPES)),
      PropTypes.number,
    ]),
    /** label icon */
    label: PropTypes.node,
    /** all label position you can see in constants */
    labelPosition: PropTypes.oneOf(Object.keys(LABEL_POSITION_TYPES)),
    /** color icon */
    color: PropTypes.string,
    /** disabled or not */
    disabled: PropTypes.bool,
    /** onClick function */
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
