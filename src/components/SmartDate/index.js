import React from 'react'
import classNames from 'classnames'
import moment from 'moment'

import style from './index.css'

import {
  FULL_FORMAT,
  SMART_DATE_FORMATS,
  SMART_DATE_FORMATS_FUNCTIONS,
} from './constants'


const UNIX_TIMESTAMP_CHECKER = 1544399
const MS_IN_SEC = 1000

const SmartDate = ({
  className = '',
  date,
  format = FULL_FORMAT,
  customFormat,
  defaultEmptyMessage = 'Неизвестно',
}) => {
  let realDate = date
  if (typeof realDate === 'number' && realDate / MS_IN_SEC < UNIX_TIMESTAMP_CHECKER) {
    realDate *= MS_IN_SEC
  }
  const dateToDisplay = moment(realDate)
  const hasDate = realDate && dateToDisplay.isValid()
  const getValueFormatted = () => {
    if (customFormat) return customFormat(dateToDisplay)
    return SMART_DATE_FORMATS_FUNCTIONS[format](dateToDisplay)
  }

  return (
    <div className={classNames(style.root, className)}>
      {hasDate ? getValueFormatted() : defaultEmptyMessage}
    </div>
  )
}

export { SMART_DATE_FORMATS }

export default SmartDate
