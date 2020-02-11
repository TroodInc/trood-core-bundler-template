import { push } from 'connected-react-router'

import { api, forms } from 'redux-restify'

import modals, { MODAL_SIZES } from '$trood/modals'

import mainConfig from '$trood/config'

import { STATE_REPLACE_ACTION } from '$trood/mainConstants'
import {
  setToken,
  clearStorage,
  clearToken,
} from '$trood/storage'

import { LOGIN_PAGE_URL, messages } from './constants'
import { intlObject } from '$trood/localeService'

import {
  AUTH_API_NAME,
  LOGOUT_ENDPOINT,
  RECOVERY_ENDPOINT,
  VERIFY_TOKEN_ENDPOINT,
} from '$trood/authApiUrlSchema'


const restoreNull = (data = {}) => {
  if (typeof data !== 'object' || data === null) return data
  if (Array.isArray(data)) {
    return data.map(item => restoreNull(item))
  }
  return Object.keys(data).reduce((memo, curr) => {
    let currValue = data[curr]
    if (currValue === undefined) {
      currValue = null
    } else if (typeof currValue === 'object') {
      currValue = restoreNull(currValue)
    }
    return {
      ...memo,
      [curr]: currValue,
    }
  }, {})
}

export const updateProfile = (modelName, model) => dispatch => {
  if (!model) return undefined
  dispatch(api.actions.entityManager[modelName].updateById(model.id, model))
  return model.id
}

const setAuthData = (data) => (dispatch) => {
  const { profile } = (mainConfig.services || {}).auth || {}
  const formattedResponse = Object.keys(data).reduce((memo, key) => {
    if (key === 'profile') {
      const profileId = profile ? dispatch(updateProfile(profile, data[key])) : null
      return {
        ...memo,
        [key]: profileId,
      }
    }
    if (key === 'abac') {
      return {
        ...memo,
        [key]: restoreNull(data[key]),
      }
    }
    return {
      ...memo,
      [key]: data[key],
    }
  }, {})
  dispatch(forms.actions.authDataForm.changeSomeFields(formattedResponse))
  if (data.language) {
    dispatch(forms.actions.localeServiceForm.changeField('selectedLocale', data.language))
  }
}

export const login = (nextUrl = '/') => dispatch => {
  dispatch(forms.actions.authForm.submit()).then(({ data, status }) => {
    if (status === 200) {
      dispatch(setAuthData(data.data))
      setToken(data.data.token)
      dispatch(push(nextUrl))
    }
  })
}

export const recovery = (token) => (dispatch, getState) => {
  const recoveryForm = forms.selectors.recoveryForm.getForm(getState())
  dispatch(forms.actions.sendQuickForm({
    apiName: AUTH_API_NAME,
    endpoint: RECOVERY_ENDPOINT,
    method: token ? 'patch' : 'post',
    defaults: {
      token,
      ...recoveryForm,
    },
  }))
    .then(({ data, status }) => {
      if (status === 200) {
        let msg = messages[data.data.detail]
        if (!msg) {
          msg = data.data.detail
        } else {
          msg = intlObject.intl.formatMessage(msg)
        }
        dispatch(modals.actions.showInfoPopup(msg))
      }
    })
    .then(() => dispatch(forms.actions.recoveryForm.resetForm()))
    .catch(({ status }) => {
      if (status === 404) {
        dispatch(modals.actions.showMessageBoxModal({
          title: intlObject.intl.formatMessage(messages.error),
          text: intlObject.intl.formatMessage(messages.notFound),
          size: MODAL_SIZES.small,
        }))
      }
    })
}

export const logoutFront = () => (dispatch, getState) => {
  clearStorage()
  clearToken()
  const selectedLocale = forms.selectors.localeServiceForm.getField('selectedLocale')(getState())
  dispatch({
    type: STATE_REPLACE_ACTION,
    state: {},
  })
  dispatch(forms.actions.localeServiceForm.changeField('selectedLocale', selectedLocale))
  dispatch(push(LOGIN_PAGE_URL))
}

export const logout = () => async (dispatch) => {
  await dispatch(forms.actions.sendQuickForm({
    apiName: AUTH_API_NAME,
    endpoint: LOGOUT_ENDPOINT,
  }))
    .catch(() => {})
  dispatch(logoutFront())
}

export const restoreAuthData = () => dispatch => {
  dispatch(forms.actions.sendQuickForm({
    apiName: AUTH_API_NAME,
    endpoint: VERIFY_TOKEN_ENDPOINT,
  }))
    .then(({ data, status }) => {
      if (status === 200) {
        dispatch(setAuthData(data.data))
      } else {
        dispatch(logout())
      }
    })
    .catch(() => dispatch(logout()))
}

export const registerUser = ({
  login: loginValue,
  password,
}) => async (dispatch) => {
  return dispatch(forms.actions.sendQuickForm({
    model: 'account',
    values: {
      login: loginValue,
      password,
    },
  }))
}

export const changeLanguage = (language) => (dispatch, getState) => {
  const id = forms.selectors.authDataForm.getField('id')(getState())
  return dispatch(forms.actions.sendQuickForm({
    model: 'account',
    values: {
      id,
      language,
    },
  }))
}
