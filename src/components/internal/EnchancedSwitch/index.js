import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

import { INNER_INPUT_TYPES, LABEL_POSITION_TYPES } from './constants'

import { messages } from '$trood/mainConstants'
import { intlObject } from '$trood/localeService'


class EnchancedSwitch extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** class name for styling label */
    labelClassName: PropTypes.string,
    /** class name for styling disabled label */
    disabledLabelClassName: PropTypes.string,
    /** type is one of  INNER_INPUT_TYPES.checkbox, INNER_INPUT_TYPES.radio */
    type: PropTypes.oneOf(Object.values(INNER_INPUT_TYPES)),
    /** disabled or not */
    disabled: PropTypes.bool,
    /** stop propagation or not */
    stopPropagation: PropTypes.bool,
    /** switched or not */
    switched: PropTypes.bool.isRequired,
    /** view switched component */
    switchedComponent: PropTypes.node.isRequired,
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
    stopPropagation: false,
    className: '',
    labelClassName: '',
    disabledLabelClassName: '',
    type: INNER_INPUT_TYPES.checkbox,
    labelPosition: LABEL_POSITION_TYPES.right,
    secondLabelPosition: LABEL_POSITION_TYPES.left,
    errors: [],
    showTextErrors: true,
    validate: {},

    onChange: () => {},
    onValid: () => {},
    onInvalid: () => {},
  }

  constructor(props) {
    super(props)

    this.validate = this.validate.bind(this)
    this.onValidationUpdate = this.onValidationUpdate.bind(this)

    this.state = {
      innerErrors: [],
      wasBlured: false,
    }
  }

  componentDidMount() {
    this.validate(this.props.switched)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.switched !== this.props.switched) {
      this.validate(this.props.switched)
    }
  }

  onValidationUpdate() {
    const { disabled } = this.props
    const { innerErrors } = this.state

    if (!disabled) {
      if (innerErrors.length) {
        this.props.onInvalid(innerErrors)
      } else {
        this.props.onValid()
      }
    }
  }

  validate(value) {
    const innerErrors = this.props.validate.required && !value ?
      [intlObject.intl.formatMessage(messages.requiredField)] : []
    this.setState({ innerErrors }, this.onValidationUpdate)
  }

  render() {
    const {
      className,
      labelClassName,
      disabledLabelClassName,
      disabled,
      stopPropagation,
      type,
      switched,
      switchedComponent,
      unSwitchedComponent,
      label,
      secondLabel,
      labelPosition,
      secondLabelPosition,
      errors,
      showTextErrors,

      onChange,
    } = this.props

    const currentErrors = this.props.validate.checkOnBlur && !this.state.wasBlured ? [] : errors

    return (
      <div {...{
        tabIndex: 0,
        className: classNames(style.root, className, disabled && style.disabled),
        'data-cy': label,
        onClick: !disabled ?
          e => {
            if (stopPropagation) e.stopPropagation()
            onChange(!switched)
          } : undefined,
        onBlur: !disabled ? () => this.setState({ wasBlured: true }) : undefined,
        onFocus: !disabled ? () => this.setState({ wasBlured: false }) : undefined,
      }} >
        <input {...{
          type,
          disabled,
          className: style.innerInput,
          checked: switched,
          onChange: () => {}, // suppress react warning
        }} />
        {label &&
          <label
            className={classNames(
              labelPosition === LABEL_POSITION_TYPES.right ? style.labelRight : style.labelLeft,
              labelClassName,
              disabled && style.disabledLabel,
              disabled && disabledLabelClassName,
            )}
          >
            {label}
          </label>
        }
        {secondLabel &&
          <label
            className={classNames(
              secondLabelPosition === LABEL_POSITION_TYPES.right ? style.labelRight : style.labelLeft,
              labelClassName,
              disabled && style.disabledLabel,
              disabled && disabledLabelClassName,
            )}
          >
            {secondLabel}
          </label>
        }
        <div className={style.component}>
          {switched && switchedComponent}
          {!switched && (unSwitchedComponent || switchedComponent)}
        </div>
        {showTextErrors &&
          <div className={style.errors}>
            {currentErrors.map((error, index) => (
              <div className={style.errorText} key={index}>
                {error}
              </div>
            ))}
          </div>
        }
      </div>
    )
  }
}

export { INNER_INPUT_TYPES, LABEL_POSITION_TYPES } from './constants'

export default EnchancedSwitch
