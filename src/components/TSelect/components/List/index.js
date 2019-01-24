import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import deepEqual from 'deep-equal'

import style from './index.css'

import {
  LIST_TYPES,
  LIST_ORIENTATION,
  SCROLL_THRESHOLD,
  EMPTY_ITEMS_LABEL,
} from './constants'

import TRadioButton from '$trood/components/TRadioButton'
import TCheckbox from '$trood/components/TCheckbox'
import TToggle from '$trood/components/TToggle'

import TileListItem from '../TileListItem'
import TextListItem from '../TextListItem'


const getItemComponent = (type) => {
  switch (type) {
    case LIST_TYPES.radio:
      return TRadioButton
    case LIST_TYPES.checkbox:
      return TCheckbox
    case LIST_TYPES.toggle:
      return TToggle
    case LIST_TYPES.tile:
      return TileListItem
    default:
      return TextListItem
  }
}

const valueTypes = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.bool,
])

class List extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,

    type: PropTypes.oneOf(Object.values(LIST_TYPES)),
    orientation: PropTypes.oneOf(Object.values(LIST_ORIENTATION)),
    multi: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: valueTypes,
      label: PropTypes.node,
    })),
    values: PropTypes.arrayOf(valueTypes),
    emptyItemsLabel: PropTypes.node,

    maxRows: PropTypes.number,
    autoScroll: PropTypes.bool,
    disabled: PropTypes.bool,

    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onScrollToEnd: PropTypes.func,
  }

  static defaultProps = {
    type: LIST_TYPES.text,
    orientation: LIST_ORIENTATION.vertical,
    items: [],
    values: [],
    emptyItemsLabel: EMPTY_ITEMS_LABEL,

    autoScroll: true,

    onChange: () => {},
    onBlur: () => {},
    onScrollToEnd: () => {},
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.calcMaxHeight = this.calcMaxHeight.bind(this)
    this.scrollToFirstSelected = this.scrollToFirstSelected.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  componentDidMount() {
    this.calcMaxHeight()
    this.scrollToFirstSelected()
    if (this.list) this.list.addEventListener('scroll', this.handleScroll)
  }

  componentDidUpdate(prevProps) {
    this.calcMaxHeight()
    if (!deepEqual(prevProps.items, this.props.items)) {
      this.scrollToEndFired = false
    }
  }

  calcMaxHeight() {
    const { maxRows } = this.props
    if (maxRows && this.list) {
      const maxHeight = this.list.firstChild.offsetHeight * maxRows
      if (!Number.isNaN(maxHeight)) this.setState({ maxHeight })
    }
  }

  scrollToFirstSelected() {
    const {
      maxRows,
      autoScroll,
      items,
      values,
    } = this.props
    if (autoScroll && maxRows && values.length && this.list) {
      const firstSelected = items.find(item => values.some(v => v === item.value)) || {}
      const firstSelectedElement = this[`option${firstSelected.value}`]
      setTimeout(() => {
        if (firstSelectedElement && this.list) {
          const newScrollPositions =
            firstSelectedElement.offsetTop + firstSelectedElement.offsetHeight - this.list.offsetHeight
          this.list.scrollTop = newScrollPositions < this.list.scrollTop ? this.list.scrollTop : newScrollPositions
        }
      }, 0)
    }
  }

  handleScroll() {
    if (this.list) {
      const scrollFromBottom = this.list.scrollHeight - this.list.scrollTop - this.list.clientHeight
      if (!this.scrollToEndFired && scrollFromBottom < SCROLL_THRESHOLD) {
        this.props.onScrollToEnd()
        this.scrollToEndFired = true
      }
    }
  }

  handleSelect(value) {
    const {
      multi,
      values,
      onChange,
      onBlur,
    } = this.props
    const newValues = values.filter(v => v !== value)
    if (values.length === newValues.length) {
      if (multi) {
        onChange([...values, value])
      } else {
        onChange([value])
      }
    } else {
      onChange(newValues)
    }
    onBlur()
  }

  render() {
    const {
      className,
      itemClassName,
      type,
      orientation,
      items,
      values,
      emptyItemsLabel,
      disabled,
    } = this.props

    const { maxHeight } = this.state

    const ItemComponent = getItemComponent(type)

    const isSelected = item => values.some(el => el === item.value)

    return (
      <ul {...{
        className: classNames(style.root, style[orientation], className),
        ref: (node) => {
          this.list = node
        },
        style: { maxHeight },
      }}>
        {items.map(item => (
          <li {...{
            className: type === LIST_TYPES.tile ? style.tileItemWrapper : style.itemWrapper,
            key: item.value || `${item.value}`,
            'data-cy': item.label || item.value,
            ref: (node) => {
              this[`option${item.value}`] = node
            },
          }}>
            <ItemComponent {...{
              className: classNames(type === LIST_TYPES.tile ? style.tileItem : style.item, itemClassName),
              value: isSelected(item),
              label: item.label || item.value,
              disabled,
              onChange: () => this.handleSelect(item.value),
            }} />
          </li>
        ))}
        {!items.length && emptyItemsLabel &&
          <li className={style.empty}>
            {emptyItemsLabel}
          </li>
        }
      </ul>
    )
  }
}

export { LIST_TYPES, LIST_ORIENTATION } from './constants'

export default List