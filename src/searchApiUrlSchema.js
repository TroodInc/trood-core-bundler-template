export const SEARCH_API_NAME = 'searchservice'
export const SEARCH_API_HOST =
  process.env.SEARCH_API_HOST || `//${typeof window !== 'undefined' ? window.location.host : ''}`
export const SEARCH_API_PREFIX = ''

export const SEARCH_ALLOWED_NO_TOKEN_ENDPOINTS = []

export const SEARCH_ENDPOINT = 'search/'
