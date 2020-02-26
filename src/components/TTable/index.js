import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import deepEqual from 'deep-equal'

import { AppContext } from '$trood/app/constants' // import from $trood/app causes an error in styleguidist

import { isDefAndNotNull } from '$trood/helpers/def'

import TableView from './components/TableView'
import ListView from './components/ListView'

const equal = (newItem, oldArray) => {
  if (isDefAndNotNull(newItem.id)) return oldArray.findIndex(item => item.id === newItem.id)
  return oldArray.findIndex(item => deepEqual(newItem, item))
}

/**
 * Component for output table.
 */

class TTable extends PureComponent {
  static propTypes = {
    /** function for set modelMetaData */
    modelMetaData: PropTypes.func,
    /** header settings */
    header: PropTypes.arrayOf(PropTypes.shape({
      /** header title */
      title: PropTypes.node,
      /** class name for header */
      className: PropTypes.string,
      /** show header or not */
      show: PropTypes.bool,
      /** item model */
      model: PropTypes.func.isRequired,
      // Used for sorting
      /** column name, used for sorting*/
      name: PropTypes.string,
      /** sortable column or not */
      sortable: PropTypes.bool,
    })),
    /** list title text */
    listHeaderModel: PropTypes.func,
    /** list title text */
    listTitle: PropTypes.string,
    /** array selected items */
    selectedItems: PropTypes.arrayOf(PropTypes.any),
    /** array with data */
    body: PropTypes.arrayOf(PropTypes.object),
    /** show checking or not */
    checking: PropTypes.bool,
    /** onCheckedChange function */
    onCheckedChange: PropTypes.func,
    /** class name for component */
    className: PropTypes.string,
    /** class name for header */
    headerClassName: PropTypes.string,
    /** class name for row */
    rowClassName: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
    /** set row key */
    rowKey: PropTypes.func,
    /** onClick function */
    onRowClick: PropTypes.func,
    /** sorting column name */
    sortingColumn: PropTypes.string,
    /** sorting order */
    sortingOrder: PropTypes.oneOf([-1, 1]),
    /** onSort function */
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
    const { header } = this.props
    const { check } = this.state
    const headerFiltered = header.filter(item => item.show !== false)

    return (
      <AppContext.Consumer>
        {({ media = {} }) => {
          if (media.portable) {
            return (
              <ListView {...{
                ...this.props,

                check,
                checkAll: this.checkAll,
                checkItem: this.checkItem,
                getCheckedCount: this.getCheckedCount,

                header: headerFiltered,

                getRowKey: this.getRowKey,
              }} />
            )
          }

          return (
            <TableView {...{
              ...this.props,

              check,
              getCheckedCount: this.getCheckedCount,
              checkAll: this.checkAll,
              checkItem: this.checkItem,

              header: headerFiltered,

              getRowKey: this.getRowKey,
            }} />
          )
        }}
      </AppContext.Consumer>
    )
  }
}

export default TTable
