import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import { forms, api, RESTIFY_CONFIG } from 'redux-restify'

import PageGridLayout from './components/PageGridLayout'

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
  // Here we recursively get all components inside the config(case with nested grids)
  const currentEntitiesSelectors = applySelectors(`pageContainerCurrentEntities${Math.random()}`)
  const currentEntitiyListsSelectors = applySelectors(`pageContainerEntityLists${Math.random()}`)
  const currentFormsSelectors = applySelectors(`pageContainerCurrentForms${Math.random()}`)
  const reduceComponents = (memo, component) => {
    if (component.components) {
      return memo.concat(component).concat(component.components.reduce(reduceComponents, []))
    }
    return memo.concat(component)
  }
  const currentComponents = (pageConfig.components || []).reduce(reduceComponents, [])
  // Getting selectors for restify entities selectors
  const entitiesToBusinessObjectsDict = {}
  // Used for accessing entities by their names, not with `entities` suffix
  const entityListsGetters = {}
  const entitiesToGet = currentComponents.reduce((memo, component) => {
    if (!component.models) return memo
    const currentComponentEntities = Object.keys(component.models).reduce((prevEntities, model) => {
      const currentBusinessObject = component.models[model]
      entitiesToBusinessObjectsDict[model] = currentBusinessObject
      const entititiesListGetter = (state) => api.selectors.entityManager[currentBusinessObject].getEntities(state)
      entityListsGetters[model] = entititiesListGetter
      return {
        ...prevEntities,
        // Here we map component defined entities names to business object, wich are defined in system config
        [getModelEntitiesName(model)]: entititiesListGetter,
        [getModelComponentsName(model)]: () => {
          const currentModel = RESTIFY_CONFIG.registeredModels[currentBusinessObject]
          return currentModel.components
        },
        [getModelConstantsName(model)]: () => {
          const currentModel = RESTIFY_CONFIG.registeredModels[currentBusinessObject]
          return currentModel.constants
        },
      }
    }, {})
    return {
      ...memo,
      ...currentComponentEntities,
    }
  }, {})

  // Getting selectors for forms, binded to components
  const formsToGet = currentComponents.reduce((memo, component) => {
    if (!componentsManifest.forms || !componentsManifest.forms[component.type]) {
      return memo
    }
    return {
      ...memo,
      [component.type]: (state) => forms.selectors[component.type].getForm(state),
    }
  }, {})

  // Getting trood services for all components entities
  const servicesToGet = currentComponents.reduce((memo, component) => {
    if (!componentsManifest.services[component.type]) {
      return memo
    }
    return memo.concat(componentsManifest.services[component.type])
  }, [])

  const stateToProps = (state, props) => {
    const currentEntities = currentEntitiesSelectors(state, entitiesToGet)
    const currentEntityLists = currentEntitiyListsSelectors(state, entityListsGetters)
    const currentForms = currentFormsSelectors(state, formsToGet, getFormPropName)

    let modelId
    let model
    let childForms = []
    let childEntitiesByModel = {}
    if (entityPageModelName) {
      const entityPageEntities = api.selectors.entityManager[entityPageModelName].getEntities(state)
      // TODO this is hack for inherit modelId sleector(now only personalAccount page case),
      // rework after more thoughtfull nested page logic will be implemented
      const idSelector = props.entityPageModelIdSelector || entityPageModelIdSelector
      modelId = idSelector(state, props)
      if (!Number.isNaN(parseInt(modelId, 10))) {
        modelId = parseInt(modelId, 10)
      }
      model = entityPageEntities.getById(modelId)

      const currentChildFormRegexp = getChildFormRegexp({ parentModel: entityPageModelName, parentId: modelId })
      childForms = forms.selectors.getForm(currentChildFormRegexp)(state)
      const currentModel = RESTIFY_CONFIG.registeredModels[entityPageModelName]
      childEntitiesByModel =
        getChildEntitiesByModel(entityPageModelName, currentModel, currentEntityLists, modelId, { childForms, model })
    }

    return {
      modelId,
      model,
      ...props,
      ...currentEntities,
      ...childEntitiesByModel,
      ...currentForms,
      entityPageModelName,
    }
  }

  const dispatchToProps = dispatch => {
    const currentFormsActions = Object.keys(formsToGet).reduce((memo, key) => ({
      ...memo,
      [getFormActionsName(key)]: bindActionCreators(forms.getFormActions(key), dispatch),
      modalsActions: bindActionCreators(modals.actions, dispatch),
    }), {})
    return {
      ...currentFormsActions,
      dispatch,
    }
  }

  const mergeProps = (stateProps, dispatchProps) => {
    const currentEntitiesActions = Object.keys(entitiesToBusinessObjectsDict).reduce((memo, modelName) => {
      const currentModel = RESTIFY_CONFIG.registeredModels[entitiesToBusinessObjectsDict[modelName]]
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
        [action]: entityManager.actions[action](modelName, currentParents),
      }), {})

      const apiActions = api.actions.entityManager[entitiesToBusinessObjectsDict[modelName]]
      return {
        ...memo,
        [getModelEditorActionsName(modelName)]: bindActionCreators(mapedActions, dispatchProps.dispatch),
        [getModelActionsName(modelName)]: bindActionCreators(currentModel.actions, dispatchProps.dispatch),
        [getModelApiActionsName(modelName)]: bindActionCreators(apiActions, dispatchProps.dispatch),
      }
    }, {})

    return {
      ...stateProps,
      ...dispatchProps,
      ...currentEntitiesActions,
    }
  }

  return withRouter(withService(servicesToGet, stateToProps, dispatchToProps, mergeProps)(PageGridLayout))
}

export default getPageContainer
