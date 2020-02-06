import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import style from './index.css'
import classNames from 'classnames'


class Logo extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    size: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
  }

  render() {
    const { className, size } = this.props
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
