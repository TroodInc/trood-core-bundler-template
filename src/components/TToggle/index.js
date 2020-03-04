import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import EnchancedSwitch, {INNER_INPUT_TYPES, LABEL_POSITION_TYPES} from '../internal/EnchancedSwitch'

import style from './index.css'

/**
 * Component for output Toggle.
 */

class TToggle extends PureComponent {
  static propTypes = {
    /** disabled or not */
    disabled: PropTypes.bool,
    /** value true or false */
    value: PropTypes.bool,
    /** is switch or not */
    isSwitch: PropTypes.bool,

    /** class name for styling component */
    className: PropTypes.string,
    /** class name for styling label */
    labelClassName: PropTypes.string,
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
    isSwitch: true,
  }

  constructor(props) {
    super(props)
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  handleMouseUp() {
    if (this.toggle) {
      this.toggle.blur()
    }
  }

  render() {
    const {
      disabled,
      value,
      isSwitch,

      ...other
    } = this.props

    const toggleComp = (
      <div {...{
        key: 'toggle', // For not recreating element and working animations
        className: classNames(style.root, {
          [style.rootChecked]: value,
          [style.rootDisabled]: disabled,
          [style.rootNonSwitch]: !isSwitch,
        }),
        ref: (node) => {
          this.toggle = node
        }, // when we click it bacame focused and gain outline, we should blur it
        tabIndex: 0,
        onMouseUp: this.handleMouseUp,
      }} >
        <span className={style.rootInner}></span>
      </div>
    )

    return (
      <EnchancedSwitch {...{
        disabled,
        switched: value,
        switchedComponent: toggleComp,
        ...other,
      }} />
    )
  }
}

export default TToggle
