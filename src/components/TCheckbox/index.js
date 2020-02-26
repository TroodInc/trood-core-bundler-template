import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

import EnchancedSwitch from '../internal/EnchancedSwitch'
import TIcon from '$trood/components/TIcon'
import { ICONS_TYPES } from '$trood/components/TIcon/constants'

import { CHECK_COLORS, CHECK_VIEW_TYPES } from './constants'

/**
 * Component for output checkbox.
 */

class TCheckbox extends PureComponent {
  static propTypes = {
    /** disabled or not */
    disabled: PropTypes.bool,
    /** value or not */
    value: PropTypes.bool,
    /** set icon type, default 'confirm', all iconType you can see in component TIcon, in components */
    iconType: PropTypes.oneOf(Object.values(ICONS_TYPES)),
    /** all viewType you can see in constants */
    viewType: PropTypes.oneOf(Object.values(CHECK_VIEW_TYPES)),
    /** set label color, all color you can see in constants */
    color: PropTypes.oneOf(Object.values(CHECK_COLORS)),
    /** set label class name' */
    labelClassName: PropTypes.string,
  }

  static defaultProps = {
    disabled: false,
    value: false,
    viewType: CHECK_VIEW_TYPES.checkbox,
    color: CHECK_COLORS.blue,
  }

  render() {
    const {
      disabled,
      value,
      iconType,
      viewType,
      color,

      labelClassName,

      ...other
    } = this.props

    const checkboxComp = (
      <div{...{
        className: classNames(
          style.root,
          !iconType ? style.boxRoot : style.iconRoot,
          style[viewType],
          style[color],
          value && style.checked,
          disabled && style.disabled,
        ),
        'data-cy': 'checkbox',
      }}
        >
        <TIcon {...{
          type: iconType || ICONS_TYPES.confirm,
          size: 16,
          className: iconType || value ? style.icon : style.iconHide,
        }} />
      </div>
    )

    return (
      <EnchancedSwitch {...{
        disabled,
        switched: value,
        switchedComponent: checkboxComp,
        labelClassName: classNames(
          color === CHECK_COLORS.black && !value ? style.grayLabel : '',
          labelClassName,
        ),
        ...other,
      }} />
    )
  }
}

export { CHECK_COLORS, CHECK_VIEW_TYPES }

export default TCheckbox
