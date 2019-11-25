import { api } from 'redux-restify'
import { SEARCH_API_NAME } from '$trood/searchApiUrlSchema'

const matchesReduce = (memo, curr) => {
  if (curr && curr.length > 0) {
    return `${memo && `${memo},` || ''}${curr.join(',')}`
  }
  return ''
}

export const search = ({
  index,
  select, // Array
  match, // string OR { field1: 'match1', field2: 'match2' ... }
  limit = 100000, // TODO by @magl88 get items for all pages
  offset = 0, // `${offset},${limit}` - same as old limit
}) => dispatch => {
  let urlMatch = ''
  if (typeof match === 'string') {
    urlMatch = `match=${match}&`
  } else {
    const matchKey = Object.keys(match)
    urlMatch = `match=(${encodeURIComponent(matchKey.reduce((memo, curr) =>
      `${memo && `${memo} | `}@${curr} ${match[curr]}`, ''))})&`
  }

  const urlIndex = `index=${index}&`
  const urlSelect = `select=${select}&`
  const urlLimit = `limit=${offset},${limit}`
  const url = `/search/?${urlIndex}${urlSelect}${urlMatch}${urlLimit}`

  return dispatch(api.actions.callGet({
    apiName: SEARCH_API_NAME,
    url,
  })).then(({ data }) => data[0].matches && data[0].matches.reduce(matchesReduce, ''))
}
