import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import momentPropTypes from 'react-moment-proptypes'
import classNames from 'classnames'
import moment from 'moment'

import style from './index.css'

import {
  FULL_FORMAT,
  SMART_DATE_FORMATS,
  SMART_DATE_FORMATS_FUNCTIONS,
} from './constants'

import { messages } from '$trood/mainConstants'
import { intlObject } from '$trood/localeService'


const UNIX_TIMESTAMP_CHECKER = 1544399
const MS_IN_SEC = 1000

const allMomentPropTypes = PropTypes.oneOfType([
  momentPropTypes.momentObj,
  momentPropTypes.momentString,
  momentPropTypes.momentDurationObj,
])

/**
 * Component for outputting the date in a given format.
 *
 * Formats: SMART_DATE_FORMATS.fullWithTime, SMART_DATE_FORMATS.onlyTime, SMART_DATE_FORMATS.full,
 * SMART_DATE_FORMATS.short, SMART_DATE_FORMATS.shortWithTime, SMART_DATE_FORMATS.noSameYearFull,
 * SMART_DATE_FORMATS.noSameYearShort, SMART_DATE_FORMATS.relativeFull, SMART_DATE_FORMATS.relativeFullWithTime,
 * SMART_DATE_FORMATS.relativeShort, SMART_DATE_FORMATS.relativeShortWithTime, SMART_DATE_FORMATS.withoutDay
 */

class SmartDate extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** date */
    date: allMomentPropTypes,
    /** all format you can see in description */
    format: PropTypes.string,
    /** custom format function */
    customFormat: PropTypes.func,
    /** default empty message */
    defaultEmptyMessage: PropTypes.string,
  }

  render() {
    const {
      className = '',
      date,
      format = FULL_FORMAT,
      customFormat,
      defaultEmptyMessage = intlObject.intl.formatMessage(messages.notSet),
    } = this.props

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

    return(
    <div className={classNames(style.root, className)}>
      {hasDate ? getValueFormatted() : defaultEmptyMessage}
    </div>
    )
  }
}

export {
  FULL_FORMAT,
  SMART_DATE_FORMATS,
  SMART_DATE_FORMATS_FUNCTIONS,
}

export default SmartDate
