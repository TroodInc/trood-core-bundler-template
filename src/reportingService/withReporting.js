import React, { PureComponent } from 'react'
import { createSelector } from 'reselect'
import deepEqual from 'deep-equal'

import { REPORT_TYPES, getReportingLoadingPropName } from './constants'

import { getDisplayName } from '$trood/helpers/react'
import objectHash from 'object-hash'


export default (
  propName,
  {
    reportId,
    connectionCode,
    query: {
      querySelectors = [],
      queryFunction = () => {},
    } = {},
    filter: {
      filterSelectors = [],
      filterFunction = () => {},
    } = {},
  },
) => (WrappedComponent) => {
  const memoizedQuery = createSelector(querySelectors, queryFunction)
  const memoizedFilter = createSelector(filterSelectors, filterFunction)

  return class extends PureComponent {
    static displayName = `withReporting(${getDisplayName(WrappedComponent)})`

    constructor(props) {
      super(props)
      this.prevQuery = undefined
      this.prevFilter = undefined
      this.prevType = undefined

      this.calculateReport = this.calculateReport.bind(this)
    }

    componentDidMount() {
      this.calculateReport()
    }

    componentDidUpdate() {
      this.calculateReport()
    }

    calculateReport() {
      const currentQuery = memoizedQuery(this.props)
      const currentFilter = memoizedFilter(this.props)
      const type = connectionCode ? REPORT_TYPES.config : REPORT_TYPES.prepared

      this.uniqPropName = propName + objectHash({
        currentQuery,
        currentFilter,
        type,
      })

      const hasChanges = !deepEqual(this.prevQuery, currentQuery) ||
        !deepEqual(this.prevFilter, currentFilter) ||
        !deepEqual(this.reportId, reportId) ||
        !deepEqual(this.connectionCode, connectionCode)

      if (hasChanges) {
        this.props.reportingActions.getReportByQuery({
          propName: this.uniqPropName,
          reportId,
          type,
          connectionCode,
          query: currentQuery,
          filter: currentFilter,
        })
        this.prevQuery = currentQuery
        this.prevFilter = currentFilter
        this.reportId = reportId
        this.connectionCode = connectionCode
      }
    }

    render() {
      const {
        reportingServiceData,
        ...other
      } = this.props

      const reportLoadingPropName = getReportingLoadingPropName(propName)
      const reportLoadingUniqPropName = getReportingLoadingPropName(this.uniqPropName)
      return (
        <WrappedComponent {...{
          ...other,
          reportingServiceData,
          [propName]: reportingServiceData[this.uniqPropName],
          [reportLoadingPropName]: reportingServiceData[reportLoadingUniqPropName],
        }} />
      )
    }
  }
}
