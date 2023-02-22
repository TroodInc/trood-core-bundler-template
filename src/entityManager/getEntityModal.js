import React, { PureComponent } from 'react'
import { bindActionCreators } from 'redux'
import memoizeOne from 'memoize-one'

import {
  api,
  forms,
  RESTIFY_CONFIG,
  RestifyForeignKeysArray,
  RestifyForeignKey,
  RestifyGenericForeignKey,
} from 'redux-restify'

import { getPageChildContainer } from '$trood/pageManager'

import { withService } from '$trood/serviceManager'

import modalsStyle from '$trood/styles/modals.css'

import modals, { registerModal, MODAL_SIZES } from '$trood/modals'
import auth from '$trood/auth'

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
  messages,
} from './constants'

import {
  getEntitiesToGet,
  getChildEntitiesByModel,
  getCurrentPropsEntities,
  getEntitiesActions,
  getCurrentEntitiesActions,
} from './selectors'

import localeService, { intlObject } from '$trood/localeService'

import { applySelectors } from '$trood/helpers/selectors'
import { ruleChecker } from '$trood/helpers/abac'
import { getRecursiveObjectReplacement } from '$trood/helpers/nestedObjects'
import { snakeToCamel } from '$trood/helpers/namingNotation'

import { ModalComponents, ModalContext } from './components/ModalComponents'
import { AuthManagerContext } from '$trood/auth'

const formatMessage = msg => {
  if (!msg || !msg.defaultMessage || !intlObject.intl) return msg
  return intlObject.intl.formatMessage(msg)
}

export const linkChildWithParent = (modelName, parentName, parentId, formActions, form) => (dispatch) => {
  const currentParentModel = RESTIFY_CONFIG.registeredModels[parentName]
  const currentModel = RESTIFY_CONFIG.registeredModels[modelName]

  const currentLinkValues = Object.keys(currentModel.defaults).reduce((memo, key) => {
    const currentDefault = currentModel.defaults[key]
    if (!form[key]) {
      if (currentDefault instanceof RestifyForeignKey
        && currentDefault.modelType === parentName) {
        return {
          ...memo,
          [key]: parentId,
        }
      } else if (currentDefault instanceof RestifyGenericForeignKey
        && currentDefault.modelType.includes(parentName)) {
        return {
          ...memo,
          [key]: {
            _object: currentParentModel.endpoint,
            [currentParentModel.idField]: parentId,
          },
        }
      }
    }
    return memo
  }, {})

  if (Object.keys(currentLinkValues).length) {
    dispatch(formActions.changeSomeFields(currentLinkValues))
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
      const currentIsSubmitted = childForms[formName].isSubmitted
      if (!currentIsSubmitted) return memo
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
      dispatch(formActions.changeSomeFields(parentForm, false, false, true))
      const { data: model, status } = await dispatch(submitEntityForm(formName))
      if (onSuccess) {
        dispatch(onSuccess({ data: model, status }))
      }
    }

    return parentForm
  }
  return result
}

const getCheckAccess = (modelName, isEditing, sbj, obj, rules) => (ctx) => {
  return ruleChecker({
    rules,
    domain: 'custodian',
    resource: modelName,
    action: isEditing ? 'dataPatch' : 'dataPost',
    values: {
      obj,
      sbj,
      ctx,
    },
  })
}
const memoizedGetCheckAccess = memoizeOne(getCheckAccess)

