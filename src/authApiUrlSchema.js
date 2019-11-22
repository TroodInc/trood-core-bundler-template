export const AUTH_API_NAME = 'auth'
export const AUTH_API_HOST =
  process.env.AUTH_API_HOST || `//${typeof window !== 'undefined' ? window.location.host : ''}`
export const AUTH_API_PREFIX = '/authorization/api/v1.0/'

export const LOGIN_ENDPOINT = 'login/'
export const RECOVERY_ENDPOINT = 'password-recovery/'

export const AUTH_ALLOWED_NO_TOKEN_ENDPOINTS = [
  new RegExp(LOGIN_ENDPOINT),
  new RegExp(RECOVERY_ENDPOINT),
]

export const LOGOUT_ENDPOINT = 'logout/'
export const ACCOUNT_ENDPOINT = 'account/'
export const ROLE_ENDPOINT = 'role/'
export const VERIFY_TOKEN_ENDPOINT = 'verify-token/'
