import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import momentPropTypes from 'react-moment-proptypes'
import classNames from 'classnames'
import moment from 'moment'

import style from './index.css'

import DatePicker from './DatePicker'
import TimePicker from './TimePicker'

import { PICKER_TYPES, TIME_FORMAT, CALENDAR_POSITIONS } from './constants'
import { DEFAULT_DATE_TIME_FORMAT, DEFAULT_DATE_FORMAT, messages } from '$trood/mainConstants'
import { intlObject } from '$trood/localeService'


const allMomentPropTypes = PropTypes.oneOfType([
  momentPropTypes.momentObj,
  momentPropTypes.momentString,
  momentPropTypes.momentDurationObj,
])

class DateTimePicker extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    type: PropTypes.oneOf(Object.values(PICKER_TYPES)),
    calendarPosition: PropTypes.oneOf(Object.values(CALENDAR_POSITIONS)),
    zeroTimeIsValue: PropTypes.bool,
    value: allMomentPropTypes,
    label: PropTypes.node,
    timeLabel: PropTypes.node,
    validate: PropTypes.shape({
      checkOnBlur: PropTypes.bool,
      dateRequired: PropTypes.bool,
      timeRequired: PropTypes.bool,
      minDate: allMomentPropTypes,
      maxDate: allMomentPropTypes,
    }),
    showTextErrors: PropTypes.bool,
    onChange: PropTypes.func,
    onValid: PropTypes.func,
    onInvalid: PropTypes.func,
    placeholder: PropTypes.node,
  }

  static defaultProps = {
    type: PICKER_TYPES.dateTime,
    validate: {},
    showTextErrors: true,
    zeroTimeIsValue: false,
    onChange: () => {},
    onValid: () => {},
    onInvalid: () => {},
  }

  static getDerivedStateFromProps(props, state) {
    let dateValue
    let timeValue = ''
    if (props.value) {
      const dateTime = moment(props.value)
      dateValue = dateTime.format(DEFAULT_DATE_FORMAT)
      timeValue = dateTime.format(TIME_FORMAT)
    }
    if (!props.zeroTimeIsValue && !state.timeValue && timeValue) {
      const startDayTimeValue = moment().startOf('day').format(TIME_FORMAT)
      if (timeValue === startDayTimeValue) {
        timeValue = state.timeValue
      }
    }
    if (dateValue !== state.dateValue || timeValue !== state.timeValue) {
      return {
        dateValue,
        timeValue,
      }
    }
    return null
  }

  constructor(props) {
    super(props)

    this.state = {
      dateTimeErrors: [],
      dateErrors: [],
      timeErrors: [],
    }

    this.handleChangeDate = this.handleChangeDate.bind(this)
    this.handleChangeTime = this.handleChangeTime.bind(this)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleOnInvalid = this.handleOnInvalid.bind(this)
    this.getAllErrors = this.getAllErrors.bind(this)
    this.callOnInvalid = this.callOnInvalid.bind(this)
  }

  componentDidMount() {
    this.handleValidate()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.handleValidate()
    }
  }

  getAllErrors() {
    const { dateTimeErrors, dateErrors, timeErrors } = this.state
    const allErrors = [...dateTimeErrors, ...dateErrors, ...timeErrors]
    return allErrors.reduce((memo, curr, i) => {
      if (allErrors.indexOf(curr) === i) return [...memo, curr]
      return memo
    }, [])
  }

  handleChangeDate(value) {
    let dateValue = value
    let { timeValue } = this.state
    if (!value) {
      dateValue = undefined
      timeValue = ''
    }
    this.handleOnChange({ dateValue, timeValue })
  }

  handleChangeTime(value) {
    const { dateValue } = this.state
    this.handleOnChange({ timeValue: value || '', dateValue })
  }

  handleOnChange({ dateValue, timeValue = '' } = this.state) {
    const { type, onChange } = this.props
    if ((type !== PICKER_TYPES.time && !dateValue) || (type === PICKER_TYPES.time && !timeValue)) {
      onChange()
    } else {
      const date = moment(dateValue, dateValue && DEFAULT_DATE_FORMAT)
      let fullTimeValue = TIME_FORMAT.replace(/[^:]/g, '0')
      fullTimeValue = `${timeValue}${fullTimeValue.substr(timeValue.length)}`
      const timeFormatSplit = TIME_FORMAT.split(':')
      const timeValueSplit = fullTimeValue.split(':')
      timeFormatSplit.forEach((format, i) => {
        date.set({ [format.substr(0, 1)]: timeValueSplit[i] })
      })

      onChange(date.format(DEFAULT_DATE_TIME_FORMAT))
    }
  }

  handleOnInvalid(component, errors = []) {
    this.setState({ [`${component}Errors`]: errors }, this.callOnInvalid)
  }

  handleValidate(value = this.props.value) {
    const { minDate, maxDate } = this.props.validate
    const errors = []
    if ((minDate && moment(value).isBefore(minDate)) || (maxDate && moment(value).isAfter(maxDate))) {
      errors.push(intlObject.intl.formatMessage(messages.outOfRangeValue))
    }
    this.setState({ dateTimeErrors: errors }, this.callOnInvalid)
  }

  callOnInvalid() {
    const errors = this.getAllErrors()
    const { onValid, onInvalid } = this.props
    if (errors.length) {
      onInvalid(errors)
    } else {
      onValid()
    }
  }

  render() {
    const {
      className,
      calendarPosition,
      placeholder,
      label,
      timeLabel,
      type,
      validate,
      showTextErrors,
    } = this.props

    const {
      dateTimeErrors,
      dateValue,
      dateErrors,
      timeValue,
      timeErrors,
      wasBlured,
    } = this.state

    const showDate = type === PICKER_TYPES.date || type === PICKER_TYPES.dateTime
    const showTime = type === PICKER_TYPES.time || type === PICKER_TYPES.dateTime

    let errors = this.getAllErrors()
    if (validate.checkOnBlur && !wasBlured) {
      errors = []
    }

    return (
      <div className={classNames(className, style.root)}>
        <div className={style.wrapper}>
          {
            showDate &&
            <DatePicker {...{
              calendarPosition,
              value: dateValue,
              placeholder,
              label,
              errors: [...dateTimeErrors, ...dateErrors],
              className: style.date,
              validate: {
                checkOnBlur: validate.checkOnBlur,
                required: validate.dateRequired,
                minDate: validate.minDate,
                maxDate: validate.maxDate,
              },
              onChange: this.handleChangeDate,
              onValid: () => this.handleOnInvalid('date'),
              onInvalid: err => this.handleOnInvalid('date', err),
              onBlur: () => this.setState({ wasBlured: true }),
            }} />
          }
          {
            showTime &&
            <TimePicker {...{
              value: timeValue,
              label: timeLabel || (type === PICKER_TYPES.time && label),
              errors: [...dateTimeErrors, ...timeErrors],
              className: style.time,
              disabled: !dateValue && showDate,
              validate: {
                checkOnBlur: validate.checkOnBlur,
                required: validate.timeRequired,
              },
              onChange: this.handleChangeTime,
              onValid: () => this.handleOnInvalid('time'),
              onInvalid: err => this.handleOnInvalid('time', err),
              onBlur: () => this.setState({ wasBlured: true }),
            }} />
          }
        </div>
        {
          showTextErrors &&
          <div className={style.errors}>
            {errors.map((error, index) => (
              <div className={style.errorText} key={index}>
                {error}
              </div>
            ))}
          </div>
        }
      </div>
    )
  }
}

export * from './constants'

export default DateTimePicker
