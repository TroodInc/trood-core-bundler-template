import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import deepEqual from 'deep-equal'

import style from './index.css'
import { messages } from './constants'

import { intlObject } from '$trood/localeService'

import { AppContext } from '$trood/app'

import { isDefAndNotNull } from '$trood/helpers/def'
import { isReactComponent } from '$trood/helpers/react'
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
    listHeaderModel: PropTypes.func,
    listTitle: PropTypes.string,
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
      listItemExpanded: null,
    }
    this.getCheckedCount = this.getCheckedCount.bind(this)
    this.getChecked = this.getChecked.bind(this)
    this.checkItem = this.checkItem.bind(this)
    this.checkAll = this.checkAll.bind(this)
    this.getRowKey = this.getRowKey.bind(this)
    this.toggleExpand = this.toggleExpand.bind(this)
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

  toggleExpand(rowIndex) {
    const { listItemExpanded } = this.state

    this.setState({ listItemExpanded: listItemExpanded === rowIndex ? null : rowIndex })
  }

  render() {
    const {
      modelMetaData,
      listHeaderModel,
      listTitle,
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
    const { check, listItemExpanded } = this.state
    const headerFiltered = header.filter(item => item.show !== false)

    return (
      <AppContext.Consumer>
        {({ media }) => {
          if (media.portable) {
            const headerItemsSortable = headerFiltered.filter(item => item.sortable)

            return (
              <div className={style.tableList}>
                <div className={style.tableListHeader}>
                  {(checking || listTitle) && (
                    <div className={style.tableListTitleContainer}>
                      {checking &&
                        <TCheckbox {...{
                          className: style.listCheckbox,
                          value: this.getCheckedCount() === check.length,
                          onChange: this.checkAll,
                          color: CHECK_COLORS.orange,
                        }} />
                      }
                      {checking && !listTitle && (
                        <span className={style.tableListTitle}>{intlObject.intl.formatMessage(messages.checkAll)}</span>
                      )}
                      {listTitle && <span className={style.tableListTitle}>{listTitle}</span>}
                    </div>
                  )}
                  {body.length > 0 && headerItemsSortable.length > 0 && (
                    <div className={style.listSortControls}>
                      <span className={style.listSortControlsLabel}>
                        {intlObject.intl.formatMessage(messages.sortBy)}
                      </span>
                      {headerItemsSortable.map((item, index) => (
                        <div {...{
                          key: index,
                          onClick: () => onSort(item.name, sortingOrder === -1 ? 1 : -1),
                          className: style.listSortItem,
                        }}>
                          {item.title}
                          {sortingColumn === item.name &&
                            <TIcon {...{
                              type: ICONS_TYPES.arrow,
                              rotate: sortingOrder === -1 ? ROTATE_TYPES.up : ROTATE_TYPES.down,
                              className: style.sortIcon,
                              size: 16,
                            }} />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {body.map((row, r) => {
                  let currentMetaData
                  if (modelMetaData) {
                    currentMetaData = modelMetaData(row, r, body)
                  }
                  const headerModel = typeof listHeaderModel === 'function'
                    ? listHeaderModel(row, r, body, currentMetaData)
                    : headerFiltered[0] && headerFiltered[0].model(row, r, body, currentMetaData)
                  const expanded = listItemExpanded === r

                  return (
                    <div {...{
                      key: this.getRowKey(row, r, body),
                      className: classNames(
                        style.tableListItemContainer,
                        expanded && style.expanded,
                        row.rowClassName,
                        typeof rowClassName === 'function' ? rowClassName(row, r, body, currentMetaData) : rowClassName,
                      ),
                    }}>
                      <div {...{
                        className: classNames(style.tableListItemHeader, expanded && style.expanded),
                        onClick: () => this.toggleExpand(r),
                      }}>
                        <div className={style.tableListItemTitle}>
                          {checking && (
                            <TCheckbox {...{
                              className: style.listCheckbox,
                              value: check[r],
                              onChange: () => this.checkItem(r),
                              stopPropagation: true,
                              color: CHECK_COLORS.orange,
                            }} />
                          )}
                          <div className={classNames(style.tableListItemTitleText, expanded && style.expanded)}>
                            {isReactComponent(headerModel)
                              ? React.cloneElement(headerModel, { onClick: undefined })
                              : headerModel
                            }
                          </div>
                        </div>
                        <TIcon {...{
                          type: ICONS_TYPES.arrow,
                          rotate: expanded ? 180 : 0,
                          size: 24,
                          className: style.expandIcon,
                        }} />
                      </div>
                      {expanded && (
                        <div className={classNames(
                          style.tableListItemBody,
                          checking && style.tableListItemBodyChecking,
                        )}>
                          {headerFiltered.map((item, i) => (
                            <div {...{
                              key: i,
                              className: classNames(item.className, style.listItemBodyRow),
                            }}>
                              {item.title && <span className={style.tableListItemLabel}>{item.title}:</span>}
                              <div className={style.tableListItemValue}>
                                {item.model(row, r, body, currentMetaData)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }

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
                    {headerFiltered.map((item, i) => (
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
        }}
      </AppContext.Consumer>
    )
  }
}

export default TTable
