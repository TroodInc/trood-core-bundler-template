import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

import EnchancedSwitch, {INNER_INPUT_TYPES, LABEL_POSITION_TYPES} from '../internal/EnchancedSwitch'
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
    /** set icon type, default 'confirm', all iconType you can see in component TIcon */
    iconType: PropTypes.oneOf(Object.values(ICONS_TYPES)),
    /** view type is one of CHECK_VIEW_TYPES.checkbox, CHECK_VIEW_TYPES.toggler */
    viewType: PropTypes.oneOf(Object.values(CHECK_VIEW_TYPES)),
    /** set label color is one of CHECK_COLORS.blue, CHECK_COLORS.black */
    color: PropTypes.oneOf(Object.values(CHECK_COLORS)),
    /** set label class name' */
    labelClassName: PropTypes.string,

    /** class name for styling component */
    className: PropTypes.string,
    /** class name for styling disabled label */
    disabledLabelClassName: PropTypes.string,
    /** type is one of INNER_INPUT_TYPES.checkbox, INNER_INPUT_TYPES.radio */
    type: PropTypes.oneOf(Object.values(INNER_INPUT_TYPES)),
    /** stop propagation or not */
    stopPropagation: PropTypes.bool,
    /** view un switched component */
    unSwitchedComponent: PropTypes.node,
    /** label text */
    label: PropTypes.node,
    /** label position is one of LABEL_POSITION_TYPES.right, LABEL_POSITION_TYPES.left */
    labelPosition: PropTypes.oneOf(Object.values(LABEL_POSITION_TYPES)),
    /** second label text */
    secondLabel: PropTypes.node,
    /** second label position is one of LABEL_POSITION_TYPES.right, LABEL_POSITION_TYPES.left */
    secondLabelPosition: PropTypes.oneOf(Object.values(LABEL_POSITION_TYPES)),
    /** errors text */
    errors: PropTypes.arrayOf(PropTypes.node),
    /** show text errors or not */
    showTextErrors: PropTypes.bool,
    /** validate settings */
    validate: PropTypes.shape({
      /** check on blur or not */
      checkOnBlur: PropTypes.bool,
      /** required or not */
      required: PropTypes.bool,
    }),
    /** onChange function */
    onChange: PropTypes.func,
    /** onValid function */
    onValid: PropTypes.func,
    /** onInvalid function */
    onInvalid: PropTypes.func,
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
        'data-cy':  value ? 'checkbox_checked' : 'checkbox_unchecked',
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
