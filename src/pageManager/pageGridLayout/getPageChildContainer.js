import React from 'react'
import { bindActionCreators } from 'redux'
import { api, forms, RESTIFY_CONFIG } from 'redux-restify'
import memoizeOne from 'memoize-one'

import { applySelectors } from '$trood/helpers/selectors'

import entityManager, {
  getModelEditorActionsName,
  getChildFormRegexp,
  getModelComponentsName,
  getModelActionsName,
  getModelConstantsName,
  getModelEntitiesName,
  getModelApiActionsName,
  getChildEntitiesByModel,
} from '$trood/entityManager'


const getPageChildContainer = (dispatch, getState) => ({
  model = {},
  models = {},
  children,
}) => {
  const currentEntitiesSelectors = applySelectors(`pageContainerCurrentEntities${Math.random()}`)
  const currentEntitiyListsSelectors = applySelectors(`pageContainerEntityLists${Math.random()}`)

  const currentParents = []
  if (model.$modelType) {
    currentParents.push({
      modelName: model.$modelType,
      id: model.id,
      skipSubmit: true,
    })
  }

  const entitiesToBusinessObjectsDict = {}
  const entityListsGetters = {}
  const entitiesToGet = Object.keys(models).reduce((memo, key) => {
    const currentBusinessObject = models[key]
    const currentModel = RESTIFY_CONFIG.registeredModels[currentBusinessObject]
    entitiesToBusinessObjectsDict[key] = currentBusinessObject
    const entititiesListGetter = (state) => api.selectors.entityManager[currentBusinessObject].getEntities(state)
    entityListsGetters[key] = entititiesListGetter
    return {
      ...memo,
      [getModelEntitiesName(key)]: entititiesListGetter,
      [getModelComponentsName(key)]: () => currentModel.components,
      [getModelConstantsName(key)]: () => currentModel.constants,
    }
  }, {})

  const state = getState()
  const currentEntities = currentEntitiesSelectors(state, entitiesToGet)

  const modelConfig = RESTIFY_CONFIG.registeredModels[model.$modelType]
  const currentEntityLists = currentEntitiyListsSelectors(state, entityListsGetters)
  const currentChildFormRegexp = getChildFormRegexp({ parentModel: model.$modelType, parentId: model.id })
  const childForms = forms.selectors.getForm(currentChildFormRegexp)(state)
  const childEntitiesByModel =
    getChildEntitiesByModel(model.$modelType, modelConfig, currentEntityLists, model.id, { childForms, model })

  const currentEntitiesActions = Object.keys(entitiesToBusinessObjectsDict).reduce((memo, modelName) => {
    const currentModel = RESTIFY_CONFIG.registeredModels[entitiesToBusinessObjectsDict[modelName]]
    const mapedActions = Object.keys(entityManager.actions).reduce((prevActions, action) => ({
      ...prevActions,
      [action]: entityManager.actions[action](modelName, currentParents),
    }), {})

    const apiActions = api.actions.entityManager[entitiesToBusinessObjectsDict[modelName]]
    return {
      ...memo,
      [getModelEditorActionsName(modelName)]: bindActionCreators(mapedActions, dispatch),
      [getModelActionsName(modelName)]: bindActionCreators(currentModel.actions, dispatch),
      [getModelApiActionsName(modelName)]: bindActionCreators(apiActions, dispatch),
      PageChildContainer: dispatch(getPageChildContainer),
    }
  }, {})

  const props = {
    model,
    ...currentEntities,
    ...childEntitiesByModel,
    ...currentEntitiesActions,
    parents: currentParents,
  }

  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <React.Fragment>
      {
        childrenArray.map((item, i) => {
          if (typeof item === 'function') {
            return item({ ...props, key: i })
          }
          return <item.type key={i} {...item.props} {...props} />
        })
      }
    </React.Fragment>
  )
}

export default memoizeOne(getPageChildContainer)