const getFormActions = (modelFormName, checkAccess, dispatch, getState) => {
  const formActions = forms.getFormActions(modelFormName)

  const unbindedFormActions = {
    ...formActions,
    changeField: (name, value, transformUndefinedToNull = true, skipAbacCheck = false) => {
      const val = transformUndefinedToNull && value === undefined ? null : value
      if (skipAbacCheck) return formActions.changeField(name, val)
      const model = forms.selectors.getForm(modelFormName)(getState())
      const ctx = {
        data: getRecursiveObjectReplacement(model, name, val),
      }
      const { access, mask } = checkAccess(ctx)
      if (!access || mask.some(m => snakeToCamel(m) === name)) {
        return modals.actions.showErrorPopup(intlObject.intl.formatMessage(localeService.generalMessages.accessDenied))
      }
      return formActions.changeField(name, val)
    },
    changeSomeFields: (values, forceUndefines, transformUndefinedToNull = true, skipAbacCheck = false) => {
      const valuesKeys = Object.keys(values)
      const vals = valuesKeys.reduce((memo, key) => ({
        ...memo,
        [key]: transformUndefinedToNull && values[key] === undefined ? null : values[key],
      }), {})
      if (skipAbacCheck) return formActions.changeSomeFields(vals, forceUndefines)
      const model = forms.selectors.getForm(modelFormName)(getState())
      const ctx = {
        data: {
          ...model,
          ...vals,
        },
      }
      const { access, mask } = checkAccess(ctx)
      if (!access || mask.some(m => valuesKeys.includes(snakeToCamel(m)))) {
        return modals.actions.showErrorPopup(intlObject.intl.formatMessage(localeService.generalMessages.accessDenied))
      }
      return formActions.changeSomeFields(vals, forceUndefines)
    },
    resetField: (name, skipAbacCheck = false) => {
      if (skipAbacCheck) return formActions.resetField(name)
      const model = forms.selectors.getForm(modelFormName)(getState())
      const ctx = {
        data: getRecursiveObjectReplacement(model, name, undefined),
      }
      const { access, mask } = checkAccess(ctx)
      if (!access || mask.some(m => snakeToCamel(m) === name)) {
        return modals.actions.showErrorPopup(intlObject.intl.formatMessage(localeService.generalMessages.accessDenied))
      }
      return formActions.resetField(name)
    },
  }

  return {
    unbindedFormActions,
    modelFormActions: bindActionCreators(unbindedFormActions, dispatch),
  }
}
const memoizedGetFormActions = memoizeOne(getFormActions)

