import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addLocaleData, IntlProvider } from 'react-intl'

import { api, forms } from 'redux-restify'

import { STATIC_API_NAME } from '$trood/staticApiUrlSchema'
import { noSlashEnforceUrl } from '$trood/apiUrlSchema'

import {
  DEFAULT_LOCALE,
} from '../../constants'

import IntlInjector from '../IntlInjector'


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
      localeDataLoaded: false,
      localeMessagesLoaded: false,
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
    const {
      localeServiceForm,
      apiActions,
    } = this.props

    if (prevProps && localeServiceForm.selectedLocale === prevProps.localeServiceForm.selectedLocale) {
      return
    }
    this.setState({
      localeDataLoaded: false,
      localeMessagesLoaded: false,
    })

    // Load new intl locale
    const currentScriptTag = document.getElementsByTagName('script')[0]
    const newScript = document.createElement('script')
    newScript.type = 'text/javascript'
    newScript.src = `https://unpkg.com/react-intl@latest/locale-data/${localeServiceForm.selectedLocale}.js`
    newScript.async = true
    currentScriptTag.parentNode.insertBefore(newScript, currentScriptTag)
    newScript.onload = () => {
      if (!window.ReactIntlLocaleData) {
        return
      }
      addLocaleData([...window.ReactIntlLocaleData[localeServiceForm.selectedLocale]])
      this.setState((state) => ({
        localeDataLoaded: true,
        locale: state.localeMessagesLoaded ? localeServiceForm.selectedLocale : DEFAULT_LOCALE,
      }))
    }

    if (localeServiceForm.selectedLocale !== DEFAULT_LOCALE) {
      apiActions.callGet({
        apiName: STATIC_API_NAME,
        url: `/locale-data/${localeServiceForm.selectedLocale}.json`,
        getEntityUrl: noSlashEnforceUrl,
      }).then(({ data }) => {
        this.setState((state) => ({
          messages: data,
          localeMessagesLoaded: true,
          locale: state.localeDataLoaded ? localeServiceForm.selectedLocale : DEFAULT_LOCALE,
        }))
      })
    } else {
      this.setState({
        messages: {},
        localeMessagesLoaded: true,
        locale: DEFAULT_LOCALE,
      })
    }

    /*
    addLocaleData([...intlLocale])
    const reactIntlConfig = {
      locale: localeServiceForm.selectedLocale,
      messages: {},
    }

    const intlProvider = new IntlProvider(reactIntlConfig)
    const appIntl = intlProvider.getChildContext().intl
    */
  }

  render() {
    const {
      // localeServiceForm,

      children,
      // intl,
    } = this.props
    return (
      <IntlProvider {...{
        ...this.state,
        key: this.state.locale,
      }}>
        <React.Fragment>
          <IntlInjector />
          {children}
        </React.Fragment>
      </IntlProvider>
    )
  }
}


const mapStateToProps = state => ({
  localeServiceForm: forms.selectors.localeServiceForm.getForm(state),
})

const mapDispatchToProps = dispatch => ({
  apiActions: bindActionCreators(api.actions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(LocalizeServiceProvider)
