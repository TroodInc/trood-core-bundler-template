import React, { PureComponent } from 'react'
import { createSelector } from 'reselect'

import { REPORT_TYPES, getReportingLoadingPropName } from './constants'

import { getDisplayName } from '$trood/helpers/react'


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

      const hasChanges =
        this.prevQuery !== currentQuery || this.prevFilter !== currentFilter || this.prevType !== type

      if (hasChanges) {
        this.props.reportingActions.getReportByQuery({
          propName,
          reportId,
          type,
          connectionCode,
          query: currentQuery,
          filter: currentFilter,
        })
        this.prevQuery = currentQuery
        this.prevFilter = currentFilter
        this.prevType = type
      }
    }

    render() {
      const {
        reportingServiceData,
        ...other
      } = this.props

      const reportLoadingPropName = getReportingLoadingPropName(propName)
      return (
        <WrappedComponent {...{
          ...other,
          reportingServiceData,
          [propName]: reportingServiceData[propName] || [],
          [reportLoadingPropName]: reportingServiceData[reportLoadingPropName],
        }} />
      )
    }
  }
}
