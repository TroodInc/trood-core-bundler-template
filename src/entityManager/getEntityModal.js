import React, { PureComponent } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import memoizeOne from 'memoize-one'

import {
  api,
  forms,
  RESTIFY_CONFIG,
  RestifyForeignKeysArray,
  RestifyForeignKey,
  RestifyGenericForeignKey,
} from 'redux-restify'

import modalsStyle from '$trood/styles/modals.css'

import { registerModal, MODAL_SIZES } from '$trood/modals'

import TButton from '$trood/components/TButton'
import { BUTTON_COLORS } from '$trood/components/TButton/constants'
import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'

import {
  getEditFormName,
  getChildFormRegexp,
  getModelNameFromFormName,
  ENTITY_COMPONENT_EDIT,
  ENTITY_COMPONENT_VIEW,
  ENTITY_COMPONENT_INLINE_EDIT,
  MODAL_NAME_FUNCS,
  EntityManagerContext,
} from './constants'

import {
  getEntitiesToGet,
  getChildEntitiesByModel,
  getCurrentPropsEntities,
  getEntitiesActions,
  getCurrentEntitiesActions,
} from './selectors'

import { applySelectors } from '$trood/helpers/selectors'

const linkChildWithParent = (modelName, parentName, parentId, formActions, form) => (dispatch) => {
  const currentParentModel = RESTIFY_CONFIG.registeredModels[parentName]
  const currentModel = RESTIFY_CONFIG.registeredModels[modelName]
  // Define, what type of fk is used and assign it for child model
  // We have 2 types: generic foreign key with _object and id field, or direct foreign key by entity name
  // TODO by @deylak here we use model endpoint as model name and change field, that will be converted to snake_case
  // This would work for topline app, but in general, we should add smth like realModelName
  const currentLinkKey = Object.keys(currentModel.defaults).find(key => {
    const currentDefault = currentModel.defaults[key]
    if (currentDefault instanceof RestifyForeignKey) {
      return currentDefault.modelType === parentName
    } else if (currentDefault instanceof RestifyGenericForeignKey) {
      return currentDefault.modelType.includes(parentName)
    }
    return false
  })

  if (!form[currentLinkKey]) {
    if (currentModel.defaults[currentLinkKey] instanceof RestifyGenericForeignKey) {
      dispatch(formActions.changeField(currentLinkKey, {
        _object: currentParentModel.endpoint,
        [currentParentModel.idField]: parentId,
      }))
    } else if (currentModel.defaults[currentLinkKey] instanceof RestifyForeignKey) {
      dispatch(formActions.changeField(currentLinkKey, parentId))
    }
  }
}

const linkParentWithChild = (parentField, parentForm, childrenForms) => {
  const newChildren = childrenForms.filter(form => !form.id)
  let newParentFieldValue = parentForm[parentField]
    .filter(form => typeof form !== 'object')
    .map(id => {
      const currentChild = childrenForms.find(form => form.id === id)
      return currentChild || id
    })
  newParentFieldValue = newParentFieldValue.concat(newChildren)
  return {
    ...parentForm,
    [parentField]: newParentFieldValue,
  }
}

