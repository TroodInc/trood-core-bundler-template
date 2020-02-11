import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import { api, forms, RESTIFY_CONFIG } from 'redux-restify'

import App from './components/App'

import auth from '$trood/auth'

import mailService from '$trood/mailService'

import { withService, SERVICES_PROPS_NAMES } from '$trood/serviceManager'

import { applySelectors } from '$trood/helpers/selectors'

import entityManager, {
  getModelEntitiesName,
  getModelComponentsName,
  getModelConstantsName,
  getModelEditorActionsName,
  getModelActionsName,
  getModelApiActionsName,
  parseModalQuery,
} from '$trood/entityManager'

import modals from '$trood/modals'

import systemConfig from '$trood/config'


const layoutConfig = systemConfig.layouts || {}
const layoutConfigFormKey = 'layoutConfigForm'
const layoutConfigFormActionsKey = 'layoutConfigFormActions'
const layoutPropsKey = [layoutConfigFormKey, layoutConfigFormActionsKey]

const linkedModalsPropsKey = []

const currentEntitiesSelectors = applySelectors(`layoutContainerCurrentEntities${Math.random()}`)
const layoutModelsDict = layoutConfig.models || {}

const layoutEntitiesToGet = Object.keys(layoutModelsDict).reduce((prevEntities, model) => {
  const currentBusinessObject = layoutModelsDict[model]
  const entititiesListGetter = (state) => api.selectors.entityManager[currentBusinessObject].getEntities(state)
  const modelEntitiesName = getModelEntitiesName(model)
  const modelComponentsName = getModelComponentsName(model)
  const modelConstantsName = getModelConstantsName(model)
  layoutPropsKey.push(modelEntitiesName, modelComponentsName, modelConstantsName)
  return {
    ...prevEntities,
    [modelEntitiesName]: entititiesListGetter,
    [modelComponentsName]: () => {
      const currentModel = RESTIFY_CONFIG.registeredModels[currentBusinessObject]
      return currentModel.components
    },
    [modelConstantsName]: () => {
      const currentModel = RESTIFY_CONFIG.registeredModels[currentBusinessObject]
      return currentModel.constants
    },
  }
}, {})

const layoutServicesToGet = layoutConfig.services || []

layoutServicesToGet.forEach(service => {
  layoutPropsKey.push(...SERVICES_PROPS_NAMES[service])
})

const stateToProps = (state, props) => {
  const layoutEntities = currentEntitiesSelectors(state, layoutEntitiesToGet)
  let linkedModals = props.location.query.modal
  if (!Array.isArray(linkedModals)) {
    linkedModals = [linkedModals]
  }
  linkedModals = linkedModals.filter(modal => {
    const parsedModalQuery = parseModalQuery(modal)
    if (!parsedModalQuery) return false
    const { modelName } = parsedModalQuery
    return !!api.selectors.entityManager[modelName]
  })

  const linkedModalsModels = linkedModals.map(modal => {
    const { modelName } = parseModalQuery(modal)
    return modelName
  })
  const linkedModalsModelsEntities = linkedModalsModels.reduce((memo, modelName) => {
    const modelEntitiesName = getModelEntitiesName(modelName)
    linkedModalsPropsKey.push(modelEntitiesName)
    return {
      ...memo,
      [modelEntitiesName]: api.selectors.entityManager[modelName].getEntities(state),
    }
  }, {})
  return {
    ...props,
    linkedModals,
    linkedModalsModels,
    ...linkedModalsModelsEntities,
    ...layoutEntities,
    [layoutConfigFormKey]: forms.selectors.layoutConfigForm.getForm(state),
    isHasAuthData: auth.selectors.getIsHasAuthData(state),
    authData: auth.selectors.getAuthData(state),
    permissions: auth.selectors.getPermissions(state),
    activeAccount: auth.selectors.getActiveAcoount(state),
    isAuthenticated: auth.selectors.getIsAuthenticated(state),
    isLoading: api.selectors.loadsManager.getIsLoading(state),
    getProfile: () => auth.selectors.getProfile(state),
    getModalOpen: modalName => modals.selectors.getModalOpen(modalName)(state),
  }
}

const dispatchToProps = (dispatch) => ({
  dispatch,
  authActions: bindActionCreators(auth.actions, dispatch),
  [layoutConfigFormActionsKey]: bindActionCreators(forms.actions.layoutConfigForm, dispatch),
  mailServiceActions: bindActionCreators(mailService.actions, dispatch),
  modalsActions: bindActionCreators(modals.actions, dispatch),
  apiActions: bindActionCreators(api.actions, dispatch),
})

const getModelEditorActions = modelName => Object.keys(entityManager.actions).reduce((prevActions, action) => ({
  ...prevActions,
  [action]: entityManager.actions[action](modelName, []),
}), {})

const mergeProps = (stateProps, dispatchProps) => {
  const { linkedModalsModels } = stateProps
  const linkedModalsModelsEditorActions = linkedModalsModels.reduce((memo, modelName) => ({
    ...memo,
    [getModelEditorActionsName(modelName)]:
      bindActionCreators(getModelEditorActions(modelName), dispatchProps.dispatch),
  }), {})
  const layoutEntitiesActions = Object.keys(layoutModelsDict).reduce((memo, modelName) => {
    const currentModel = RESTIFY_CONFIG.registeredModels[layoutModelsDict[modelName]]
    const mapedActions = Object.keys(entityManager.actions).reduce((prevActions, action) => ({
      ...prevActions,
      [action]: entityManager.actions[action](modelName, []),
    }), {})
    const apiActions = api.actions.entityManager[layoutModelsDict[modelName]]
    return {
      ...memo,
      [getModelEditorActionsName(modelName)]: bindActionCreators(mapedActions, dispatchProps.dispatch),
      [getModelActionsName(modelName)]: bindActionCreators(currentModel.actions, dispatchProps.dispatch),
      [getModelApiActionsName(modelName)]: bindActionCreators(apiActions, dispatchProps.dispatch),
    }
  }, {})
  const mergedProps = {
    ...stateProps,
    ...dispatchProps,
  }
  const finalMergedProps = Object.keys(mergedProps).reduce((memo, key) => {
    const result = {
      ...memo,
    }
    if (layoutPropsKey.includes(key)) {
      result.layoutProps = {
        ...memo.layoutProps,
        [key]: mergedProps[key],
      }
    } else {
      result[key] = mergedProps[key]
    }
    if (linkedModalsPropsKey.includes(key)) {
      result[key] = mergedProps[key]
    }
    return result
  }, {})
  return {
    ...finalMergedProps,
    ...linkedModalsModelsEditorActions,
    layoutProps: {
      ...finalMergedProps.layoutProps,
      ...layoutEntitiesActions,
    },
  }
}

export default withRouter(withService(layoutServicesToGet, stateToProps, dispatchToProps, mergeProps)(App))
