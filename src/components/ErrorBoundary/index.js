import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import style from './index.css'
import basePageLayout from '$trood/styles/basePageLayout.css'

import { messages } from '$trood/mainConstants'
import { intlObject } from '$trood/localeService'


class ErrorBoundary extends PureComponent {
  static propTypes = {
    errorClassName: PropTypes.string,
    children: PropTypes.node,
  }

  static getDerivedStateFromError(error) {
    return {
      error,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      error: undefined,
    }
  }

  render() {
    const { errorClassName, children } = this.props
    const { error } = this.state

    if (error) {
      return (
        <div className={classNames(errorClassName, style.root)}>
          <div className={basePageLayout.blockHeaderContainer}>
            <h2 className={classNames(basePageLayout.blockTitle, style.error)}>
              {intlObject.intl.formatMessage(messages.error).toUpperCase()} {error.message}
            </h2>
          </div>
          <div className={classNames(basePageLayout.blockContent, style.errorInfo)}>
            {error.stack}
          </div>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
