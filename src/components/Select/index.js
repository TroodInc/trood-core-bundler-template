import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import deepEqual from 'deep-equal'

import style from './index.module.css'

import { ICONS_TYPES } from '../Icon'

import Label from '../Label'

import { SELECT_TYPES } from './constants'

import BaseComponent, { getData } from 'core/BaseComponent'
import { Component } from 'core/pageStore'
import Context from '../Context'

import withTooltip from '../internal/Tooltip'

import List, { LIST_ORIENTATION, LIST_TYPES } from './components/List'
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

class Select extends PureComponent {
  static propTypes = {
    valuePath: PropTypes.string,
    labelNodes: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        type: PropTypes.string,
      }),
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({
            type: PropTypes.string.isRequired,
          }),
        ]),
      ),
    ]),
    /** class name for styling component */
    className: PropTypes.string,
    /** class name for styling label */
    labelClassName: PropTypes.string,
    /** type is one of SELECT_TYPES.dropdown, SELECT_TYPES.filterDropdown, SELECT_TYPES.tile,
     * SELECT_TYPES.list, SELECT_TYPES.rating */
    type: PropTypes.oneOf(Object.values(SELECT_TYPES)),
    /** list type is one of LIST_TYPES.text, LIST_TYPES.filterDropdown, LIST_TYPES.radio, LIST_TYPES.checkbox,
     * LIST_TYPES.toggle, LIST_TYPES.tile */
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
    /** Open options to up when true. For select with type "DropDown" */
    openUp: PropTypes.bool,
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
    /** orientation is one of LIST_ORIENTATION.vertical, LIST_ORIENTATION.horizontal.
     * For select with type "List" or "Tile" */
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
      /** all types you can see in component Icon */
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
    valuePath: '$context.value',
    labelNodes: [{
      type: 'div',
      props: {
        children: {
          $type: '$data',
          path: '$context.label',
        },
      },
    }],
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

    this.lastValid = true

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

  componentWillUnmount() {
    if (!this.lastValid) {
      this.lastValid = true
      this.props.onValid()
    }
  }

  getSelectComponent(errors) {
    const {
      type,
      multi,
      clearable,
      listType,
      items,
      valuePath,
      labelNodes,
    } = this.props

    const labelStore = Component.create({ nodes: labelNodes })

    const generalProps = {
      ...this.props,
      items: items.map((item, i) => ({
        label: (
          <Context key={i} context={item}>
            <BaseComponent  $context={item} component={labelStore} />
          </Context>
        ),
        value: getData(
          valuePath,
          {
            $context: item,
          },
        ),
      })),
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
      errors,
      disabled,
      onValid,
      onInvalid,
    } = this.props

    if (!disabled) {
      const newErrors = required && !values.length ? ['Value is required'] : [] // TODO i18n

      if (newErrors.length) {
        this.lastValid = false
        if (!deepEqual(errors, newErrors)) onInvalid(newErrors)
      } else
      if (!this.lastValid) {
        this.lastValid = true
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
          <Label {...{
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

export default withTooltip(Select)
