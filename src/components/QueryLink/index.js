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
    /** pathname */
    to: PropTypes.string,
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
