import {
  AUTH_API_NAME,
  LOGIN_ENDPOINT,
} from '$trood/authApiUrlSchema'


export default {
  apiName: AUTH_API_NAME,
  endpoint: LOGIN_ENDPOINT,
  defaults: {
    login: '',
    password: '',
    language: undefined,
  },
}
