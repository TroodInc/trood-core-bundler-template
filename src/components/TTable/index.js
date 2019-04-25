import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import deepEqual from 'deep-equal'

import style from './index.css'

import { isDefAndNotNull } from '$trood/helpers/def'
import TCheckbox, { CHECK_COLORS } from '$trood/components/TCheckbox'
import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'


const equal = (newItem, oldArray) => {
  if (isDefAndNotNull(newItem.id)) return oldArray.findIndex(item => item.id === newItem.id)
  return oldArray.findIndex(item => deepEqual(newItem, item))
}

class TTable extends PureComponent {
  static propTypes = {
    modelMetaData: PropTypes.func,
    header: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.node,
      className: PropTypes.string,
      show: PropTypes.bool,
      model: PropTypes.func.isRequired,
      // Used for sorting
      name: PropTypes.string,
      sortable: PropTypes.bool,
    })),
    selectedItems: PropTypes.arrayOf(PropTypes.any),
    body: PropTypes.arrayOf(PropTypes.object),
    checking: PropTypes.bool,
    onCheckedChange: PropTypes.func,
    className: PropTypes.string,
    headerClassName: PropTypes.string,
    rowClassName: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
    rowKey: PropTypes.func,
    onRowClick: PropTypes.func,

    sortingColumn: PropTypes.string,
    sortingOrder: PropTypes.oneOf([-1, 1]),
    onSort: PropTypes.func,
  }

  static defaultProps = {
    header: [],
    body: [],
    checking: false,
    onCheckedChange: () => {},
    onRowClick: () => {},
    className: '',
    rowClassName: '',
    headerClassName: '',
  }

  constructor(props) {
    super(props)
    this.state = {
      check: props.body.map((item, index) => {
        if (isDefAndNotNull(item.replaceCheck)) {
          return item.replaceCheck
        }
        if (props.selectedItems) {
          return props.selectedItems.includes(this.getRowKey(item, index, props.body))
        }
        return false
      }),
    }
    this.getCheckedCount = this.getCheckedCount.bind(this)
    this.getChecked = this.getChecked.bind(this)
    this.checkItem = this.checkItem.bind(this)
    this.checkAll = this.checkAll.bind(this)
    this.getRowKey = this.getRowKey.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checking &&
      (this.props.body !== nextProps.body || this.props.selectedItems !== nextProps.selectedItems)
    ) {
      this.setState({
        check: nextProps.body.map((item, index) => {
          if (isDefAndNotNull(item.replaceCheck)) {
            return item.replaceCheck
          }
          if (nextProps.selectedItems) {
            return nextProps.selectedItems.includes(this.getRowKey(item, index, nextProps.body))
          }
          const equalIndex = equal(item, this.props.body)
          if (equalIndex > -1) return this.state.check[equalIndex]
          return false
        }),
      })
    }
  }

  getRowKey(row, r, body) {
    return this.props.rowKey ? this.props.rowKey(row, r, body) : (row.id || r)
  }

  getCheckedCount() {
    return this.state.check.reduce((a, b) => +a + +b, 0)
  }

  getChecked() {
    return this.state.check
      .map((item, i) => (item ? { index: i, item: this.props.body[i] } : null))
      .filter(item => item !== null)
  }

  checkItem(index) {
    const check = this.state.check.slice()
    check[index] = !check[index]
    this.setState({ check }, () => this.props.onCheckedChange(this.getChecked()))
  }

  checkAll() {
    const check = this.props.body.length === this.getCheckedCount()
    this.setState(
      { check: this.props.body.map(() => !check) },
      () => this.props.onCheckedChange(this.getChecked()),
    )
  }

  render() {
    const {
      modelMetaData,
      header,
      body,
      checking,
      className,
      headerClassName,
      rowClassName,
      onRowClick,
      sortingColumn,
      sortingOrder,
      onSort,
    } = this.props
    const { check } = this.state

    return (
      <table className={classNames(style.table, className)}>
        <thead>
          <tr className={headerClassName}>
            {checking &&
              <th className={style.checkCell}>
                <TCheckbox {...{
                  value: this.getCheckedCount() === check.length,
                  onChange: this.checkAll,
                  color: CHECK_COLORS.orange,
                }} />
              </th>
            }
            {header.filter(item => item.show !== false).map((item, i) => {
              return (
                <th key={i} className={item.className}>
                  <div {...{
                    className: item.sortable ? style.headerWrapperSortable : style.headerWrapper,
                    'data-cy': item.title,
                    onClick: () => {
                      if (item.sortable) {
                        onSort(item.name, sortingOrder === -1 ? 1 : -1)
                      }
                    },
                  }}>
                    {item.title}
                    {item.sortable && sortingColumn === item.name &&
                      <TIcon {...{
                        type: ICONS_TYPES.arrow,
                        rotate: sortingOrder === -1 ? ROTATE_TYPES.up : ROTATE_TYPES.down,
                        className: style.sortIcon,
                        size: 16,
                      }} />
                    }
                    {item.sortable && sortingColumn !== item.name &&
                      <div className={style.sortingPlaceholder} />
                    }
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className={style.tbody}>
          {body.map((row, r) => {
            let currentMetaData
            if (modelMetaData) {
              currentMetaData = modelMetaData(row, r, body)
            }
            return (
              <tr {...{
                onClick: () => onRowClick(row, r, body),
                key: this.getRowKey(row, r, body),
                className: classNames(
                  row.rowClassName,
                  typeof rowClassName === 'function' ? rowClassName(row, r, body, currentMetaData) : rowClassName,
                ),
              }}>
                {checking &&
                  <td className={style.checkCell} data-cy={`table_cell_${r}_checkbox`}>
                    <TCheckbox {...{
                      value: check[r],
                      onChange: () => this.checkItem(r),
                      stopPropagation: true,
                      color: CHECK_COLORS.orange,
                    }} />
                  </td>
                }
                {header.filter(item => item.show !== false).map((item, i) => (
                  <td {...{
                    'data-cy': `table_cell_${r}_${i}`,
                    key: i,
                    className: item.className,
                    colSpan: item.colSpan && item.colSpan(row, r, body),
                  }}>
                    {item.model(row, r, body, currentMetaData)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}

export default TTable