const getEntityFormSubmit = (modelName, formActions, entityId, isEditing, state, isNested, onSuccess) => {
  const currentModel = RESTIFY_CONFIG.registeredModels[modelName]
  const modelActions = currentModel.actions

  // Define what kind of submit we should use
  // We can define submitEntityForm, or separately submitCreateEntityForm and submitEditEntityForm in business object
  // Or we use form.submit by default
  let submitEntityForm
  if (isEditing) {
    submitEntityForm = modelActions.submitEditEntityForm
  } else {
    submitEntityForm = modelActions.submitCreateEntityForm
  }
  if (typeof submitEntityForm !== 'function') {
    submitEntityForm = modelActions.submitEntityForm
  }
  if (typeof submitEntityForm !== 'function') {
    submitEntityForm = formActions.submit
  }

  // submitEntityForm = () => () => {}

  // Getting child forms submit functions, so we can chain submitting after parent submit called
  const currentChildFormRegexp = getChildFormRegexp({ parentModel: modelName, parentId: entityId })
  const childForms = forms.selectors.getForm(currentChildFormRegexp)(state)
  const childFormsNames = Object.keys(childForms)
  let submitChildForms = {}
  if (childFormsNames.length) {
    const childFormsActions = forms.getFormActions(childFormsNames)
    submitChildForms = childFormsNames.reduce((memo, formName) => {
      const currentModelName = getModelNameFromFormName(formName)
      const currentId = childForms[formName].tempId
      const currentIsEditing = !!childForms[formName].id
      const currentFormActions = childFormsActions[formName]

      const currentParentModelField = Object.keys(currentModel.defaults).find(key => {
        const currentDefault = currentModel.defaults[key]
        return currentDefault instanceof RestifyForeignKeysArray && currentDefault.modelType === currentModelName
      })

      return {
        ...memo,
        [currentModelName]: [
          ...(memo[currentModelName] || []),
          {
            func: getEntityFormSubmit(currentModelName, currentFormActions, currentId, currentIsEditing, state, true),
            parentModelField: currentParentModelField,
            modelName: currentModelName,
            formName,
            formActions: currentFormActions,
            form: childForms[formName],
          },
        ],
      }
    }, {})
  }

  // Create redux action for submitting
  const result = (formName) => async (dispatch, getState) => {
    let parentForm = forms.selectors.getForm(formName)(getState())
    // Use map here, so Promise.all works correctly
    await Promise.all(Object.keys(submitChildForms).map(async childModelName => {
      let parentModelField
      const currentForms = await Promise.all(submitChildForms[childModelName].map(item => {
        // Calculate current parent model field, cause it's the same for all children forms
        parentModelField = item.parentModelField
        // Submit child form
        return dispatch(item.func(item.formName))
      }))
      parentForm = linkParentWithChild(parentModelField, parentForm, currentForms)
    }))

    if (isNested) {
      dispatch(formActions.deleteForm(formName))
    } else {
      // Apply all changes before submitting root parent
      dispatch(formActions.changeSomeFields(parentForm))
      const { data: model, status } = await dispatch(submitEntityForm(formName))
      if (onSuccess) {
        dispatch(onSuccess({ data: model, status }))
      }
    }

    return parentForm
  }
  return result
}


