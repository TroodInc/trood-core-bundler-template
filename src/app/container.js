import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { api } from 'redux-restify'

import App from './components/App'

import auth from '$trood/auth'

import mailService from '$trood/mailService'

import entityManager, {
  getModelEditorActionsName,
  getModelEntitiesName,
  parseModalQuery,
} from '$trood/entityManager'

import modals from '$trood/modals'


const stateToProps = (state, props) => {
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
  const linkedModalsModelsEntities = linkedModalsModels.reduce((memo, modelName) => ({
    ...memo,
    [getModelEntitiesName(modelName)]: api.selectors.entityManager[modelName].getEntities(state),
  }), {})
  return {
    ...props,
    linkedModals,
    linkedModalsModels,
    ...linkedModalsModelsEntities,
    isHasAuthData: auth.selectors.getIsHasAuthData(state),
    authData: auth.selectors.getAuthData(state),
    permissions: auth.selectors.getPermissions(state),
    activeAccount: auth.selectors.getActiveAcoount(state),
    authLinkedObject: auth.selectors.getLinkedObject(state),
    authLinkedObjectIsLoading: auth.selectors.getLinkedObjectIsLoading(state),
    isAuthenticated: auth.selectors.getIsAuthenticated(state),
    isLoading: api.selectors.loadsManager.getIsLoading(state),
    getModalOpen: modalName => modals.selectors.getModalOpen(modalName)(state),
  }
}

const dispatchToProps = (dispatch) => ({
  dispatch,
  authActions: bindActionCreators(auth.actions, dispatch),
  mailServiceActions: bindActionCreators(mailService.actions, dispatch),
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
  return {
    ...stateProps,
    ...dispatchProps,
    ...linkedModalsModelsEditorActions,
  }
}

export default withRouter(connect(stateToProps, dispatchToProps, mergeProps)(App))
