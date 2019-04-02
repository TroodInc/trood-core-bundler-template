export const PICKER_TYPES = {
  time: 'time',
  date: 'date',
  dateTime: 'dateTime',
}

export const CALENDAR_TYPES = {
  day: 'day',
  month: 'month',
  year: 'year',
}

export const CALENDAR_POSITIONS = {
  left: 'left',
  right: 'right',
}

export const CALENDAR_TYPES_FORMAT = {
  [CALENDAR_TYPES.day]: 'D',
  [CALENDAR_TYPES.month]: 'MMMM',
  [CALENDAR_TYPES.year]: 'YYYY',
}

export const PICKER_ERRORS = {
  required: 'Значение не может быть пустым!',
  outOfRange: 'Значение за пределами диапазона!',
}

export const TIME_FORMAT = 'HH:mm'
