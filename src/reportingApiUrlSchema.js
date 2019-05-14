export const REPORTING_API_NAME = 'reportingservice'
export const REPORTING_API_HOST =
  process.env.REPORTING_API_HOST || `//${typeof window !== 'undefined' ? window.location.host : ''}`

export const REPORTING_API_PREFIX = ''

export const REPORTING_ALLOWED_NO_TOKEN_ENDPOINTS = [
]

export const PREPARED_REPORT_ENDPOINT = process.env.REPORTING_PREPARED_ENDPOINT || 'reports/'
export const CONFIG_REPORT_ENDPOINT = process.env.REPORTING_CONFIG_ENDPOINT || 'connections/$connectionCode/report/'
