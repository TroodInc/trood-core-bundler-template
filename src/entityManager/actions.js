import uuidV4 from 'uuid/v4'

import { api, forms, RESTIFY_CONFIG, RestifyForeignKeysArray } from 'redux-restify'

import modals from '$trood/modals'

import history from '$trood/history'

import {
  getBaseFormName,
  getEditModalName,
  getViewModalName,
  getEditFormName,
  modalQueryToString,
} from './constants'


export const createEntityForm = (modelName, parents = []) => (
  id,
  {
    defaults = {},
    values = {},
    isSubmitted = false,
  } = {},
) => async (dispatch, getState) => {
  const currentModel = RESTIFY_CONFIG.registeredModels[modelName]
  let state = getState()
  const tempId = id || uuidV4()
  const formName = getEditFormName({
    modelName,
    id: tempId,
    parents,
  })

  const oldForm = forms.selectors.getForm(formName)(state)
  const formActions = forms.getFormActions(formName)
  if (oldForm) {
    return {
      formName,
      form: oldForm,
      formActions,
    }
  }

  const newForm = forms.createFormConfig({
    baseConfig: getBaseFormName(modelName),
    model: modelName,
    defaults: {
      ...defaults,
      id,
      tempId,
      isSubmitted,
    },
    values,
    submitExclude: {
      tempId: true,
      isSubmitted: true,
    },
    validateAll: true,
    deleteOnSubmit: true,
  })
  const modelToEdit =
    await api.selectors.entityManager[modelName].getEntities(state).asyncGetById(id, { forceLoad: true })

  dispatch(forms.actions.createForm(formName, newForm, true))

  if (modelToEdit) {
    if (typeof currentModel.actions.mapModelToForm === 'function') {
      dispatch(currentModel.actions.mapModelToForm(modelToEdit, formActions))
    } else {
      dispatch(formActions.applyServerData(modelToEdit))
    }
  }
  state = getState()
  const form = forms.selectors.getForm(formName)(state)
  return {
    formName,
    form,
    formActions,
  }
}

export const createChildForm = createEntityForm

const changeModalQuery = (modalProps, add) => {
  let modalChanged = false
  const modalQuery = modalQueryToString(modalProps)

  let { modal = [] } = history.location.query
  if (!Array.isArray(modal)) modal = [modal]

  if (add && !modal.includes(modalQuery)) {
    modalChanged = true
    modal.push(modalQuery)
  } else if (!add && modal.includes(modalQuery)) {
    modalChanged = true
    modal = modal.filter(m => m !== modalQuery)
  }

  if (modal.length === 1) modal = modal[0]

  if (modalChanged) {
    history.replace({
      pathname: history.location.pathname,
      query: {
        ...history.location.query,
        modal,
      },
    })
  }
}

export const viewEntity = (modelName, parents) => (model, addToQuery = true) => (dispatch) => {
  const modelId = typeof model === 'object' ? model.id : model
  const modalProps = {
    modalType: 'view',
    modelName,
    modelId,
  }
  if (addToQuery) {
    changeModalQuery(modalProps, true)
  }

  dispatch(modals.actions.showModal(true, getViewModalName(modelName), {
    entityId: modelId,
    isEditing: true,
    parents,
    closeAction: () => changeModalQuery(modalProps, false),
  }))
}

/**
 * Start edit entity, shows modal
 * @param {number|string|Object} [model] - can be either restify model, restify form or entity id to edit
 */
