import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import TClickOutside from '$trood/components/TClickOutside'
import TIcon, { ROTATE_TYPES, ICONS_TYPES } from '$trood/components/TIcon'
import TInput from '$trood/components/TInput'

import List, { LIST_TYPES } from '../List'

import { DEFAULT_MAX_ROWS, defaultFilterFunction } from './constants'

import style from './index.css'


const valueTypes = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.bool,
])

class DropDown extends PureComponent {
  static propTypes = {
    controlClassName: PropTypes.string,

    type: PropTypes.oneOf(Object.values(LIST_TYPES)),
    multi: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: valueTypes,
      label: PropTypes.node,
    })),
    values: PropTypes.arrayOf(valueTypes),
    label: PropTypes.node,

    defaultOpen: PropTypes.bool,
    maxRows: PropTypes.number,
    autoScroll: PropTypes.bool,
    disabled: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.string),

    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onSearch: PropTypes.func,
    missingValueResolver: PropTypes.func,
  }

  static defaultProps = {
    items: [],
    values: [],

    defaultOpen: false,
    maxRows: DEFAULT_MAX_ROWS,
    autoScroll: true,
    errors: [],

    onChange: () => {},
    onBlur: () => {},
    onFocus: () => {},
    missingValueResolver: v => v,
  }

  constructor(props) {
    super(props)
    this.state = {
      open: this.props.defaultOpen,
      innerSearch: undefined,
    }

    this.renderDisplayValue = this.renderDisplayValue.bind(this)
    this.toggleOpen = this.toggleOpen.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeSearchValue = this.handleChangeSearchValue.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.getItems = this.getItems.bind(this)
  }

  getItems() {
    const { items, onSearch } = this.props
    const { innerSearch } = this.state
    if (innerSearch && !onSearch) {
      return defaultFilterFunction(innerSearch, items)
    }
    return items
  }

  handleChangeSearchValue(value) {
    this.setState({ innerSearch: value })
  }

  handleSearch(value) {
    const { onSearch } = this.props
    if (onSearch) {
      onSearch(value)
    }
  }

  toggleOpen(value) {
    const { disabled, onBlur, onFocus } = this.props
    if (!disabled) {
      const open = value === undefined ? !this.state.open : value
      if (this.state.open !== open) {
        if (open) {
          onFocus()
        } else {
          onBlur()
          this.handleSearch()
        }
      }
      this.setState({ open, innerSearch: undefined })
    }
  }

  handleChange(value) {
    const { multi, onChange } = this.props
    if (!multi) this.toggleOpen(false)
    onChange(value)
  }

  renderDisplayValue = () => {
    const {
      items,
      values,
      label,
      placeHolder,
      showSearch,
      missingValueResolver,
    } = this.props
    const { open, innerSearch } = this.state
    if (open && showSearch) {
      return (
        <TInput {...{
          'data-cy': `${label}_search`,
          inputClassName: style.search,
          autoFocus: true,
          value: innerSearch,
          onSearch: this.handleSearch,
          onChange: this.handleChangeSearchValue,
        }} />
      )
    }
    if (!values.length && placeHolder) return placeHolder
    if (values.length === 1) {
      const item = items.find(el => el.value === values[0]) || {}
      return item.selectedLabel || item.label || missingValueResolver(values[0])
    }
    return values.length
  }

  render() {
    const {
      controlClassName,

      type = (this.props.multi ? LIST_TYPES.checkbox : LIST_TYPES.text),
      values,
      label,
      placeHolder,
      showSearch,

      disabled,
      errors,

      children,
    } = this.props

    const { open } = this.state

    return (
      <TClickOutside onClick={() => this.toggleOpen(false)}>
        <div className={classNames(
          controlClassName,
          style.root,
          errors.length && style.error,
          disabled && style.disabled,
          open && style.open,
        )}>
          <span {...{
            className: style.content,
            onClick: showSearch && open ? undefined : () => this.toggleOpen(),
            'data-cy': label || placeHolder,
          }}>
            <span className={values.length ? style.value : style.placeholder}>
              {this.renderDisplayValue()}
            </span>
          </span>
          <TIcon {...{
            className: style.control,
            size: 40,
            type: ICONS_TYPES.arrow,
            rotate: open ? ROTATE_TYPES.down : ROTATE_TYPES.up,
            onClick: () => this.toggleOpen(),
          }} />
          <div className={classNames(style.optionsContainer, !open && style.hide)}>
            <List {...{
              ...this.props,
              type,
              items: this.getItems(),
              onChange: this.handleChange,
            }} />
            {
              !!children &&
              <div className={style.children}>
                {children}
              </div>
            }
          </div>
        </div>
      </TClickOutside>
    )
  }
}

export default DropDown
