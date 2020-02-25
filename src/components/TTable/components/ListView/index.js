import React, { PureComponent } from 'react'
import classNames from 'classnames'

import { intlObject } from '$trood/localeService'

import { isReactComponent } from '$trood/helpers/react'

import TCheckbox, { CHECK_COLORS } from '$trood/components/TCheckbox'
import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'

import { messages } from '../../constants'
import style from './index.css'


class ListView extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      listItemExpanded: null,
    }

    this.toggleExpand = this.toggleExpand.bind(this)
  }

  toggleExpand(rowIndex) {
    const { listItemExpanded } = this.state

    this.setState({ listItemExpanded: listItemExpanded === rowIndex ? null : rowIndex })
  }

  render() {
    const {
      className,

      listTitle,
      listHeaderModel,

      checking,
      check,
      checkAll,
      checkItem,
      getCheckedCount,

      body,
      header,

      onSort,
      sortingOrder,
      sortingColumn,

      modelMetaData,
      getRowKey,
      rowClassName,
    } = this.props
    const { listItemExpanded } = this.state
    const headerItemsSortable = header.filter(item => item.sortable)

    return (
      <div className={classNames(style.tableList, className)}>
        <div className={style.tableListHeader}>
          {(checking || listTitle) && (
            <div className={style.tableListTitleContainer}>
              {checking &&
                <TCheckbox {...{
                  className: style.listCheckbox,
                  value: getCheckedCount() === check.length,
                  onChange: checkAll,
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
            : header[0] && header[0].model(row, r, body, currentMetaData)
          const expanded = listItemExpanded === r

          return (
            <div {...{
              key: getRowKey(row, r, body),
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
                      onChange: () => checkItem(r),
                      stopPropagation: true,
                      color: CHECK_COLORS.orange,
                    }} />
                  )}
                  <div className={classNames(style.tableListItemTitleText, expanded && style.expanded)}>
                    {isReactComponent(headerModel)
                      ? React.cloneElement(headerModel, {onClick: undefined})
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
                  {header.map((item, i) => (
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
}

export default ListView
