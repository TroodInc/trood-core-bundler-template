import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import debounce from 'lodash/debounce'

import style from './index.css'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'

import { MOUSE_EVENT_DEBOUNCE } from './constants'


const defaultIconProps = {
  type: ICONS_TYPES.star,
  size: 32,
  activeIconClassName: style.yellow,
  inActiveIconClassName: style.gray,
}

class Rating extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    label: PropTypes.node,
    value: PropTypes.number,
    icon: PropTypes.shape({
      type: PropTypes.oneOf(Object.values(ICONS_TYPES)),
      size: PropTypes.number,
      className: PropTypes.string,
      activeIconClassName: PropTypes.string,
      inActiveIconClassName: PropTypes.string,
    }),

    disabled: PropTypes.bool,

    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  }

  static defaultProps = {
    maxRating: 5,

    icon: defaultIconProps,

    onChange: () => {},
    onBlur: () => {},
    onFocus: () => {},
  }

  constructor(props) {
    super(props)

    this.debouncedMouseLeave = debounce(this.props.onBlur, MOUSE_EVENT_DEBOUNCE)
    this.debouncedMouseEnter = debounce(this.props.onFocus, MOUSE_EVENT_DEBOUNCE)
  }

  render() {
    const {
      className,
      maxRating,
      value,
      label,
      disabled,

      icon,

      onBlur,
      onFocus,
      onChange,
    } = this.props

    const ratingMaxArray = (new Array(maxRating)).fill(0)
    const iconProps = {
      ...defaultIconProps,
      ...icon,
    }

    return (
      <div {...{
        className: classNames(style.root, disabled && style.disabled, className),
        onMouseLeave: () => this.debouncedMouseLeave(),
        onMouseEnter: () => this.debouncedMouseEnter(),
        'data-cy': label,
      }}>
        {ratingMaxArray.map((_, index) => {
          const isActive = index + 1 <= Math.round(maxRating * value / 100)

          return (
            <TIcon {...{
              ...iconProps,
              key: index,
              onClick: () => onChange(100 * (index + 1) / maxRating),
              className: classNames(
                style.icon,
                iconProps.className,
                isActive ? iconProps.activeIconClassName : iconProps.inActiveIconClassName,
              ),
            }} />
          )
        })}
      </div>
    )
  }
}

export default Rating
