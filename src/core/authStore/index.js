import { types } from 'mobx-state-tree'

export const setToken = token => window.localStorage.setItem('trood-token', token)
export const clearToken = () => window.localStorage.removeItem('trood-token')
export const getToken = () => window.localStorage.getItem('trood-token')

export const getAuthStore = apiStore => {
  const Model = types
    .model('Auth', {
      token: types.maybeNull(types.string),
      account: types.optional(types.frozen({}), {}),
      abac: types.optional(types.frozen({}), {}),
      error: types.optional(types.frozen({}), {}),
    })
    .views(() => ({
      getLoginForm() {
        return apiStore.forms.getForm({ formName: 'LoginForm' })
      },
      getVerifyForm() {
        return apiStore.forms.getForm({ formName: 'VerifyForm' })
      },
      getLogoutForm() {
        return apiStore.forms.getForm({ formName: 'LogoutForm' })
      },
    }))
    .actions(self => ({
      login(endpoint, tokenPrefix = 'Token '){
        const options = { method: 'post', endpoint }
        return self.getLoginForm().submit(options, true)
          .then(res => {
            self.setAuthData(res, tokenPrefix)
            return res
          })
          .catch(res => {
            self.setAuthData(res, tokenPrefix)
            return Promise.reject(res)
          })
      },
      verifyToken(endpoint, tokenPrefix = 'Token ') {
        if (getToken()) {
          const options = { method: 'post', endpoint }
          return self.getVerifyForm().submit(options, true)
            .then(res => {
              self.setAuthData(res, tokenPrefix, true)
              return res
            })
        }
      },
      logout(endpoint) {
        if (endpoint && getToken()) {
          const options = { method: 'post', endpoint }
          self.getLogoutForm().submit(options, true)
            .finally(self.clearAuthData)
        } else {
          self.clearAuthData()
        }
      },
      clearAuthData() {
        clearToken()
        self.token = null
        self.account = {}
        self.abac = {}
        self.error = {}
      },
      setAuthData({ data: { data = {} } = {}, error }, tokenPrefix, verify = false) {
        if (error) {
          clearToken()
          self.token = null
          self.account = {}
          self.abac = {}
          self.error = error
        } else {
          const { token, abac, ...account } = data
          if (!verify) {
            const formattedToken = token ? `${tokenPrefix}${token}` : null
            setToken(formattedToken)
            self.token = formattedToken
          }
          self.account = account
          self.abac = abac
          self.error = {}
        }
      },
    }))
  return Model.create({
    token: getToken() || null,
  })
}
