import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import QueryRedirect from '$trood/components/QueryRedirect'

import { getDisplayName } from '$trood/helpers/react'


// TODO by @deylak make this work for updating form from url(may be, we should check, if a user came from direct url)
export default (fieldsToSyncArg) => (WrappedComponent) => {
  const fieldsToSync = Array.isArray(fieldsToSyncArg) ? fieldsToSyncArg : [fieldsToSyncArg]
  class WithFormUrlSync extends PureComponent {
    static displayName = `withFormUrlSync(${getDisplayName(WrappedComponent)})`

    render() {
      const {
        location,
        form,
      } = this.props

      const newQuery = fieldsToSync.reduce((memo, field) => {
        if (location.query[field] !== form[field]) {
          return {
            ...memo,
            [field]: form[field],
          }
        }
        return memo
      }, {})

      if (Object.keys(newQuery).length) {
        return (
          <QueryRedirect {...{
            to: {
              pathname: location.pathname,
              query: {
                ...location.query,
                ...newQuery,
              },
            },
          }} />
        )
      }

      return <WrappedComponent {...this.props} />
    }
  }
  return withRouter(WithFormUrlSync)
}