const getEntityEditComponent = (entityComponentName) => (modelName, modelConfig) => {
  const currentModel = modelConfig || RESTIFY_CONFIG.registeredModels[modelName]
  let EntityComponent = currentModel[entityComponentName]
  if (!EntityComponent && entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
    EntityComponent = currentModel[ENTITY_COMPONENT_EDIT]
  }

  const entitiesToGet = getEntitiesToGet(modelName, currentModel)

  const getEntityManagerContext = (entityId, parents, prevForm, nextParents) => {
    let realNextParents = nextParents
    if (!realNextParents) {
      realNextParents = parents
    }
    const currentNewParents = {
      modelName,
      id: entityId,
      skipSubmit: entityComponentName === ENTITY_COMPONENT_VIEW,
    }
    const newNextParents = realNextParents.concat(currentNewParents)
    return {
      parents: realNextParents,
      nextParents: newNextParents,
      prevForm,
    }
  }
  const memoizedGetEntityManagerContext = memoizeOne(getEntityManagerContext)

  class EntityComponentWrapper extends PureComponent {
    render() {
      const {
        className,
        dataCyName,
        entityId,
        parents,
        nextParents,
        prevForm,
        buttons,
      } = this.props
      const contextValue = memoizedGetEntityManagerContext(entityId, parents, prevForm, nextParents)
      return (
        <div {...{
          className,
          'data-cy': dataCyName,
        }} >
          <EntityManagerContext.Provider value={contextValue}>
            <EntityComponent {...this.props} />
          </EntityManagerContext.Provider>
          {entityComponentName === ENTITY_COMPONENT_INLINE_EDIT && buttons(this.props)}
        </div>
      )
    }
  }

  let ModalSaveButton
  if (entityComponentName === ENTITY_COMPONENT_EDIT || entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
    // TODO by @deylak may be refactor and split this in different files
    // eslint-disable-next-line react/no-multi-comp
    ModalSaveButton = class extends PureComponent {
      constructor(props) {
        super(props)

        this.state = {
          buttonLocked: false,
        }
      }

      render() {
        const {
          modelActions,
          modelValid,
          modelFormName,
          submitAction,
          deleteAction,
          cancelAction,
        } = this.props
        const saveButton = (
          <TButton {...{
            className: modalsStyle.button,
            label: entityComponentName === ENTITY_COMPONENT_EDIT ? 'Сохранить изменения' : 'Сохранить',
            disabled: !modelValid || this.state.buttonLocked,
            color: BUTTON_COLORS.blue,
            onClick: () => {
              this.setState({
                buttonLocked: true,
              })
              const returnButtonState = () => {
                this.setState({
                  buttonLocked: false,
                })
              }
              modelActions.submitEntityForm(modelFormName)
                .then(() => {
                  if (entityComponentName !== ENTITY_COMPONENT_INLINE_EDIT) {
                    returnButtonState()
                  }
                  submitAction()
                })
                .catch(() => {
                  if (entityComponentName !== ENTITY_COMPONENT_INLINE_EDIT) {
                    returnButtonState()
                  }
                })
            },
          }} />
        )

        if (entityComponentName === ENTITY_COMPONENT_EDIT) {
          return saveButton
        }
        return (
          <div className={modalsStyle.buttonsContainer}>
            {
              deleteAction &&
              <TIcon {...{
                type: ICONS_TYPES.trashBin,
                className: modalsStyle.deleteButton,
                onClick: deleteAction,
                size: 17,
              }} />
            }
            {saveButton}
            <TButton {...{
              className: modalsStyle.button,
              label: 'Отменить',
              color: BUTTON_COLORS.gray,
              onClick: cancelAction,
            }} />
          </div>
        )
      }
    }
  }

  const dataCyName = MODAL_NAME_FUNCS[entityComponentName](modelName)

  const stateToProps = (state, props) => {
    const currentEntities = applySelectors('entityModal')(state, entitiesToGet)
    const currentPropsEntities = getCurrentPropsEntities(currentEntities)
    let modelFormName
    let model
    let title
    let modelErrors
    let modelValid
    const currentChildFormRegexp = getChildFormRegexp({ parentModel: modelName, parentId: props.entityId })
    const childForms = forms.selectors.getForm(currentChildFormRegexp)(state)
    // Calc props for editing modal
    if (entityComponentName === ENTITY_COMPONENT_EDIT || entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
      title = props.title || `${props.isEditing ? 'Редактировать' : 'Создать'} "${currentModel.name}"`
      modelFormName = getEditFormName({
        modelName,
        id: props.entityId,
        parents: props.parents,
      })
      model = forms.selectors.getForm(modelFormName)(state)
      modelErrors = forms.selectors.getErrors(modelFormName)(state)
      modelValid = forms.selectors.getIsValid(modelFormName)(state)
    // Calc props for viewing modal
    } else if (entityComponentName === ENTITY_COMPONENT_VIEW) {
      model = currentEntities[modelName].getById(props.entityId)
      title = props.title || currentModel.name
    }

    const childEntitiesByModel =
      getChildEntitiesByModel(modelName, currentModel, currentEntities, props.entityId, { childForms, model })

    // Here we define modal size, that can be configured in business objects library
    let modalSize = MODAL_SIZES.small
    if (currentModel.modal) {
      modalSize = currentModel.modal.size || modalSize
    }
    if (entityComponentName === ENTITY_COMPONENT_VIEW && currentModel.viewModal) {
      modalSize = currentModel.viewModal.size || modalSize
    }
    if (entityComponentName === ENTITY_COMPONENT_EDIT && currentModel.editModal) {
      modalSize = currentModel.editModal.size || modalSize
    }

    return {
      ...props,
      title,
      size: modalSize,
      shouldCloseOnOverlayClick: entityComponentName === ENTITY_COMPONENT_VIEW,

      dataCyName,
      modelFormName,
      model,
      modelErrors,
      modelValid,

      ...childEntitiesByModel,
      ...currentPropsEntities,
      // We use state in mergeProps
      state,
    }
  }

  const dispatchToProps = (dispatch) => {
    return {
      modelApiActions: bindActionCreators(api.actions.entityManager[modelName], dispatch),
      dispatch,
    }
  }

  const mergeProps = (stateProps, dispatchProps) => {
    // Getting restify entities actions for current model id
    const entitiesActions = getEntitiesActions(
      modelName,
      entitiesToGet,
      stateProps.entityId,
      stateProps.parents,
      entityComponentName === ENTITY_COMPONENT_VIEW,
    )
    const currentEntitiesActions = getCurrentEntitiesActions(entitiesActions, dispatchProps.dispatch)

    // Delete action is needed only for existing entities
    let deleteAction
    if (stateProps.isEditing && !(currentModel.modal || {}).deleteActionDisabled) {
      deleteAction = () =>
        dispatchProps.dispatch(entitiesActions[modelName].deleteEntity(stateProps.model, stateProps.onDelete))
    }
    let editAction
    if (entityComponentName === ENTITY_COMPONENT_VIEW) {
      editAction = () => dispatchProps.dispatch(entitiesActions[modelName].editChildEntity(stateProps.model))
    }

    let unbindedFormActions
    let modelFormActions
    let cancelAction
    let submitEntityForm = () => () => Promise.resolve()
    // Calc form actions only for edit view
    if (entityComponentName === ENTITY_COMPONENT_EDIT || entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
      unbindedFormActions = forms.getFormActions(stateProps.modelFormName)
      modelFormActions = bindActionCreators(
        unbindedFormActions,
        dispatchProps.dispatch,
      )
      // Define cancel action only for editing modal, cause in view modal we just close it
      if (
        stateProps.isEditing && stateProps.model && !stateProps.model.id &&
        (stateProps.prevForm || stateProps.model.prevForm)
      ) {
        cancelAction = () => {
          dispatchProps.dispatch(unbindedFormActions.changeSomeFields(stateProps.model.prevForm || stateProps.prevForm))
        }
      } else {
        // TODO by @deylak here we should also delete all child forms
        cancelAction = () => dispatchProps.dispatch(unbindedFormActions.deleteForm())
      }
      // We have defined our submit function
      // We should delay it, if we have parent entity, that should be created before child to use it's id
      const parentsExist = stateProps.parents && stateProps.parents.length
      let lastParent = {}
      if (parentsExist) {
        lastParent = stateProps.parents[stateProps.parents.length - 1]
      }
      if (parentsExist && !lastParent.skipSubmit) {
        submitEntityForm = () => (dispatch) => {
          // This field is used to define, if this form should be rendered in parent
          dispatch(unbindedFormActions.changeField('isSubmitted', true))
          return Promise.resolve()
        }
      } else {
        // Get submit chain for this form, so we can create nested objects
        const chainSubmitAction = getEntityFormSubmit(
          modelName,
          unbindedFormActions,
          stateProps.entityId,
          stateProps.isEditing,
          stateProps.state,
          false,
          stateProps.onSuccess,
        )
        // If parent should not be submitted, we can just link and submit child
        if (parentsExist && lastParent.skipSubmit) {
          submitEntityForm = () => (dispatch) => {
            dispatch(linkChildWithParent(
              modelName,
              lastParent.modelName,
              lastParent.id,
              unbindedFormActions,
              stateProps.model,
            ))
            dispatch(chainSubmitAction(stateProps.modelFormName))
            return Promise.resolve()
          }
        } else {
          submitEntityForm = chainSubmitAction
        }
      }
    }

    const finalProps = {
      ...stateProps,
      // Do not pass state, so we don't rerender every time
      state: undefined,
      ...dispatchProps,
      ...currentEntitiesActions,
      modelFormActions,
      deleteAction,
      editAction,
      cancelAction,
      modelActions: bindActionCreators({
        ...currentModel.actions,
        submitEntityForm,
      }, dispatchProps.dispatch),
    }

    if (entityComponentName === ENTITY_COMPONENT_EDIT || entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
      return {
        ...finalProps,
        buttons: modalProps => React.createElement(ModalSaveButton, {
          ...finalProps,
          ...modalProps,
        }),
      }
    }

    return finalProps
  }

  if (entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
    return connect(
      stateToProps,
      dispatchToProps,
      mergeProps,
    )(EntityComponentWrapper)
  }

  return registerModal(
    dataCyName,
    stateToProps,
    dispatchToProps,
    mergeProps,
  )(EntityComponentWrapper)
}

export const getEditEntityModal = getEntityEditComponent(ENTITY_COMPONENT_EDIT)
export const getViewEntityModal = getEntityEditComponent(ENTITY_COMPONENT_VIEW)
export const getInlineEntityEditComponent = getEntityEditComponent(ENTITY_COMPONENT_INLINE_EDIT)
