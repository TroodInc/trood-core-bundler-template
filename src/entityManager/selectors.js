import { bindActionCreators } from 'redux'

import { api, RESTIFY_CONFIG, RestifyForeignKeysArray } from 'redux-restify'

import {
  getCreateFormFromServiceActionName,
  getCreateFormFromServiceActionCheckName,
  getModelNameFromFormName,
  getChildEntityName,
  getModelEntitiesName,
  getModelEditorActionsName,
  getAttachMailActionName,
  getAttachMailActionCheckName,
  getModelApiActionsName,
  getAttachedEntityActionName,
} from './constants'

import * as actions from './actions'


export const getEntitiesToGet = (modelName, modelConfig = {}) => {
  const dependsOn = modelConfig.dependsOn || []

  // Getting selectors for restify entities selectors
  // TODO by @deylak services should not be treated as model name, we should add serviceManager here
  return dependsOn.concat(modelName).reduce((memo, model) => ({
    ...memo,
    [model]: (state) => api.selectors.entityManager[model].getEntities(state),
  }), {})
}

export const getCurrentPropsEntities = (currentEntities) => {
  return Object.keys(currentEntities).reduce((memo, key) => ({
    ...memo,
    [getModelEntitiesName(key)]: currentEntities[key],
  }), {})
}

export const getChildEntitiesByModel =
  (modelName, modelConfig = {}, currentEntities, entityId, { childForms = [], model }) => {
    // For child entities let's try to pre-construct array of child entities from childForms
    // If we have edit form of some entity, form will be used, instead of initial restify model
    // Here we create a lazy-getters for child arrays, so we don't trigger any requests
    return Object.keys(currentEntities).reduce((memo, key) => {
      const currentModelName = currentEntities[key].modelType
      const currentChildForms = Object.keys(childForms).reduce((memoArray, formName) => {
        if (currentModelName !== getModelNameFromFormName(formName)) {
          return memoArray
        }
        return memoArray.concat(childForms[formName])
      }, [])

      const currentChildModelField = Object.keys(modelConfig.defaults).find(key => {
        const currentDefault = modelConfig.defaults[key]
        return currentDefault instanceof RestifyForeignKeysArray && currentDefault.modelType === currentModelName
      })

      return {
        ...memo,
        [getChildEntityName(key)]: {
          getChildArray: (filterSubmitted = false, oldFirst = false) => {
            let currentArray = []
            // By checking model type, we define, if the model is form, or restify model
            if (model && !model.$modelType && model[currentChildModelField]) {
              currentArray = model[currentChildModelField]
                // Filter out temporary forms, while submitting entitites
                .filter(form => typeof form !== 'object')
                .map(id => currentEntities[key].getById(id))
            } else if (model && model[currentChildModelField]) {
              currentArray = model[`${currentChildModelField}Ids`]
                .map(id => currentEntities[key].getById(id)) // TODO fix depth in restify & delete this
            }
            // Replace entities with their existing editing forms
            const editedArray = currentArray
              .filter(item => !item.$deleted)
              .map(item => {
                const editChildForm = currentChildForms.find(form => {
                  if (!filterSubmitted) {
                    return item.id === form.id && form.isSubmitted
                  }
                  return item.id === form.id
                })
                return editChildForm || item
              })
            const createdArray = currentChildForms
              .filter(form => {
                if (!filterSubmitted) {
                  return !form.id && form.isSubmitted
                }
                return !form.id
              })
            if (oldFirst) {
              return editedArray.concat(createdArray)
            }
            return createdArray.concat(editedArray)
          },
          getIsLoadingChildArray: () => {
            if (model && !model.$modelType && model.id && model[currentChildModelField]) {
              return model[currentChildModelField].some(id => currentEntities[key].getIsLoadingById(id))
            }
            return false
          },
          getChildArrayCount: (filterSubmitted = false) => {
            const entities = (model && model[currentChildModelField] ? model[currentChildModelField] : [])
              .filter(item => !item.$deleted)
            const entitiesCount = entities.length
            const formsCount = currentChildForms.filter(form => {
              if (!filterSubmitted) {
                return !form.id && form.isSubmitted
              }
              return !form.id
            }).length
            return entitiesCount + formsCount
          },
        },
      }
    }, {})
  }

export const getEntitiesActions = (modelName, entitiesToGet, entityId, parents, skipSubmit) => {
  return Object.keys(entitiesToGet).reduce((memo, currentModelName) => ({
    ...memo,
    [currentModelName]: Object.keys(actions).reduce((prevActions, action) => {
      let currentNewParents = []
      // Here we check, if we calculate actions for current model, we don't pass it as parent
      if (currentModelName !== modelName) {
        currentNewParents = {
          modelName,
          id: entityId,
          skipSubmit,
        }
      }
      return {
        ...prevActions,
        [action]: actions[action](currentModelName, (parents || []).concat(currentNewParents)),
      }
    }, {}),
  }), {})
}

export const getCurrentEntitiesActions = (entitiesActions, dispatch) => {
  return Object.keys(entitiesActions).reduce((memo, key) => ({
    ...memo,
    [getModelEditorActionsName(key)]: bindActionCreators(entitiesActions[key], dispatch),
    [getModelApiActionsName(key)]: bindActionCreators(api.actions.entityManager[key], dispatch),
  }), {})
}

export const getModelsForCreateFormFromService = serviceName => {
  const actionName = getCreateFormFromServiceActionName(serviceName)
  const actionCheckName = getCreateFormFromServiceActionCheckName(serviceName)

  const attachMailActionName = getAttachMailActionName('entity')
  const attachMailActionCheckName = getAttachMailActionCheckName('entity')
  const attachedEntityActionName = getAttachedEntityActionName('entity')
  const { registeredModels } = RESTIFY_CONFIG
  return Object.keys(registeredModels).reduce((memo, modelName) => {
    const currentModelActions = registeredModels[modelName].actions || {}
    if (typeof currentModelActions[actionName] === 'function') {
      const currentActionName = getCreateFormFromServiceActionName(serviceName, modelName)
      const currentActionCheckName = getCreateFormFromServiceActionCheckName(serviceName, modelName)

      const currentAttachMailActionName = getAttachMailActionName(modelName)
      const currentAttachMailActionCheckName = getAttachMailActionCheckName(modelName)

      const currentAttachedEntityActionName = getAttachedEntityActionName(modelName)
      return {
        models: memo.models.concat([{
          modelName,
          modelTitle: registeredModels[modelName].name,
          createEntityActionTitle: `Create ${registeredModels[modelName].name.toLowerCase()}`,
          attachMailActionTitle: `Link to ${registeredModels[modelName].name.toLowerCase()}`,
          createEntityActionName: currentActionName,
          createEntityActionCheckName: currentActionCheckName,
          attachMailActionName: currentAttachMailActionName,
          attachMailActionCheckName: currentAttachMailActionCheckName,
          getAttachedEntityActionName: currentAttachedEntityActionName,
        }]),
        actions: {
          ...memo.actions,
          [currentActionName]: registeredModels[modelName].actions[actionName],
          [currentActionCheckName]: registeredModels[modelName].actions[actionCheckName],
          [currentAttachMailActionName]: registeredModels[modelName].actions[attachMailActionName],
          [currentAttachMailActionCheckName]: registeredModels[modelName].actions[attachMailActionCheckName],
          [currentAttachedEntityActionName]: registeredModels[modelName].actions[attachedEntityActionName],
        },
      }
    }
    return memo
  }, { models: [], actions: [] })
}
