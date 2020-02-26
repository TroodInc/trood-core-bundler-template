import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import style from './index.css'

import { defineMessages } from 'react-intl'
import { intlObject } from '$trood/localeService'

import TButton, { BUTTON_COLORS, BUTTON_TYPES } from '$trood/components/TButton'
import LoadingIndicator from '$trood/components/LoadingIndicator'

export const messages = defineMessages({
  loadMore: {
    id: 'components.LoadMoreButton.load_more',
    defaultMessage: 'Load more...',
  },
})

/**
 * Component for output Load More Button.
 */

class LoadMoreButton extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** loading finish or not */
    isLoading: PropTypes.bool,
    /** button label text */
    label: PropTypes.node,
    /** onClick function, for Button */
    onClick: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    isLoading: false,
    onClick: () => {},
  }

  render() {
    const {
      className,
      label = intlObject.intl.formatMessage(messages.loadMore),
      isLoading,
      onClick,

    } = this.props

    return (
      <div {...{
        className: classNames(style.root, className),
      }} >
        <LoadingIndicator {...{
          className: isLoading ? style.indicator : style.hidden,
          animationStop: !isLoading,
        }} />
        <TButton {...{
          className: isLoading ? style.hidden : style.button,
          label,
          type: BUTTON_TYPES.text,
          color: BUTTON_COLORS.gray,
          onClick: () => {
            onClick()
          },
        }} />
      </div>
    )
  }
}

export default LoadMoreButton
