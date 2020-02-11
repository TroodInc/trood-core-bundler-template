import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import lodashGet from 'lodash/get'

import { forms } from 'redux-restify'

import TClickOutside from '$trood/components/TClickOutside'
import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'

import style from './index.css'

import systemConfig from '$trood/config'


class LocaleSwitch extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    onChange: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      open: false,
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen(value) {
    const open = value === undefined ? !this.state.open : value
    this.setState({ open })
  }

  render() {
    const {
      className,

      onChange,
      localeServiceForm,
      localeServiceFormActions,
    } = this.props

    const { open } = this.state

    const locales = lodashGet(systemConfig, ['services', 'locale', 'availableLocales'])
    if (!locales || locales.length < 2) {
      return null
    }

    const currentLocale =
      locales.find(l => l.code === localeServiceForm.selectedLocale) || { code: localeServiceForm.selectedLocale }

    return (
      <TClickOutside onClick={() => this.toggleOpen(false)}>
        <div {...{
          className: classNames(style.root, open && style.open, className),
        }} >
          <div {...{
            className: style.selectedLocale,
            onClick: () => this.toggleOpen(),
          }}>
            <div className={style.localeName}>
              {currentLocale.name || currentLocale.code}
            </div>
            <TIcon {...{
              size: 8,
              type: ICONS_TYPES.triangleArrow,
              rotate: open ? ROTATE_TYPES.up : ROTATE_TYPES.down,
              className: classNames(style.control),
            }} />
          </div>
          {
            open &&
            <div className={style.localesList}>
              {locales.filter(l => l.code !== currentLocale.code).map(locale => (
                <div {...{
                  key: locale.code,
                  className: classNames(
                    style.localeItem,
                    currentLocale.code === locale.code && style.currentLocale,
                  ),
                  onClick: () => {
                    this.toggleOpen(false)
                    localeServiceFormActions.changeField('selectedLocale', locale.code)
                    onChange(locale)
                  },
                }}>
                  <div className={style.localeName}>
                    {locale.name || locale.code}
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </TClickOutside>
    )
  }
}

const mapStateToProps = (state) => ({
  localeServiceForm: forms.selectors.localeServiceForm.getForm(state),
})

const mapDispatchToProps = (dispatch) => ({
  localeServiceFormActions: bindActionCreators(forms.actions.localeServiceForm, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(LocaleSwitch)
