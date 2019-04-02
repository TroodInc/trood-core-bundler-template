import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import momentPropTypes from 'react-moment-proptypes'
import classNames from 'classnames'
import moment from 'moment'

import style from './index.css'

import TClickOutside from '$trood/components/TClickOutside'
import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'
import TLabel from '$trood/components/TLabel'

import { DEFAULT_DATE_FORMAT } from '$trood/mainConstants'

import { PICKER_ERRORS, CALENDAR_TYPES, CALENDAR_TYPES_FORMAT, CALENDAR_POSITIONS } from '../constants'


const allMomentPropTypes = PropTypes.oneOfType([
  momentPropTypes.momentObj,
  momentPropTypes.momentString,
  momentPropTypes.momentDurationObj,
])

class DatePicker extends PureComponent {
  static propTypes = {
    value: allMomentPropTypes,
    label: PropTypes.node,
    calendarPosition: PropTypes.oneOf(Object.values(CALENDAR_POSITIONS)),
    validate: PropTypes.shape({
      minDate: allMomentPropTypes,
      maxDate: allMomentPropTypes,
    }),
    onChange: PropTypes.func,
    onValid: PropTypes.func,
    onInvalid: PropTypes.func,
    onBlur: PropTypes.func,
  }

  static defaultProps = {
    calendarPosition: CALENDAR_POSITIONS.left,
    validate: {},
    onChange: () => {},
    onValid: () => {},
    onInvalid: () => {},
    onBlur: () => {},
  }

  static getCalendarArray(value, type) {
    let calendarArray = []

    if (type === CALENDAR_TYPES.day) {
      const startOfMonth = moment(value).startOf('month')
      const firstWeek = startOfMonth.week()
      let lastWeek = moment(value).endOf('month').week()
      if (lastWeek < firstWeek) {
        let lastWeekOfYear = moment(value).endOf('year').week()
        if (lastWeekOfYear === 1) {
          lastWeekOfYear = moment(value).endOf('year').add({ week: -1 }).week()
        }
        lastWeek += lastWeekOfYear
      }
      const weekInMonth = lastWeek - firstWeek + 1
      calendarArray = (new Array(weekInMonth)).fill((new Array(7)).fill(0))

      const startOfFirstMonthWeek = startOfMonth.startOf('week')

      let day = -1
      return calendarArray.map(weekItem => weekItem.map(() => {
        day += 1
        return moment(startOfFirstMonthWeek).add({ day })
      }))
    }

    if (type === CALENDAR_TYPES.month) {
      calendarArray = (new Array(4)).fill((new Array(3)).fill(0))
      const startValue = moment(value).startOf('year')
        .date(moment(value).date())

      let month = -1
      return calendarArray.map(weekItem => weekItem.map(() => {
        month += 1
        return moment(startValue).add({ month })
      }))
    }

    if (type === CALENDAR_TYPES.year) {
      calendarArray = (new Array(4)).fill((new Array(3)).fill(0))
      const startValue = moment(value)

      let year = -7
      return calendarArray.map(weekItem => weekItem.map(() => {
        year += 1
        return moment(startValue).add({ year })
      }))
    }

    return calendarArray
  }

  static getNextType(currentType, offset = 1) {
    const typesArray = Object.values(CALENDAR_TYPES)
    const currentTypeIndex = typesArray.indexOf(currentType)
    return typesArray[currentTypeIndex + offset]
  }

  static getIsSameAsValue(value1, value2, type) {
    return moment(value1).isSame(value2, type)
  }

  static getIsSameAsPeriod(value1, value2, type) {
    const period = DatePicker.getNextType(type)
    if (!period) return true
    return DatePicker.getIsSameAsValue(value1, value2, period)
  }

  constructor(props) {
    super(props)

    this.state = {
      type: CALENDAR_TYPES.day,
      open: false,
    }

    this.toggleOpen = this.toggleOpen.bind(this)
    this.toggleCalendarType = this.toggleCalendarType.bind(this)
    this.getIsOutOfRange = this.getIsOutOfRange.bind(this)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleOnScroll = this.handleOnScroll.bind(this)
    this.handleValidate = this.handleValidate.bind(this)
  }

