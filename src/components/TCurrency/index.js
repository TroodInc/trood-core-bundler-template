import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import { intlObject } from '$trood/localeService'

import style from './index.css'

import { CURRENCIES, CURRENCY_CODES, CURRENCY_SIGN_TYPE, localization } from './constants'

import { toNumber, toMoney } from '$trood/helpers/format'

/**
 * Component for formatting currency.
 *
 * Currency code: AED, AFN, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL,
 * BSD, BTN, BWP, BYN, BZD, CAD, CDF, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ERN, ETB, EUR,
 * FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, IRR, ISK, JMD, JOD,
 * JPY, KES, KGS, KHR, KMF, KPW, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP,
 * MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON,
 * RSD, RUB, RWF, SAR, SBD, SCR, SDG, SEK, SGD, SHP, SLL, SOS, SRD, SSP, STN, SVC, SYP, SZL, THB, TJS, TMT, TND, TOP,
 * TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW, ZWL
 */

class TCurrency extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** money value */
    value: (props, propName, componentName) => {
      const currentProp = props[propName]
      if (Number.isNaN(+currentProp)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName} Expected number or number-like string.`)
      }
      return undefined
    },
    /** currency code you can see in description */
    currency: PropTypes.oneOf(Object.values(CURRENCY_CODES)),
    /** currency sign types: 'code', 'name', 'symbol' */
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
