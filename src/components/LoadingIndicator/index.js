import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { toNumber } from 'helpers/format'

import styles from './index.module.css'

import { LOADING_INDICATOR_TYPES } from './constants'

import Circle from './components/Circle'
import Spinner from './components/Spinner'


/**
 * Component for output loading indicator.
 */

class LoadingIndicator extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** set loading indicator type is one of LOADING_INDICATOR_TYPES.text, LOADING_INDICATOR_TYPES.spinner,
     * LOADING_INDICATOR_TYPES.circle */
    type: PropTypes.oneOf(Object.values(LOADING_INDICATOR_TYPES)),
    /** progress loading */
    progress: PropTypes.number,
    /** width and height size icon in px */
    size: PropTypes.number,
  }

  static defaultProps = {
    className: '',
    type: LOADING_INDICATOR_TYPES.spinner,
  }

  render() {
    const {
      className,
      style,
      type,
      progress,
      size,
      animationStop,
    } = this.props

    return (
      <div {...{
        style,
        className: classNames(styles.root, className, styles[type]),
      }} >
        {type === LOADING_INDICATOR_TYPES.text &&
          <span>
            loading
            {!!progress && ` (${toNumber(progress)}) `}
            ...
          </span>
        }
        {type === LOADING_INDICATOR_TYPES.spinner &&
          <Spinner size={size} animationStop={animationStop} />
        }
        {type === LOADING_INDICATOR_TYPES.circle &&
          <Circle size={size} progress={progress} />
        }
      </div>
    )
  }
}

export { LOADING_INDICATOR_TYPES } from './constants'

export default LoadingIndicator
