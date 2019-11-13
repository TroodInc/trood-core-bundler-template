import { bindActionCreators } from 'redux'

import { api, forms } from 'redux-restify'

import files from '$trood/files'
import webSocket from '$trood/webSocket'
import reportingService from '$trood/reportingService'


export const SERVICE_MAIL_SERVICE = 'mailService'
export const SERVICE_JOURNAL_SERVICE = 'journalService'
export const SERVICE_FILE_SERVICE = 'fileService'
export const SERVICE_WS_SERVICE = 'webSocketService'
export const SERVICE_REPORTING_SERVICE = 'reportingService'

export const TROOD_SERVICES = {
  [SERVICE_MAIL_SERVICE]: SERVICE_MAIL_SERVICE,
  [SERVICE_JOURNAL_SERVICE]: SERVICE_JOURNAL_SERVICE,
  [SERVICE_FILE_SERVICE]: SERVICE_FILE_SERVICE,
  [SERVICE_WS_SERVICE]: SERVICE_WS_SERVICE,
  [SERVICE_REPORTING_SERVICE]: SERVICE_REPORTING_SERVICE,
}

// Here we define what props will be injected by trood services.
// This constant is also used for grid rendering (to define prop names for components)
// We need to pass state like this in function,
// cause restify is not initialized yet, and we can't get entityManager contents

// TODO by @deylak add mailService and others
export const SERVICES_PROPS = {
  [TROOD_SERVICES.journalService]: {
    stateProps: {
      journalsEntities: (state) => api.selectors.entityManager.journals.getEntities(state),
      historyEntities: (state) => api.selectors.entityManager.history.getEntities(state),
    },
    dispatchProps: {
      journalApiActions: (dispatch) => bindActionCreators(api.actions.entityManager.history, dispatch),
      historyApiActions: (dispatch) => bindActionCreators(api.actions.entityManager.history, dispatch),
    },
  },
  [TROOD_SERVICES.fileService]: {
    stateProps: {
      filesEntities: (state) => api.selectors.entityManager.files.getEntities(state),
    },
    dispatchProps: {
      filesActions: (dispatch) => bindActionCreators(files.actions, dispatch),
    },
  },
  [TROOD_SERVICES.webSocketService]: {
    stateProps: {},
    dispatchProps: {
      webSocketActions: (dispatch) => bindActionCreators(webSocket.actions, dispatch),
    },
  },
  [TROOD_SERVICES.reportingService]: {
    stateProps: {
      reportingServiceData: (state) => forms.selectors.reportingServiceDataForm.getForm(state),
    },
    dispatchProps: {
      reportingActions: (dispatch) => bindActionCreators(reportingService.actions, dispatch),
    },
  },
}

export const SERVICES_PROPS_NAMES = Object.keys(SERVICES_PROPS).reduce((memo, key) => ({
  ...memo,
  [key]: Object.keys(SERVICES_PROPS[key].stateProps).concat(Object.keys(SERVICES_PROPS[key].dispatchProps)),
}), {})
