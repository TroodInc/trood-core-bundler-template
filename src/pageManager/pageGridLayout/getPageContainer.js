import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'
import getPageChildContainer from './getPageChildContainer'

import { forms, api, RESTIFY_CONFIG } from 'redux-restify'

import PageGridLayout from './components/PageGridLayout'

import auth from '$trood/auth'

import modals from '$trood/modals'

import entityManager, {
  getModelEditorActionsName,
  getFormActionsName,
  getFormPropName,
  getChildFormRegexp,
  getModelComponentsName,
  getModelActionsName,
  getModelConstantsName,
  getModelEntitiesName,
  getModelApiActionsName,
  getChildEntitiesByModel,
} from '$trood/entityManager'

import { withService } from '$trood/serviceManager'

import { applySelectors } from '$trood/helpers/selectors'

import componentsManifest from '$trood/componentLibraries/manifest'


const getPageContainer = (pageConfig, entityPageModelName, entityPageModelIdSelector) => {
  const entitiesSelectors = applySelectors(`pageContainerCurrentEntities${Math.random()}`)
  const entityListsSelectors = applySelectors(`pageContainerEntityLists${Math.random()}`)
  const formsSelectors = applySelectors(`pageContainerCurrentForms${Math.random()}`)

  // Here we recursively get all components inside the config(case with nested grids)
  const reduceComponents = (memo, component) => {
    if (component.components) {
      return memo.concat(component).concat(component.components.reduce(reduceComponents, []))
    }
    return memo.concat(component)
  }
  const components = (pageConfig.components || []).reduce(reduceComponents, [])

  const models = components
    .reduce((memo, c) => [...memo, ...Object.values(c.models || {})], [entityPageModelName])
    .filter((item, i, arr) => item && arr.indexOf(item) === i)

  const entityListsGetters = {}
  const entitiesToGet = models.reduce((memo, model) => {
    entityListsGetters[model] = (state) => api.selectors.entityManager[model].getEntities(state)
    return {
      ...memo,
      [getModelEntitiesName(model)]: entityListsGetters[model],
      [getModelComponentsName(model)]: () => {
        const currentModel = RESTIFY_CONFIG.registeredModels[model]
        return currentModel.components
      },
      [getModelConstantsName(model)]: () => {
        const currentModel = RESTIFY_CONFIG.registeredModels[model]
        return currentModel.constants
      },
    }
  }, {})

  // Getting selectors for forms, binded to components
  const formsToGet = components.reduce((memo, component) => {
    if (!componentsManifest.forms || !componentsManifest.forms[component.id]) {
      return memo
    }
    return {
      ...memo,
      [component.id]: (state) => forms.selectors[component.id].getForm(state),
    }
  }, {})

  const stateToProps = (state, props) => {
    const currentEntities = entitiesSelectors(state, entitiesToGet)
    const currentEntityLists = entityListsSelectors(state, entityListsGetters)
    const currentForms = formsSelectors(state, formsToGet, getFormPropName)

    let modelId
    let model
    let modelIsLoading
    let childForms = []
    let childEntitiesByModel = {}
    if (entityPageModelName) {
      const entityPageEntities = currentEntityLists[entityPageModelName]
      const idSelector = props.entityPageModelIdSelector || entityPageModelIdSelector
      modelId = idSelector(state, props)
      if (!Number.isNaN(+modelId)) {
        modelId = +modelId
      }
      const query = props?.page?.query
      model = entityPageEntities.getById(modelId, { query })
      modelIsLoading = entityPageEntities.getIsLoadingById(modelId, { query })

      const currentChildFormRegexp = getChildFormRegexp({ parentModel: entityPageModelName, parentId: modelId })
      childForms = forms.selectors.getForm(currentChildFormRegexp)(state)
      const currentModel = RESTIFY_CONFIG.registeredModels[entityPageModelName]
      childEntitiesByModel =
        getChildEntitiesByModel(entityPageModelName, currentModel, currentEntityLists, modelId, { childForms, model })
    }

    return {
      ...props,
      ...currentEntities,
      ...childEntitiesByModel,
      ...currentForms,
      model,
      modelIsLoading,
      modelId,
      entityPageModelName,
    }
  }

  const dispatchToProps = dispatch => {
    const currentFormsActions = Object.keys(formsToGet).reduce((memo, key) => ({
      ...memo,
      [getFormActionsName(key)]: bindActionCreators(forms.getFormActions(key), dispatch),
    }), {
      authActions: bindActionCreators(auth.actions, dispatch),
      modalsActions: bindActionCreators(modals.actions, dispatch),
    })
    return {
      ...currentFormsActions,
      dispatch,
    }
  }

  const mergeProps = (stateProps, dispatchProps) => {
    const currentEntitiesActions = models.reduce((memo, model) => {
      const currentModel = RESTIFY_CONFIG.registeredModels[model]
      const currentParents = []
      if (entityPageModelName) {
        currentParents.push({
          modelName: entityPageModelName,
          id: stateProps.modelId,
          skipSubmit: true,
        })
      }
      // Getting restify entities actions
      const mapedActions = Object.keys(entityManager.actions).reduce((prevActions, action) => ({
        ...prevActions,
        [action]: entityManager.actions[action](model, currentParents),
      }), {})

      const apiActions = api.actions.entityManager[model]
      return {
        ...memo,
        [getModelEditorActionsName(model)]: bindActionCreators(mapedActions, dispatchProps.dispatch),
        [getModelActionsName(model)]: bindActionCreators(currentModel.actions, dispatchProps.dispatch),
        [getModelApiActionsName(model)]: bindActionCreators(apiActions, dispatchProps.dispatch),
        PageChildContainer: dispatchProps.dispatch(getPageChildContainer),
      }
    }, {})

    return {
      ...stateProps,
      ...dispatchProps,
      ...currentEntitiesActions,
    }
  }

  const servicesToGet = components.reduce((memo, component) => {
    if (!componentsManifest.services[component.type]) {
      return memo
    }
    return [...memo, ...componentsManifest.services[component.type]]
  }, [])

  return withRouter(withService(servicesToGet, stateToProps, dispatchToProps, mergeProps)(PageGridLayout))
}

export default getPageContainer