  componentDidMount() {
    this.handleValidate()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.handleValidate()
    }
  }

  getIsOutOfRange(date) {
    const { minDate, maxDate } = this.props.validate
    const { type } = this.state
    const dateIsAfterMin = !!minDate && moment(minDate).startOf(type).isAfter(date)
    const dateIsBeforeMax = !!maxDate && moment(maxDate).endOf(type).isBefore(date)
    return dateIsAfterMin || dateIsBeforeMax
  }

  toggleOpen(open) {
    const { open: stateOpen } = this.state
    let newOpen = open
    if (newOpen === undefined) newOpen = !stateOpen
    const newState = {
      type: CALENDAR_TYPES.day,
      open: newOpen,
    }
    if (!newOpen && stateOpen) {
      this.props.onBlur()
      newState.wasBlured = true
    }
    this.setState(newState)
  }

  toggleCalendarType() {
    const { type } = this.state
    const nextType = DatePicker.getNextType(type)
    if (nextType) this.setState({ type: nextType })
  }

  handleOnChange(value, notTypeChange) {
    const { type } = this.state
    const { value: oldValue, onChange } = this.props
    let newType = DatePicker.getNextType(type, -1) || type
    let newValue = value
    if (type === CALENDAR_TYPES.day && moment(oldValue).isSame(value)) {
      newType = type
      newValue = undefined
    }
    if (notTypeChange) newType = type
    this.setState({ type: newType })
    onChange(newValue)
  }

  handleOnScroll(offset) {
    let { type } = this.state
    let { value } = this.props
    type = DatePicker.getNextType(type) || type
    value = moment(value).add({ [type]: offset })
    this.handleOnChange(value, true)
  }

  handleValidate(value = this.props.value) {
    const { onValid, onInvalid, validate } = this.props
    const errors = []
    if (validate.required && !value) {
      errors.push(PICKER_ERRORS.required)
    }

    if (errors.length) {
      onInvalid(errors)
    } else {
      onValid()
    }
  }

  render() {
    const {
      calendarPosition,
      value,
      placeholder,
      label,
      validate: {
        checkOnBlur,
        required,
      },
      disabled,
      errors,
      className,
    } = this.props

    const {
      type,
      open,
      wasBlured,
    } = this.state

    const calendarArray = DatePicker.getCalendarArray(value, type)

    const calendarFirstWeek = calendarArray[0]

    const nextType = DatePicker.getNextType(type)

    return (
      <div className={classNames(className, style.rootWrapper)}>
        {
          !!label &&
          <TLabel {...{
            className: style.label,
            required,
            label,
          }} />
        }
        <TClickOutside onClick={() => this.toggleOpen(false)}>
          <div {...{
            'data-cy': placeholder,
            className: classNames(
              style.root,
              (!checkOnBlur || wasBlured) && errors && errors.length && style.error,
              disabled && style.disabled,
              open && style.open,
            ),
          }}>
            <div {...{
              className: style.header,
              onClick: disabled ? () => {} : () => this.toggleOpen(),
              'data-cy': 'dateTimePickerControl',
            }}>
              <div className={classNames(style.value, !value && style.placeholder)}>
                {value ? moment(value).format('DD.MM.YYYY') : placeholder}
              </div>
              <TIcon {...{
                size: 8,
                type: ICONS_TYPES.triangleArrow,
                rotate: open ? ROTATE_TYPES.up : ROTATE_TYPES.down,
                className: style.icon,
              }} />
            </div>
            {open &&
              <div className={classNames(style.body, style[calendarPosition])}>
                <div className={style.bodyHeader}>
                  <TIcon {...{
                    type: ICONS_TYPES.arrowWithTail,
                    size: 40,
                    className: style.calendarArrow,
                    onClick: () => this.handleOnScroll(-(type === CALENDAR_TYPES.year ? 6 : 1)),
                  }} />
                  <div {...{
                    className: style.bodyHeaderTitle,
                    onClick: this.toggleCalendarType,
                  }}>
                    {nextType && moment(value).format(CALENDAR_TYPES_FORMAT[nextType])}
                  </div>
                  <TIcon {...{
                    type: ICONS_TYPES.arrowWithTail,
                    rotate: 180,
                    size: 40,
                    className: style.calendarArrow,
                    onClick: () => this.handleOnScroll(type === CALENDAR_TYPES.year ? 6 : 1),
                  }} />
                </div>
                <div className={style.calendar}>
                  {type === CALENDAR_TYPES.day &&
                    <div className={classNames(style.calendarRow, style.calendarHeader)}>
                      {calendarFirstWeek.map((item, i) => (
                        <div className={style.calendarCell} key={i}>
                          {moment(item).format('dd')}
                        </div>
                      ))}
                    </div>
                  }
                  {calendarArray.map((row, i) => (
                    <div className={style.calendarRow} key={i}>
                      {row.map((item, j) => {
                        const isSameAsValue = !!value && DatePicker.getIsSameAsValue(value, item, type)
                        const isCurrentDate = DatePicker.getIsSameAsValue(moment(), item, type)
                        const isSameAsPeriod = DatePicker.getIsSameAsPeriod(value, item, type)
                        const cellDisabled = this.getIsOutOfRange(item)
                        return (
                          <div {...{
                            key: j,
                            'data-cy': `dateTimePickerCell_${type}${cellDisabled ? 'Inactive' : 'Active'}_${
                              moment(item).format(DEFAULT_DATE_FORMAT)}`,
                            className: classNames(
                              style[type],
                              style.calendarCell,
                              style.calendarBodyCell,
                              cellDisabled && style.disabledCell,
                              !isSameAsPeriod && style.otherCell,
                              isSameAsValue && style.activeCell,
                              isCurrentDate && style.currentCell,
                            ),
                            onClick: !cellDisabled ? () => this.handleOnChange(item) : undefined,
                          }}>
                            {moment(item).format(CALENDAR_TYPES_FORMAT[type])}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            }
          </div>
        </TClickOutside>
      </div>
    )
  }
}

export default DatePicker
