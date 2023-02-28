import lodashGet from 'lodash/get'
import { snakeToCamel } from '$trood/helpers/namingNotation'
import systemConfig from '$trood/config'

export const DEFAULT_LOCALE = lodashGet(systemConfig, ['services', 'locale', 'defaultLocale']) || 'en'
const AVAILABLE_LOCALES = lodashGet(systemConfig, ['services', 'locale', 'availableLocales']) || []

export const intlObject = {
  intl: undefined,
}

export const intlRenderCallback = intl => {
  intlObject.intl = intl
}

export const translateDictionary = (dict = {}) => (item = {}) => {
  if (!item) return undefined
  const message = dict[snakeToCamel((item.code || item.id || '').toString())]
  if (!intlObject.intl || !message) return item.name || item.code || item.id
  return intlObject.intl.formatMessage(message)
}

export const checkCurrentLocale = (currentLocale = DEFAULT_LOCALE) => {
  if (!AVAILABLE_LOCALES.find(l => l.code === currentLocale)) return DEFAULT_LOCALE
  return currentLocale
}
