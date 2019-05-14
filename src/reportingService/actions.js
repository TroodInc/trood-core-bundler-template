import { api, forms } from 'redux-restify'

import { REPORT_TYPES, getReportingId, getReportingLoadingPropName } from './constants'

import { REPORTING_API_NAME, PREPARED_REPORT_ENDPOINT, CONFIG_REPORT_ENDPOINT } from '$trood/reportingApiUrlSchema'


const ReportingRequests = {}

export const getReportByQuery = ({
  propName,
  reportId,
  type,
  connectionCode,
  query,
  filter,
}) => (dispatch) => {
  const isConfigReport = type === REPORT_TYPES.config
  let url = isConfigReport ? CONFIG_REPORT_ENDPOINT : PREPARED_REPORT_ENDPOINT
  if (isConfigReport) {
    url = url.replace('$connectionCode', connectionCode)
  } else {
    url = `${url}${reportId}`
  }

  const loadingPropName = getReportingLoadingPropName(propName)
  if (ReportingRequests[propName]) {
    ReportingRequests[propName].abort()
  }
  dispatch(forms.actions.reportingServiceDataForm.changeField(loadingPropName, true))

  const apiMethod = isConfigReport ? api.actions.callPost : api.actions.callGet

  dispatch(apiMethod({
    url,
    apiName: REPORTING_API_NAME,
    urlHash: getReportingId(propName),
    query: isConfigReport ? { name: propName } : { ...filter },
    data: isConfigReport ? { query } : undefined,
    convertToCamelCase: false,
    onXhrReady: (xhr) => {
      ReportingRequests[propName] = xhr
    },
  })).then(res => {
    dispatch(forms.actions.reportingServiceDataForm.changeSomeFields({
      [propName]: res.data,
      [loadingPropName]: false,
    }))
  })
}
