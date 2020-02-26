import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { Redirect} from 'react-router-dom'

import { stringify } from 'qs'

/**
 * Component for query redirect.
 */

class QueryRedirect extends PureComponent {
  static propTypes = {
    /** pathname */
    to: PropTypes.string,
  }


  render() {
    const {
      to,
    } = this.props

    return (
      <Redirect {...this.props} to={{ to, search: stringify(to.query) }} />
    )
  }
}

export default QueryRedirect
