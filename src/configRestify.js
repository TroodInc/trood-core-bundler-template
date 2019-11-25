import merge from 'lodash/merge'

import customApiConfig from './customApiConfig'

import { messages } from '$trood/mainConstants'
import { intlObject } from '$trood/localeService'

import { getToken } from './storage'
import {
  DEFAULT_ALLOWED_NO_TOKEN_ENDPOINTS,
  API_TYPES,
} from './apiUrlSchema'

import {
  AUTH_API_NAME,
  AUTH_ALLOWED_NO_TOKEN_ENDPOINTS,
  AUTH_API_PREFIX,
  AUTH_API_HOST,
} from './authApiUrlSchema'

import {
  FILE_API_NAME,
  FILE_ALLOWED_NO_TOKEN_ENDPOINTS,
  FILE_API_PREFIX,
  FILE_API_HOST,
} from './fileApiUrlSchema'

import {
  SEARCH_API_NAME,
  SEARCH_ALLOWED_NO_TOKEN_ENDPOINTS,
  SEARCH_API_PREFIX,
  SEARCH_API_HOST,
} from './searchApiUrlSchema'

import {
  REPORTING_API_NAME,
  REPORTING_ALLOWED_NO_TOKEN_ENDPOINTS,
  REPORTING_API_PREFIX,
  REPORTING_API_HOST,
} from './reportingApiUrlSchema'

import {
  MAIL_API_NAME,
  MAIL_ALLOWED_NO_TOKEN_ENDPOINTS,
  MAIL_API_PREFIX,
  MAIL_API_HOST,
} from './mailApiUrlSchema'

import {
  JOURNAL_API_NAME,
  JOURNAL_ALLOWED_NO_TOKEN_ENDPOINTS,
  JOURNAL_API_PREFIX,
  JOURNAL_API_HOST,
} from './journalApiUrlSchema'

import {
  STATIC_API_NAME,
  STATIC_ALLOWED_NO_TOKEN_ENDPOINTS,
  STATIC_API_PREFIX,
  STATIC_API_HOST,
} from './staticApiUrlSchema'

import { initRestify } from 'redux-restify'

import auth from '$trood/auth'
import modals, { MODAL_SIZES, addRegisteredModal } from '$trood/modals'
import {
  getBaseFormName,
  getEditEntityModal,
  getViewEntityModal,
  getInlineEntityEditComponent,
  addRegisteredEntityInlineEditor,
} from '$trood/entityManager'

import systemConfig from '$trood/config'
import modelsManifest from '$trood/businessObjects/manifest'
import componentsManifest from '$trood/componentLibraries/manifest'


