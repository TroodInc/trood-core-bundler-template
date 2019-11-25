import { api } from 'redux-restify'
import { SEARCH_API_NAME } from '$trood/searchApiUrlSchema'


export const search = (index, select, match, searchByFields, limit = '0,10') => dispatch => {
  const matchesReduce = (memo, curr) => {
    if (curr && curr.length > 0) {
      return `${memo && `${memo},` || ''}${curr.join(',')}`
    }
    return ''
  }

  let urlMatch = ''
  if (!searchByFields) {
    urlMatch = `match=${match}&`
  } else {
    urlMatch = `match=(${encodeURIComponent(searchByFields.reduce((memo, curr) =>
      `${memo && `${memo} | `}@${curr} ${match}`, ''))})&`
  }

  const urlIndex = `index=${index}&`
  const urlSelect = `select=${select}&`
  const urlLimit = `limit=${limit}`
  const url = `/search/?${urlIndex}${urlSelect}${urlMatch}${urlLimit}`

  return dispatch(api.actions.callGet({
    apiName: SEARCH_API_NAME,
    url,
  })).then(({ data }) => data[0].matches.reduce(matchesReduce, ''))
}
