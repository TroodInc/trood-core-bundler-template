import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { toNumber } from '$trood/helpers/format'

import style from './index.css'

import TIcon, { ICONS_TYPES, LABEL_POSITION_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'

import { LOADING_INDICATOR_TYPES } from './constants'

const circleRadius = 40
const circleViewBox = 100

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
    /** default type for rotate you can see in constants, or send number in deg, for icon */
    rotate: PropTypes.oneOfType([
      PropTypes.oneOf(Object.values(ROTATE_TYPES)),
      PropTypes.number,
    ]),
    /** label icon */
    label: PropTypes.node,
    /** label position is one of LABEL_POSITION_TYPES.up, LABEL_POSITION_TYPES.right, LABEL_POSITION_TYPES.down,
     * LABEL_POSITION_TYPES.left, LABEL_POSITION_TYPES.tooltip */
    labelPosition: PropTypes.oneOf(Object.keys(LABEL_POSITION_TYPES)),
    /** color, for Icon */
    color: PropTypes.string,
    /** disabled or not, for Icon */
    disabled: PropTypes.bool,
    /** onClick function, for Icon */
    onClick: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    type: LOADING_INDICATOR_TYPES.spinner,
  }

  render() {
    const {
      className,
      type,
      progress,
      ...other
    } = this.props

    let circleDashOffset = 0
    let circleLength
    if (type === LOADING_INDICATOR_TYPES.circle) {
      circleLength = Math.PI * circleRadius * 2
      circleDashOffset = circleLength * (100 - progress) / 100
    }

    return (
      <div {...{
        className: classNames(style.root, className, style[type]),
      }} >
        {type === LOADING_INDICATOR_TYPES.text &&
          <span>
            loading
            {!!progress && ` (${toNumber(progress)}) `}
            ...
          </span>
        }
        {type === LOADING_INDICATOR_TYPES.spinner &&
          <TIcon {...{
            className: style.spinnerIcon,
            type: ICONS_TYPES.spinner,
            ...other,
          }} />
        }
        {type === LOADING_INDICATOR_TYPES.circle &&
          <svg className={style.circle} viewBox={`0 0 ${circleViewBox} ${circleViewBox}`}>
            <circle {...{
              className: style.circleNotLoaded,
              r: circleRadius,
              cx: circleViewBox / 2,
              cy: circleViewBox / 2,
              fill: 'transparent',
              strokeDasharray: circleLength,
              strokeDashoffset: 0,
            }} />
            <circle {...{
              className: style.circleLoaded,
              r: circleRadius,
              cx: circleViewBox / 2,
              cy: circleViewBox / 2,
              fill: 'transparent',
              strokeDasharray: circleLength,
              strokeDashoffset: Number.isNaN(circleDashOffset) ? `${circleLength}px` : `${circleDashOffset}px`,
            }} />
          </svg>
        }
      </div>
    )
  }
}

export { LOADING_INDICATOR_TYPES } from './constants'

export default LoadingIndicator