const getEntityEditComponent = (entityComponentName) => (modelName, modelConfig) => {
  const currentModel = modelConfig || RESTIFY_CONFIG.registeredModels[modelName]
  let EntityComponent = currentModel[entityComponentName]
  if (!EntityComponent && entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
    EntityComponent = currentModel[ENTITY_COMPONENT_EDIT]
  }

  const entitiesToGet = getEntitiesToGet(modelName, currentModel)
  const servicesToGet = currentModel.services || []

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
        model,
        modelFormActions,
        modelErrors,
      } = this.props
      const contextValue = memoizedGetEntityManagerContext(entityId, parents, prevForm, nextParents)
      return (
        <div {...{
          className,
          'data-cy': dataCyName,
        }}>
          <EntityManagerContext.Provider value={contextValue}>
            <AuthManagerContext.Consumer>
              {({ checkCustodianCreateRule, checkCustodianUpdateRule, checkCustodianGetRule }) => {
                const editMaskChecker = model.id ? checkCustodianUpdateRule : checkCustodianCreateRule
                const entities = this.props[modelName + 'Entities']
                const objectToCheck = {
                  ...(model.id && { obj: entities.getById(model.id) }),
                  ctx: { data: model },
                  resource: entities.modelConfig.endpoint,
                }
                const editMask = editMaskChecker(objectToCheck).mask.map(item => snakeToCamel(item))
                const getMask = checkCustodianGetRule(objectToCheck).mask.map(item => snakeToCamel(item))
                return (
                  <ModalContext.Provider value={{ editMask, getMask, model, modelFormActions, modelErrors, modelName }}>
                    <EntityComponent {...{ ...this.props, editMask, getMask, ModalComponents }} />
                  </ModalContext.Provider>
                )
              }}
            </AuthManagerContext.Consumer>
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
          isEditing,
        } = this.props
        const saveButton = (
          <TButton {...{
            className: modalsStyle.button,
            label: intlObject.intl.formatMessage(isEditing ? messages.change : localeService.generalMessages.save),
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
              label: intlObject.intl.formatMessage(localeService.generalMessages.cancel),
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
    let serverModel
    let title
    let modelErrors
    let modelValid
    const currentChildFormRegexp = getChildFormRegexp({ parentModel: modelName, parentId: props.entityId })
    const childForms = forms.selectors.getForm(currentChildFormRegexp)(state)
    // Calc props for editing modal
    if (entityComponentName === ENTITY_COMPONENT_EDIT || entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
      title = formatMessage(props.title) || `${
        intlObject.intl.formatMessage(props.isEditing ? messages.edit : messages.create)
      } ${formatMessage(currentModel.name)}`
      modelFormName = getEditFormName({
        modelName,
        id: props.entityId,
        parents: props.parents,
      })
      model = forms.selectors.getForm(modelFormName)(state)
      modelErrors = forms.selectors.getErrors(modelFormName)(state)
      modelValid = forms.selectors.getIsValid(modelFormName)(state)
      if (props.isEditing) {
        serverModel = currentEntities[modelName].getById(props.entityId)
      }
      // Calc props for viewing modal
    } else if (entityComponentName === ENTITY_COMPONENT_VIEW) {
      model = currentEntities[modelName].getById(props.entityId)
      serverModel = model
      title = formatMessage(props.title) || formatMessage(currentModel.name)
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
      serverModel,
      modelErrors,
      modelValid,
      authData: auth.selectors.getAuthData(state),

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
      PageChildContainer: dispatch(getPageChildContainer),
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

    const rules = auth.selectors.getPermissions(stateProps.state)
    const sbj = auth.selectors.getActiveAccount(stateProps.state)

    // Delete action is needed only for existing entities
    let deleteAction
    if (stateProps.isEditing) {
      const { access } = ruleChecker({
        rules,
        domain: 'custodian',
        resource: modelName,
        action: 'dataDelete',
        values: {
          obj: stateProps.serverModel,
          sbj,
        },
      })
      if (!currentModel.notDelete && !(currentModel.modal || {}).deleteActionDisabled && access) {
        deleteAction = () =>
          dispatchProps.dispatch(entitiesActions[modelName].deleteEntity(stateProps.model, stateProps.onDelete))
      }
    }

    const checkAccess = memoizedGetCheckAccess(modelName, stateProps.isEditing, sbj, stateProps.serverModel, rules)

    const { access } = checkAccess()

    let editAction
    if (entityComponentName === ENTITY_COMPONENT_VIEW && !currentModel.notEdit && access) {
      editAction = () => dispatchProps.dispatch(entitiesActions[modelName].editChildEntity(stateProps.model))
    }

    let unbindedFormActions
    let modelFormActions
    let cancelAction
    let submitEntityForm = () => () => Promise.resolve()
    // Calc form actions only for edit view
    if (entityComponentName === ENTITY_COMPONENT_EDIT || entityComponentName === ENTITY_COMPONENT_INLINE_EDIT) {
      const formActions = dispatchProps.dispatch((dispatch, getState) =>
        memoizedGetFormActions(stateProps.modelFormName, checkAccess, dispatch, getState),
      )
      unbindedFormActions = formActions.unbindedFormActions
      modelFormActions = formActions.modelFormActions
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
            return dispatch(chainSubmitAction(stateProps.modelFormName))
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
    return withService(
      servicesToGet,
      stateToProps,
      dispatchToProps,
      mergeProps,
    )(EntityComponentWrapper)
  }

  return withService(
    servicesToGet,
    stateToProps,
    dispatchToProps,
    mergeProps,
    (...args) => registerModal(dataCyName, ...args),
  )(EntityComponentWrapper)
}

export const getEditEntityModal = getEntityEditComponent(ENTITY_COMPONENT_EDIT)
export const getViewEntityModal = getEntityEditComponent(ENTITY_COMPONENT_VIEW)
export const getInlineEntityEditComponent = getEntityEditComponent(ENTITY_COMPONENT_INLINE_EDIT)
