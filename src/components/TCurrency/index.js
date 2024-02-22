import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import { intlObject } from '$trood/localeService'

import style from './index.css'

import { CURRENCIES, CURRENCY_CODES, CURRENCY_SIGN_TYPE, localization } from './constants'

import { toNumber, toMoney } from '$trood/helpers/format'
import { isNotNull } from '$trood/helpers/def'

/**
 * Component for formatting currency.
 */

class TCurrency extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** money value */
    value: (props, propName, componentName) => {
      const currentProp = props[propName]
      if (currentProp !== undefined && Number.isNaN(+currentProp)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName} Expected number or number-like string.`)
      }
      return undefined
    },
    /** currency code CURRENCY_CODES[<ISO 4217 alpha-3 currency code>.toLowerCase]*/
    currency: PropTypes.oneOf(Object.values(CURRENCY_CODES)),
    /** currency sign type is one of CURRENCY_SIGN_TYPE.code, CURRENCY_SIGN_TYPE.name, CURRENCY_SIGN_TYPE.symbol */
    currencySignType: PropTypes.oneOf(Object.values(CURRENCY_SIGN_TYPE)),
    /** short or not */
    short: PropTypes.bool,
    /** set sign */
    sign: PropTypes.node,
    /** show sign or not */
    showSign: PropTypes.bool,
    /** sign class name, for styling sign */
    signClassName: PropTypes.string,
    /** number of decimal places */
    trimCount: PropTypes.number,
    /** zero is value or not */
    zeroIsValue: PropTypes.bool,
    /** default empty message */
    defaultEmptyMessage: PropTypes.string,
  }

  static defaultProps = {
    currencySignType: CURRENCY_SIGN_TYPE.symbol,
    short: false,
    showSign: true,
    trimCount: 2,
    zeroIsValue: true,
    defaultEmptyMessage: '-',
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
      decimalRequired,
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
    let val = value.toString()

    if (decimalRequired) {
      let decimal = Math.round((value % 1) * (10 ** decimalRequired)).toString()
      while (decimal.length < decimalRequired) {
        decimal = '0' + decimal
      }
      val = parseInt(val) + '.' + decimal
    }

    return toNumber(val, trimCount)
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
      value,
      defaultEmptyMessage,
      zeroIsValue,
    } = this.props

    let sign = this.props.sign
    if ((CURRENCIES[currency] || {})[currencySignType]) {
      sign = CURRENCIES[currency][currencySignType]
    }
    if ((localization[currencySignType] || {})[currency]) {
      sign = intlObject.intl.formatMessage(localization[currencySignType][currency])
    }

    if ((isNaN(value) || !isNotNull(value)) || (value === 0 && !zeroIsValue)) {
      return defaultEmptyMessage
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

export { CURRENCIES, CURRENCY_CODES, CURRENCY_SIGN_TYPE }

export default TCurrency
