import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import style from './index.css'
import classNames from 'classnames'

/**
 * Component for output Logo.
 */

class Logo extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** width and height size in px */
    size: PropTypes.number,
  }

  static defaultProps = {
    className: '',
  }

  render() {
    const {
      size,
      className,
    } = this.props

    return (
      <div {...{
        className: classNames(style.root, className),
        style: {
          width: size,
          height: size,
        },
      }}>
        <img src="/static/img/TroodLogo.png" alt="TROOD" />
      </div>
    )
  }
}


export default Logo