const configRestify = () => {
  const defaultHttpCodesCallbacks = (code, customCodes = {}) => {
    if (code >= 500) {
      return () => modals.actions.showMessageBoxModal({
        text: intlObject.intl.formatMessage(messages.serverError),
        size: MODAL_SIZES.mediumSmall,
      })
    }
    return {
      401: auth.actions.logoutFront,
      403: auth.actions.logoutFront,
      ...customCodes,
    }
  }

  const modelsDefinitions = {}
  let apiDefinitions = {}
  const formsDefinitions = {}

  // Register business objects libraries
  systemConfig.businessObjects.forEach((library) => {
    const currentApiName = library.name + library.endpoint
    apiDefinitions[currentApiName] = {
      getToken,
      apiHost: library.endpoint || process.env.DEFAULT_API_HOST || window.location.host,
      apiPrefix: '',
      allowedNoTokenEndpoints: DEFAULT_ALLOWED_NO_TOKEN_ENDPOINTS,
      httpCodesCallbacks: code => defaultHttpCodesCallbacks(code, {
        403: () => modals.actions.showErrorPopup(intlObject.intl.formatMessage(messages.accessDenied)),
      }),
      ...API_TYPES[library.type],
    }
    Object.keys(library.models)
      .forEach(key => {
        const currentModelManifest = modelsManifest[`${library.name}/${key}`]
        const currentModelManifestModule = currentModelManifest.module
        const currentModelManifestComponents = currentModelManifest.components
        const currentModelManifestConstants = currentModelManifest.constants
        const currentModelManifestConfig = currentModelManifest.config
        const currentModelConfig = library.models[key]
        const currentModel = {
          ...merge(
            // Custodian generics field mock, so we don't have warnings about accessing it
            // TODO by @deylak resolve this somehow
            {
              defaults: {
                _object: undefined,
              },
            },
            currentModelManifestModule.model,
          ),
          // ...currentModelManifestModule.model,
          ...currentModelConfig,
          apiName: currentApiName,

          // Custom trood properties of business objects
          // TODO by @deylak find out some better way of storing this, not in restify model
          editComponent: currentModelManifestModule.editComponent,
          inlineEditComponent: currentModelManifestModule.inlineEditComponent,
          viewComponent: currentModelManifestModule.viewComponent,
          actions: currentModelManifestModule.actions || {},
          dependsOn: currentModelManifestConfig.dependsOn,
          services: currentModelManifestConfig.services,
          modal: currentModelManifestConfig.modal,
          editModal: currentModelManifestConfig.editModal,
          viewModal: currentModelManifestConfig.viewModal,
          components: currentModelManifestComponents,
          constants: currentModelManifestConstants,
        }
        modelsDefinitions[key] = currentModel
        if (currentModelManifestModule.form) {
          formsDefinitions[getBaseFormName(key)] = currentModelManifestModule.form
        }
        if (currentModelManifestModule.editComponent) {
          addRegisteredModal(getEditEntityModal(key, currentModel))
        }
        if (currentModelManifestModule.viewComponent) {
          addRegisteredModal(getViewEntityModal(key, currentModel))
        }
        if (currentModelManifestModule.inlineEditComponent || currentModelManifestModule.editComponent) {
          addRegisteredEntityInlineEditor(key, getInlineEntityEditComponent(key, currentModel))
        }
      })
  })

  // Register components forms
  Object.keys(componentsManifest.forms).forEach(formName => {
    formsDefinitions[formName] = componentsManifest.forms[formName]
  })

  apiDefinitions[AUTH_API_NAME] = {
    getToken,
    apiHost: AUTH_API_HOST,
    apiPrefix: AUTH_API_PREFIX,
    allowedNoTokenEndpoints: AUTH_ALLOWED_NO_TOKEN_ENDPOINTS,
    httpCodesCallbacks: defaultHttpCodesCallbacks,
    transformEntityResponse: response => ({
      data: response.data,
    }),
  }
  apiDefinitions[FILE_API_NAME] = {
    getToken,
    apiHost: FILE_API_HOST,
    apiPrefix: FILE_API_PREFIX,
    allowedNoTokenEndpoints: FILE_ALLOWED_NO_TOKEN_ENDPOINTS,
    httpCodesCallbacks: defaultHttpCodesCallbacks,
  }
  apiDefinitions[SEARCH_API_NAME] = {
    getToken,
    apiHost: SEARCH_API_HOST,
    apiPrefix: SEARCH_API_PREFIX,
    allowedNoTokenEndpoints: SEARCH_ALLOWED_NO_TOKEN_ENDPOINTS,
    httpCodesCallbacks: defaultHttpCodesCallbacks,
  }
  apiDefinitions[MAIL_API_NAME] = {
    getToken,
    apiHost: MAIL_API_HOST,
    apiPrefix: MAIL_API_PREFIX,
    allowedNoTokenEndpoints: MAIL_ALLOWED_NO_TOKEN_ENDPOINTS,
    httpCodesCallbacks: defaultHttpCodesCallbacks,
  }
  apiDefinitions[JOURNAL_API_NAME] = {
    getToken,
    apiHost: JOURNAL_API_HOST,
    apiPrefix: JOURNAL_API_PREFIX,
    allowedNoTokenEndpoints: JOURNAL_ALLOWED_NO_TOKEN_ENDPOINTS,
    getPaginationQuery: (query, page, pageSize) => {
      const limitStr = `limit(${(page - 1) * pageSize},${pageSize})`
      return {
        ...query,
        rql: query.rql ? `${query.rql},${limitStr}` : limitStr,
      }
    },
    transformArrayResponse: response => {
      if (Array.isArray(response)) {
        return {
          data: response,
          count: response.length,
        }
      }
      return {
        data: response.data,
        count: response.totalCount,
      }
    },
    httpCodesCallbacks: defaultHttpCodesCallbacks,
  }
  apiDefinitions[REPORTING_API_NAME] = {
    getToken,
    apiHost: REPORTING_API_HOST,
    apiPrefix: REPORTING_API_PREFIX,
    allowedNoTokenEndpoints: REPORTING_ALLOWED_NO_TOKEN_ENDPOINTS,
    httpCodesCallbacks: defaultHttpCodesCallbacks,
  }
  apiDefinitions[STATIC_API_NAME] = {
    apiHost: STATIC_API_HOST,
    apiPrefix: STATIC_API_PREFIX,
    allowedNoTokenEndpoints: STATIC_ALLOWED_NO_TOKEN_ENDPOINTS,
    httpCodesCallbacks: defaultHttpCodesCallbacks,
  }

  apiDefinitions = {
    ...apiDefinitions,
    ...customApiConfig,
  }

  // Register global app models
  const modelsContex = require.context('./', true, /.*\/models\/[A-z0-9-_]*\.model\.js$/)
  modelsContex.keys().forEach(key => {
    modelsDefinitions[key
      .replace('.model', '')
      .replace(/\.\/|\.js/g, '')
      .split('/')
      .reverse()[0]
    ] = modelsContex(key).default
  })

  // Register global app forms
  const formsContext = require.context('./', true, /.*\/forms\/[A-z0-9-_]*\.form\.js$/)
  formsContext.keys().forEach(key => {
    formsDefinitions[key
      .replace('.form', 'Form')
      .replace(/\.\/|\.js/g, '')
      .split('/')
      .reverse()[0]
    ] = formsContext(key).default
  })

  initRestify({
    apiDefinitions,
    modelsDefinitions,
    formsDefinitions,
  })
}

export default configRestify
