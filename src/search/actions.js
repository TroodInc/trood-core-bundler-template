import { api } from 'redux-restify'
import { SEARCH_API_NAME } from '$trood/searchApiUrlSchema'

export const search = ({
  index,
  select,
  match,
  limit = 10,
  offset = 0,
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
  })).then(({ data }) => data[0])
}
