import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import deepEqual from 'deep-equal'

import style from './index.css'

import TLabel from '$trood/components/TLabel'

import {
  SELECT_TYPES,
  ERROR_TYPES,
} from './constants'

import List, { LIST_TYPES } from './components/List'
import DropDown from './components/DropDown'
import Tile from './components/Tile'
import Rating from './components/Rating'


const valueTypes = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.bool,
])

class TSelect extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    labelClassName: PropTypes.string,

    type: PropTypes.oneOf(Object.values(SELECT_TYPES)),
    listType: PropTypes.oneOf(Object.values(LIST_TYPES)),
    multi: PropTypes.bool,
    label: PropTypes.node,
    values: PropTypes.arrayOf(valueTypes),
    clearable: PropTypes.bool,

    disabled: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.string),
    validate: PropTypes.shape({
      checkOnBlur: PropTypes.bool,
      required: PropTypes.bool,
    }),
    showTextErrors: PropTypes.bool,

    onValid: PropTypes.func,
    onInvalid: PropTypes.func,
  }

  static defaultProps = {
    type: SELECT_TYPES.dropdown,
    values: [],

    errors: [],
    validate: {},
    showTextErrors: true,

    onValid: () => {},
    onInvalid: () => {},
  }

  constructor(props) {
    super(props)
    this.state = {
      wasBlured: false,
    }
    this.handleValidate = this.handleValidate.bind(this)
    this.toggleBlur = this.toggleBlur.bind(this)
    this.getSelectComponent = this.getSelectComponent.bind(this)
  }

  componentDidMount() {
    this.handleValidate(this.props.values)
  }

  componentDidUpdate(prevProps) {
    if (!deepEqual(prevProps.values, this.props.values)) {
      this.handleValidate(this.props.values)
    }
  }

  getSelectComponent(errors) {
    const {
      type,
      multi,
      clearable,
      listType,
    } = this.props

    const generalProps = {
      ...this.props,
      className: undefined,
      type: listType,
      clearable: clearable === undefined ? multi : clearable,
      errors,
      onBlur: this.toggleBlur,
      onFocus: () => this.toggleBlur(false),
    }

    switch (type) {
      case SELECT_TYPES.filterDropdown:
        return (
          <DropDown {...{
            ...generalProps,
            showSearch: true,
          }} />
        )
      case SELECT_TYPES.tile:
        return (
          <Tile {...{
            ...generalProps,
          }} />
        )
      case SELECT_TYPES.rating:
        return (
          <Rating {...{
            ...generalProps,
          }} />
        )
      case SELECT_TYPES.list:
        return (
          <List {...{
            ...generalProps,
          }} />
        )
      default:
        return (
          <DropDown {...{
            ...generalProps,
          }} />
        )
    }
  }

  handleValidate(values) {
    const {
      validate: {
        required,
      },
      disabled,
      onValid,
      onInvalid,
    } = this.props

    if (!disabled) {
      const errors = required && !values.length ? [ERROR_TYPES.required] : []

      if (errors.length) {
        onInvalid(errors)
      } else {
        onValid()
      }
    }
  }

  toggleBlur(wasBlured = true) {
    this.setState({ wasBlured })
  }

  render() {
    const {
      className,
      labelClassName,
      label,

      errors,
      validate,
      showTextErrors,
    } = this.props

    const currentErrors = validate.checkOnBlur && !this.state.wasBlured ? [] : errors
    const hasErrors = !!currentErrors.length

    return (
      <div className={classNames(className, style.root)}>
        {
          !!label &&
          <TLabel {...{
            className: classNames(labelClassName, style.label),
            required: validate.required,
            label,
          }} />
        }
        {this.getSelectComponent(currentErrors)}
        {
          showTextErrors && hasErrors &&
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

export { SELECT_TYPES } from './constants'
export { LIST_ORIENTATION, LIST_TYPES } from './components/List'

export default TSelect
