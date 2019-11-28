import { SEARCH_API_NAME, SEARCH_ENDPOINT } from '$trood/searchApiUrlSchema'


export default {
  apiName: SEARCH_API_NAME,
  endpoint: SEARCH_ENDPOINT,
  defaults: {
    attrs: undefined,
    matches: undefined,
    meta: undefined,
  },
}
