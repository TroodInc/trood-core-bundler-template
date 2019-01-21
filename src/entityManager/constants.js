import React from 'react'

import { capitalize, lowerize } from '$trood/helpers/namingNotation'


const slashOrNoop = value => `${value ? `/${value}` : ''}`

export const getBaseFormName = formName => `base${capitalize(formName)}`
export const getEditFormName = ({
  modelName,
  id,
  parents = [],
}) => {
  // Here we should define form name structure, so we can find object forms by parent type and id regexp
  // We use reverse here, so we can easier look for direct parent with regexp
  const mapedParents = parents.map(item => `${item.modelName}${slashOrNoop(item.id)}`).reverse()
  return `edit${capitalize(modelName)}` +
    `${slashOrNoop(id)}` +
    `${mapedParents.length ? '_parents_' : ''}` +
    `${mapedParents.join('_')}`
}

// TODO by @deylak we can dramatically optimize RegExp creation by memoizing
export const getChildFormRegexp = ({
  modelName = '',
  parentModel,
  parentId,
}) => {
  return new RegExp(`edit${capitalize(modelName)}.*_parents_${parentModel}${parentId ? `\\/${parentId}` : ''}`)
}
export const getModelNameFromFormName = (formName) => {
  return lowerize(formName.match(/edit(.+?)(\/|_parents_)/)[1])
}
export const getEditModalName = modelName => `modalEdit${capitalize(modelName)}`
export const getInlineEditComponentName = modelName => `inlineEditComponent${capitalize(modelName)}`
export const getViewModalName = modelName => `modalView${capitalize(modelName)}`
export const getModelEditorActionsName = modelName => `${modelName}EditorActions`
export const getModelApiActionsName = modelName => `${modelName}ApiActions`
export const getModelActionsName = modelName => `${modelName}Actions`
export const getModelEntitiesName = modelName => `${modelName}Entities`
export const getModelComponentsName = modelName => `${modelName}Components`
export const getModelConstantsName = modelName => `${modelName}Constants`
export const getFormActionsName = formName => `${formName}FormActions`
export const getFormPropName = formName => `${formName}Form`
export const getChildEntityName = modelName => `child${capitalize(modelName)}`
export const getCreateFormFromServiceActionName = (serviceName = '', modelName = '') => (
  `create${capitalize(modelName)}FormFrom${capitalize(serviceName)}`
)
export const getCreateFormFromServiceActionCheckName = (serviceName = '', modelName = '') => (
  `${getCreateFormFromServiceActionName(serviceName, modelName)}Check`
)
export const getAttachMailActionName = (modelName = '') => (
  `attachMailTo${capitalize(modelName)}`
)
export const getAttachMailActionCheckName = (modelName = '') => (
  `${getAttachMailActionName(modelName)}Check`
)
export const getAttachedEntityActionName = (modelName = '') => (
  `getAttached${capitalize(modelName)}`
)

const MODAL_QUERY_DELIMITER = ':'
export const parseModalQuery = (modalQuery = '') => {
  const modalQuerySplit = modalQuery.split(MODAL_QUERY_DELIMITER)
  if (modalQuerySplit.length !== 3) return undefined
  return {
    modalType: modalQuerySplit[0],
    modelName: modalQuerySplit[1],
    modelId: modalQuerySplit[2],
  }
}

export const modalQueryToString = ({ modalType, modelName, modelId }) => {
  return `${modalType}${MODAL_QUERY_DELIMITER}${modelName}${MODAL_QUERY_DELIMITER}${modelId}`
}

export const ENTITY_COMPONENT_EDIT = 'editComponent'
export const ENTITY_COMPONENT_INLINE_EDIT = 'inlineEditComponent'
export const ENTITY_COMPONENT_VIEW = 'viewComponent'

export const MODAL_NAME_FUNCS = {
  [ENTITY_COMPONENT_EDIT]: getEditModalName,
  [ENTITY_COMPONENT_VIEW]: getViewModalName,
  [ENTITY_COMPONENT_INLINE_EDIT]: getEditModalName,
}

export const registeredEntityInlineEditors = {}

export const addRegisteredEntityInlineEditor = (modelName, comp) => {
  registeredEntityInlineEditors[modelName] = comp
}

export const defaultEntityManagerContext = {
  parents: [],
  nextParents: [],
  prevForm: undefined,
}

export const EntityManagerContext = React.createContext(defaultEntityManagerContext)
