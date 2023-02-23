/* global __webpack_hash__ */
/* eslint-disable camelcase */
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { IntlProvider } from 'react-intl'
import moment from 'moment'
import lodashGet from 'lodash/get'

import { api, forms } from 'redux-restify'

import { STATIC_API_NAME } from '$trood/staticApiUrlSchema'
import { noSlashEnforceUrl } from '$trood/apiUrlSchema'

import { DEFAULT_LOCALE } from '../../constants'

import IntlInjector from '../IntlInjector'

import systemConfig from '$trood/config'

//Polyfils
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/polyfill-locales'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill-locales'

const locales = lodashGet(systemConfig, ['services', 'locale', 'availableLocales']) || []

const defaultLocale = lodashGet(systemConfig, ['services', 'locale', 'defaultLocale'])

class LocalizeServiceProvider extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    localeServiceForm: PropTypes.object,
  }

  static defaultProps = {
    className: '',
  }

  constructor(props) {
    super(props)

    this.state = {
      messages: {},
      locale: DEFAULT_LOCALE,
    }

    this.loadLocales = this.loadLocales.bind(this)
  }

  componentDidMount() {
    this.loadLocales()
  }

  componentDidUpdate(prevProps) {
    this.loadLocales(prevProps)
  }

  loadLocales(prevProps) {
    const { localeServiceForm, apiActions } = this.props

    if (prevProps && localeServiceForm.selectedLocale === prevProps.localeServiceForm.selectedLocale) {
      return
    }
    moment.locale(localeServiceForm.selectedLocale)

    let fileName = localeServiceForm.selectedLocale
    if (!locales.find(l => l.code === fileName)) fileName = defaultLocale
    if (process.env.PROD) fileName = `${fileName}_${__webpack_hash__}`
    apiActions
      .callGet({
        apiName: STATIC_API_NAME,
        url: `/locale-data/${fileName}.json`,
        getEntityUrl: noSlashEnforceUrl,
      })
      .then(({ data }) => {
        this.setState(() => ({
          messages: data,
          locale: localeServiceForm.selectedLocale || DEFAULT_LOCALE,
        }))
      })
  }

  render() {
    const {
      children,
    } = this.props
    return (
      <IntlProvider
        {...{
          ...this.state,
          key: this.state.locale,
        }}
      >
        <React.Fragment>
          <IntlInjector />
          {children}
        </React.Fragment>
      </IntlProvider>
    )
  }
}

const mapStateToProps = (state) => ({
  localeServiceForm: forms.selectors.localeServiceForm.getForm(state),
})

const mapDispatchToProps = (dispatch) => ({
  apiActions: bindActionCreators(api.actions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(LocalizeServiceProvider)
