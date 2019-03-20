import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import deepEqual from 'deep-equal'

import { getDisplayName } from '$trood/helpers/react'


export default (fieldsToSyncArg) => (WrappedComponent) => {
  const fieldsToSync = Array.isArray(fieldsToSyncArg) ? fieldsToSyncArg : [fieldsToSyncArg]
  class WithUrlFormSync extends PureComponent {
    static displayName = `withFormUrlSync(${getDisplayName(WrappedComponent)})`

    constructor(props) {
      super(props)

      this.syncForm = this.syncForm.bind(this)
    }

    componentDidMount() {
      this.syncForm()
    }

    componentDidUpdate(prevProps) {
      const hasChanges = fieldsToSync
        .some(field => !deepEqual(prevProps.location.query[field], this.props.location.query[field]))
      if (hasChanges) this.syncForm()
    }

    syncForm() {
      const {
        location,
        form,
        formActions,
      } = this.props

      const formChanges = fieldsToSync.reduce((memo, field) => {
        if (!deepEqual(form[field], location.query[field])) {
          return {
            ...memo,
            [field]: location.query[field],
          }
        }
        return memo
      }, {})

      if (Object.keys(formChanges).length) {
        formActions.changeSomeFields(formChanges)
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
  return withRouter(WithUrlFormSync)
}
