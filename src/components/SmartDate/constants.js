import moment from 'moment'


export const FULL_FORMAT_WITH_TIME = 'fullWithTime'
export const ONLY_TIME = 'onlyTime'
export const FULL_FORMAT = 'full'
export const SHORT_FORMAT = 'short'
export const SHORT_WITH_TIME_FORMAT = 'shortWithTime'
export const NO_SAME_YEAR_FULL_FORMAT = 'noSameYearFull'
export const NO_SAME_YEAR_SHORT_FORMAT = 'noSameYearShort'
export const RELATIVE_FULL_FORMAT = 'relativeFull'
export const RELATIVE_FULL_WITH_TIME_FORMAT = 'relativeFullWithTime'
export const RELATIVE_SHORT_FORMAT = 'relativeShort'
export const RELATIVE_SHORT_WITH_TIME_FORMAT = 'relativeShortWithTime'
export const WITHOUT_DAY = 'withoutDay'

export const SMART_DATE_FORMATS = {
  [FULL_FORMAT_WITH_TIME]: FULL_FORMAT_WITH_TIME,
  [ONLY_TIME]: ONLY_TIME,
  [FULL_FORMAT]: FULL_FORMAT,
  [SHORT_FORMAT]: SHORT_FORMAT,
  [SHORT_WITH_TIME_FORMAT]: SHORT_WITH_TIME_FORMAT,
  [NO_SAME_YEAR_FULL_FORMAT]: NO_SAME_YEAR_FULL_FORMAT,
  [NO_SAME_YEAR_SHORT_FORMAT]: NO_SAME_YEAR_SHORT_FORMAT,
  [RELATIVE_FULL_FORMAT]: RELATIVE_FULL_FORMAT,
  [RELATIVE_SHORT_FORMAT]: RELATIVE_SHORT_FORMAT,
  [RELATIVE_FULL_WITH_TIME_FORMAT]: RELATIVE_FULL_WITH_TIME_FORMAT,
  [RELATIVE_SHORT_WITH_TIME_FORMAT]: RELATIVE_SHORT_WITH_TIME_FORMAT,
  [WITHOUT_DAY]: WITHOUT_DAY,
}

const relativeDate = (value, full) => {
  switch (moment(value).startOf('day').diff(moment().startOf('day'), 'days')) {
    case 0: return 'сегодня'
    case 1: return 'завтра'
    case -1: return 'вчера'
    default: return (full ? value.format('DD MMMM YYYY') : value.format('DD.MM.YY'))
  }
}

export const SMART_DATE_FORMATS_FUNCTIONS = {
  [FULL_FORMAT_WITH_TIME]: value => value.format('DD MMMM YYYY в HH:mm'),
  [FULL_FORMAT]: value => value.format('DD MMMM YYYY'),
  [SHORT_FORMAT]: value => value.format('DD.MM.YY'),
  [SHORT_WITH_TIME_FORMAT]: value => value.format('DD.MM.YY в HH:mm'),
  [ONLY_TIME]: value => value.format('HH:mm'),
  [NO_SAME_YEAR_FULL_FORMAT]: value => {
    if (moment().isSame(value, 'year')) return value.format('DD MMMM')
    return value.format('DD MMMM YYYY')
  },
  [NO_SAME_YEAR_SHORT_FORMAT]: value => {
    if (moment().isSame(value, 'year')) return value.format('DD MMMM')
    return value.format('DD.MM.YY')
  },
  [RELATIVE_FULL_FORMAT]: value => relativeDate(value, true),
  [RELATIVE_SHORT_FORMAT]: value => relativeDate(value, false),
  [RELATIVE_FULL_WITH_TIME_FORMAT]: value => {
    return relativeDate(value, true) + value.format(' в HH:mm')
  },
  [RELATIVE_SHORT_WITH_TIME_FORMAT]: value => {
    return relativeDate(value, false) + value.format(' в HH:mm')
  },
  [WITHOUT_DAY]: value => value.format('MMM YYYY'),
}
