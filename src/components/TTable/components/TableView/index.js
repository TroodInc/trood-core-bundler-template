import React from 'react'
import classNames from 'classnames'

import TCheckbox, { CHECK_COLORS } from '$trood/components/TCheckbox'
import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'

import style from './index.css'


const TableView = ({
  className,
  headerClassName,

  checking,
  check,
  getCheckedCount,
  checkAll,
  checkItem,

  header,
  body,

  onSort,
  sortingOrder,
  sortingColumn,

  modelMetaData,
  onRowClick,
  getRowKey,
  rowClassName,
}) => (
  <table className={classNames(style.table, className)}>
    <thead>
      <tr className={headerClassName}>
        {checking &&
          <th className={style.checkCell}>
            <TCheckbox {...{
              value: getCheckedCount() === check.length,
              onChange: checkAll,
              color: CHECK_COLORS.orange,
            }} />
          </th>
        }
        {header.map((item, i) => {
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
            key: getRowKey(row, r, body),
            className: classNames(
              row.rowClassName,
              typeof rowClassName === 'function' ? rowClassName(row, r, body, currentMetaData) : rowClassName,
            ),
          }}>
            {checking &&
              <td className={style.checkCell} data-cy={`table_cell_${r}_checkbox`}>
                <TCheckbox {...{
                  value: check[r],
                  onChange: () => checkItem(r),
                  stopPropagation: true,
                  color: CHECK_COLORS.orange,
                }} />
              </td>
            }
            {header.map((item, i) => (
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

export default TableView
