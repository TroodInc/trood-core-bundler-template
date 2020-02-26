import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

/**
 * Component for output label.
 */

class TLabel extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** show star "*" or not */
    required: PropTypes.bool,
    /** label text */
    label: PropTypes.node,
  }

  static defaultProps = {
    className: '',
    required: false,
  }

  render() {
    const {
      className,
      required,
      label,
    } = this.props

    return (
      <span className={classNames(style.root, className)}>
        {label}{required && ' *'}
      </span>
    )
  }
}

export default TLabel
