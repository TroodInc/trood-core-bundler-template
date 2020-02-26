import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import deepEqual from 'deep-equal'

import style from './index.css'

import { intlObject } from '$trood/localeService'
import { messages } from '$trood/mainConstants'

import { ICONS_TYPES } from '$trood/components/TIcon'

import TLabel from '$trood/components/TLabel'

import { SELECT_TYPES } from './constants'

import List, {LIST_ORIENTATION, LIST_TYPES} from './components/List'
import DropDown from './components/DropDown'
import Tile from './components/Tile'
import Rating from './components/Rating'


const valueTypes = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.bool,
])

/**
 * Component for select some value.
 */

class TSelect extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** class name for styling label */
    labelClassName: PropTypes.string,
    /** all type you can see in constants */
    type: PropTypes.oneOf(Object.values(SELECT_TYPES)),
    /** all list type you can see in interior component List, in constants */
    listType: PropTypes.oneOf(Object.values(LIST_TYPES)),
    /** multi select or not */
    multi: PropTypes.bool,
    /** label text */
    label: PropTypes.node,
    /** select values */
    values: PropTypes.arrayOf(valueTypes),
    /** clearable or not */
    clearable: PropTypes.bool,
    /** disabled or not */
    disabled: PropTypes.bool,
    /** list errors */
    errors: PropTypes.arrayOf(PropTypes.string),
    /** validate settings */
    validate: PropTypes.shape({
      /** check on blur or not */
      checkOnBlur: PropTypes.bool,
      /** required or not */
      required: PropTypes.bool,
    }),
    /** show text errors or not */
    showTextErrors: PropTypes.bool,
    /** onValid function */
    onValid: PropTypes.func,
    /** onInvalid function */
    onInvalid: PropTypes.func,

    /** class name for control. For select with type "DropDown" */
    controlClassName: PropTypes.string,
    /** class name for value. For select with type "DropDown" */
    valueClassName: PropTypes.string,
    /** style for main select container. For select with type "DropDown" */
    mainSelectContainerStyle: PropTypes.object,
    /** items data. For select with type "DropDown" and "List" or "Tile" */
    items: PropTypes.arrayOf(PropTypes.shape({
      /** item value */
      value: valueTypes,
      /** item label */
      label: PropTypes.node,
    })),
    /** control. For select with type "DropDown" */
    iconProps: PropTypes.object,
    /** placeholder text. For select with type "DropDown" or "Tile" */
    placeHolder: PropTypes.node,
    /** show search control. For select with type "DropDown" */
    showSearch: PropTypes.bool,
    /** set when loading finish. For select with type "DropDown" and "List" */
    isLoading: PropTypes.bool,
    /** default open selector or not. For select with type "DropDown" and "List" or "Tile" */
    defaultOpen: PropTypes.bool,
    /** maximum number of rows. For select with type "DropDown" and "List" */
    maxRows: PropTypes.number,
    /** autoScroll or not. For select with type "DropDown" and "List" */
    autoScroll: PropTypes.bool,
    /** onChange function. For select with type "DropDown" and "List" or "Tile" or "Rating" */
    onChange: PropTypes.func,
    /** onBlur function. For select with type "DropDown" and "List" or "Tile" or "Rating" */
    onBlur: PropTypes.func,
    /** onFocus function. For select with type "DropDown" or "Rating" */
    onFocus: PropTypes.func,
    /** onSearch function. For select with type "DropDown" */
    onSearch: PropTypes.func,
    /** onAdd function. For select with type "DropDown" */
    onAdd: PropTypes.func,
    /** missing value resolver. For select with type "DropDown" or "Tile" */
    missingValueResolver: PropTypes.func,
    /** children node. For select with type "DropDown" */
    children: PropTypes.node,

    /** class name for item. For select with type "List" */
    itemClassName: PropTypes.string,
    /** orientation "vertical" or "horizontal". For select with type "List" or "Tile" */
    orientation: PropTypes.oneOf(Object.values(LIST_ORIENTATION)),
    /** children node. For select with type "List" */
    emptyItemsLabel: PropTypes.node,
    /** children node. For select with type "List" */
    onScrollToEnd: PropTypes.func,

    /** rating value. For select with type "Rating" */
    value: PropTypes.number,
    /** max rating value. For select with type "Rating" */
    maxRating: PropTypes.number,
    /** icon settings. For select with type "Rating" */
    icon: PropTypes.shape({
      /** all types you can see in component TIcon, in components */
      type: PropTypes.oneOf(Object.values(ICONS_TYPES)),
      /** width and height size icon in px */
      size: PropTypes.number,
      /** class name for styling component */
      className: PropTypes.string,
      /** class name for active icon */
      activeIconClassName: PropTypes.string,
      /** class name for in active icon */
      inActiveIconClassName: PropTypes.string,
    }),
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
    if (!deepEqual(prevProps.values, this.props.values) || !deepEqual(prevProps.validate, this.props.validate)) {
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
      const errors = required && !values.length ? [intlObject.intl.formatMessage(messages.requiredField)] : []

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
