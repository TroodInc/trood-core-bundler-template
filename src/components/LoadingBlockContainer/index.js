import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

import LoadingIndicator from '$trood/components/LoadingIndicator'


class LoadingBlockContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    isBlocked: PropTypes.bool,
    children: PropTypes.node,
  }

  static defaultProps = {
    className: '',
    isBlocked: false,
  }

  render() {
    const {
      isBlocked,
      className,
      children,
    } = this.props

    return (
      <div {...{
        className: classNames(style.root, className),
      }} >
        {isBlocked &&
          <div className={style.blockingArea}>
            <div className={style.indicator}>
              <LoadingIndicator />
            </div>
          </div>
        }
        {children}
      </div>
    )
  }
}

export default LoadingBlockContainer
