import { capitalize } from '$trood/helpers/namingNotation'


export const REPORT_TYPES = {
  prepared: 'PREPARED',
  config: 'CONFIG',
}

export const getReportingId = (reportName) => `reporting${capitalize(reportName)}`
export const getReportingLoadingPropName = (reportName) => `${reportName}IsLoading`

const AVAILABLE_CHART_COLORS = [
  '#dda761',
  '#60c370',
  '#df6164',
  '#61a8dc',
  '#8965ab',
  '#1d7373',
  '#ccdd77',
  '#e667bb',
  '#103ba0',
  '#441b88',
]

const issuedColors = {}

export const getChartColor = (chartKey, id) => {
  if (!issuedColors[chartKey]) {
    issuedColors[chartKey] = {
      $issuedCounter: 0,
    }
  }
  if (!issuedColors[chartKey][id]) {
    const colorIndex = issuedColors[chartKey].$issuedCounter % AVAILABLE_CHART_COLORS.length
    issuedColors[chartKey][id] = AVAILABLE_CHART_COLORS[colorIndex]
    issuedColors[chartKey].$issuedCounter += 1
  }

  return issuedColors[chartKey][id]
}
