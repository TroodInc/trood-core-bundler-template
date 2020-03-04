import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink } from 'react-router-dom'

import { stringify } from 'qs'

/**
 * Component for query link.
 */

class QueryLink extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    activeClassName: PropTypes.string,
    /** active style NavLink or Link */
    activeStyle: PropTypes.bool,
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
      activeClassName,
      activeStyle,
      to,
    } = this.props

    const LinkComp = activeClassName || activeStyle ? NavLink : Link

    return (
      <LinkComp {...this.props} to={{ to, search: stringify(to.query) }} />
    )
  }
}

export default QueryLink

export * from './constants'
