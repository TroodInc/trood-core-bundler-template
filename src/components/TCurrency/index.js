import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import { intlObject } from '$trood/localeService'

import style from './index.css'

import { CURRENCIES, CURRENCY_CODES, CURRENCY_SIGN_TYPE, localization } from './constants'

import { toNumber, toMoney } from '$trood/helpers/format'


class TCurrency extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    value: (props, propName, componentName) => {
      const currentProp = props[propName]
      if (Number.isNaN(+currentProp)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName} Expected number or number-like string.`)
      }
      return undefined
    },
    currency: PropTypes.oneOf(Object.values(CURRENCY_CODES)),
    currencySignType: PropTypes.oneOf(Object.values(CURRENCY_SIGN_TYPE)),
    short: PropTypes.bool,
    sign: PropTypes.node,
    showSign: PropTypes.bool,
    signClassName: PropTypes.string,
    trimCount: PropTypes.number,
  }

  static defaultProps = {
    value: 0,
    currencySignType: CURRENCY_SIGN_TYPE.symbol,
    short: false,
    showSign: true,
    trimCount: 2,
  }

  constructor(props) {
    super(props)

    this.getFormatValue = this.getFormatValue.bind(this)
  }

  getFormatValue() {
    const {
      value,
      short,
      trimCount,
    } = this.props

    if (short) {
      const valueObj = toMoney(value)
      return (
        <span>
          {toNumber(valueObj.value.toString(), trimCount)}
          {valueObj.postfix}
        </span>
      )
    }
    return toNumber(value.toString(), trimCount)
  }

  render() {
    const {
      className,
      currency = (
        (typeof window === 'object' ? window.localStorage.getItem('defaultCurrency') : undefined) ||
        process.env.DEFAULT_CURRENCY ||
        CURRENCY_CODES.rub
      ).toUpperCase(),
      currencySignType,
      showSign,
      signClassName,
    } = this.props

    let sign = this.props.sign
    if ((CURRENCIES[currency] || {})[currencySignType]) {
      sign = CURRENCIES[currency][currencySignType]
    }
    if ((localization[currencySignType] || {})[currency]) {
      sign = intlObject.intl.formatMessage(localization[currencySignType][currency])
    }

    return (
      <span className={classNames(style.root, className)}>
        {this.getFormatValue()}
        {showSign &&
          <span className={classNames(style.rub, signClassName)}>
            {sign}
          </span>
        }
      </span>
    )
  }
}

export { CURRENCY_CODES, CURRENCY_SIGN_TYPE }

export default TCurrency
