import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { Redirect} from 'react-router-dom'

import { stringify } from 'qs'

/**
 * Component for query redirect.
 */

class QueryRedirect extends PureComponent {
  static propTypes = {
    /** redirect settings*/
    to: PropTypes.oneOfType([
      /** a string representing the path to link to */
      PropTypes.string,
      /** object with settings */
      PropTypes.shape({
        /** a string representing the path to link to */
        pathname: PropTypes.string,
        /** a string representation of query parameters */
        search: PropTypes.string,
        /** state to persist to the location */
        state: PropTypes.object,
      }),
    ]),
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
