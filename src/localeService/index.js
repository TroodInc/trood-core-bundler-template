import generalMessages from './generalMessages'
import projectMessages from './projectMessages'
import localeMessages from '$trood/configMessages'
import entityMessages from '$trood/businessObjects/entityMessages'

export * from './components'

export { intlObject, translateDictionary, checkCurrentLocale } from './constants'

export default {
  localeMessages,
  entityMessages,
  generalMessages,
  projectMessages,
}
