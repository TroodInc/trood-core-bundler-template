import { api, forms } from 'redux-restify'

import { getToken } from '$trood/storage'

import mainConfig from '$trood/config'


export const getAuthData = state => {
  return forms.selectors.authDataForm.getForm(state)
}

export const getIsHasAuthData = state => {
  const authData = getAuthData(state)
  return !!authData.id
}

export const getIsAuthenticated = () => {
  const token = getToken()
  return !!token && token !== 'null'
}

export const getLinkedObjectId = state => {
  return forms.selectors.authDataForm.getField('linkedObject')(state)
}

export const getLinkedObject = state => {
  const { linkedObject } = mainConfig.services.auth
  const linkedObjectId = getLinkedObjectId(state)
  return api.selectors.entityManager[linkedObject].getEntities(state).getById(linkedObjectId)
}

export const getLinkedObjectIsLoading = state => {
  const { linkedObject } = mainConfig.services.auth
  const linkedObjectId = getLinkedObjectId(state)
  return api.selectors.entityManager[linkedObject].getEntities(state).getIsLoadingById(linkedObjectId)
}

export const getActiveAcoount = state => {
  const authData = getAuthData(state)
  const linkedObject = getLinkedObject(state)
  return {
    ...authData,
    abac: undefined,
    linkedObject,
  }
}

export const getPermissions = state => {
  return forms.selectors.authDataForm.getField('abac')(state)
}
