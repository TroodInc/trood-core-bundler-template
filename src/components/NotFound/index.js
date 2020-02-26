import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

/**
 * Component for output text 404.
 */

class NotFound extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  render() {
    const {
      className,
    } = this.props

    return (
      <div className={classNames(style.root, className)}>
        404
      </div>
    )
  }
}

export default NotFound
