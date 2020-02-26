import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import style from './index.css'

import LoadingIndicator from '$trood/components/LoadingIndicator'

/**
 * Component for loading block container.
 */

class LoadingBlockContainer extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** show loading indicator or not */
    isBlocked: PropTypes.bool,
    /** children node */
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