const generalEditEntity = (showModal) => (modelName, parents = []) => (model, config = {}) => async (dispatch) => {
  let currentForm
  let idToEdit = model
  let prevForm
  let isEditing = false
  if (typeof model === 'object') {
    // Here we edit already existed, but not sent form, so we should remember it state
    if (model.id) {
      idToEdit = model.id
    } else {
      // TODO by @deylak return actions and name here
      const formName = getEditFormName({
        modelName,
        id: model.tempId,
        parents,
      })
      const formActions = forms.getFormActions(formName)
      currentForm = {
        form: model,
        formName,
        formActions,
      }
      prevForm = { ...model }
      isEditing = true
    }
  }
  if (!currentForm) {
    currentForm = await dispatch(createEntityForm(modelName, parents)(idToEdit, config))
  }
  if (showModal) {
    dispatch(modals.actions.showModal(true, getEditModalName(modelName), {
      title: config.title,
      onSuccess: config.onSuccess,
      onDelete: config.onDelete,
      entityId: currentForm.form.id || currentForm.form.tempId,
      isEditing: isEditing || !!currentForm.form.id,
      parents,
      prevForm,
    }))
  } else {
    dispatch(currentForm.formActions.changeSomeFields({
      isSubmitted: false,
      prevForm,
    }, true))
  }
  return currentForm
}

const generalEditModalEntity = generalEditEntity(true)
const generalEditInlineEntity = generalEditEntity(false)

export const editEntity = (modelName) => generalEditModalEntity(modelName)
export const editChildEntity = generalEditModalEntity
export const editInlineEntity = (modelName) => generalEditInlineEntity(modelName)
export const editInlineChildEntity = generalEditInlineEntity

export const deleteEntity = (modelName, parents = []) => (model, onDelete) => (dispatch, getState) => {
  return new Promise(async (resolve) => {
    const currentModelConfig = RESTIFY_CONFIG.registeredModels[modelName]
    const state = getState()
    let idToDelete
    if (typeof model === 'object') {
      if (model[currentModelConfig.idField]) {
        idToDelete = model[currentModelConfig.idField]
      }
    } else {
      idToDelete = model
    }
    // Make sure, we have real model here
    const modelObject = await api.selectors.entityManager[modelName].getEntities(state).asyncGetById(idToDelete)

    if (idToDelete) {
      const currentModelActions = currentModelConfig.actions

      let deleteAction
      if (typeof onDelete === 'function') {
        deleteAction = onDelete(idToDelete, modelObject)
      } else if (typeof currentModelActions.deleteEntity === 'function') {
        deleteAction = currentModelActions.deleteEntity(idToDelete, modelObject)
      } else {
        deleteAction = api.actions.entityManager[modelName].deleteById(idToDelete)
      }

      let afterDeleteAction = () => {}
      if (parents.length) {
        const lastParent = parents[parents.length - 1]
        const parentFormName = getEditFormName({
          ...lastParent,
          parents: parents.slice(0, parents.length - 1),
        })
        const parentForm = forms.selectors.getForm(parentFormName)(state)

        if (parentForm) {
          const parentFormActions = forms.getFormActions(parentFormName)
          const parentModelConfig = RESTIFY_CONFIG.registeredModels[lastParent.modelName]
          const parentModelField = Object.keys(parentModelConfig.defaults).find(key => {
            const parentModelDefault = parentModelConfig.defaults[key]
            return parentModelDefault instanceof RestifyForeignKeysArray &&
              parentModelDefault.modelType === modelName
          })
          const newParentFormFieldValue = parentForm[parentModelField]
            .filter(v => v !== idToDelete)

          afterDeleteAction = () => dispatch(parentFormActions.changeField(parentModelField, newParentFormFieldValue))
        }
      }

      if (currentModelConfig.deletion && currentModelConfig.deletion.confirm) {
        dispatch(modals.actions.showConfirmModal({
          text: currentModelConfig.deletion.message || 'Удалить запись?',
          acceptButtonText: 'Да',
          onAccept: async () => {
            await dispatch(deleteAction)
              .then(afterDeleteAction)
            resolve()
          },
        }))
      } else {
        await dispatch(deleteAction)
          .then(afterDeleteAction)
        resolve()
      }
    } else {
      const formName = getEditFormName({
        modelName,
        id: model.tempId,
        parents,
      })
      dispatch(forms.actions.deleteForm(formName))
      resolve()
    }
  })
}
