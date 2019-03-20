import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import memoizeOne from 'memoize-one'
import objectGet from 'lodash/get'
import deepEqual from 'deep-equal'

import style from './index.css'

import modals from '$trood/modals'
import auth, { AuthManagerContext, LOGIN_PAGE_URL, RECOVERY_PAGE_URL } from '$trood/auth'


import systemConfig from '$trood/config'

import {
  RouteSchema,
  PageManagerContext,
  defaultPageManagerContext,
  getPagesRouteShemaRenderers,
  getPagesHeaderRenderers,
  getAllPaths,
} from '$trood/pageManager'

import LoadingIndicator from '$trood/components/LoadingIndicator'

import { DEFAULT_SCROLLING_CONTAINER_ID } from '$trood/mainConstants'

import { MailServiceContext } from '$trood/mailService'
import {
  EntityManagerContext,
  getModelEditorActionsName,
  getModelEntitiesName,
  getEditModalName,
  getViewModalName,
  parseModalQuery,
} from '$trood/entityManager'
import { currentLayout } from '$trood/layoutsManager'


const menuRenderers = getPagesHeaderRenderers(systemConfig.pages)

const getLinkedObjectNeededFields = (permissions = {}) => {
  let frontendPermissions = permissions.frontend || {}
  frontendPermissions = Object.values(frontendPermissions)
  frontendPermissions = frontendPermissions.reduce((memo, curr) => {
    return {
      ...memo,
      ...Object.values(curr).reduce((memo1, item) => {
        return {
          ...memo1,
          ...item.reduce((memo2, rule) => ({ ...memo2, ...rule.rule }), {}),
        }
      }, {}),
    }
  }, {})
  const fields = Object.keys(frontendPermissions)
  return fields.map(field => field.split('.').slice(1))
}

const getRenderers = (sbj, permissions = {}) => {
  return getPagesRouteShemaRenderers(
    systemConfig.pages,
    {
      extraPages: systemConfig.entityPages,
    },
    {
      sbj,
      rules: permissions.frontend,
    },
  )
}

const getPageManagerContext = registeredRoutesPaths => ({
  ...defaultPageManagerContext,
  registeredRoutesPaths,
})

const memoizedGetLinkedObjectNeededFields = memoizeOne(getLinkedObjectNeededFields)
const memoizedGetRenderers = memoizeOne(getRenderers, (a, b) => {
  if (a[1] !== b[1]) return false
  const neededField = memoizedGetLinkedObjectNeededFields(a[1])
  return neededField.reduce((memo, field) => {
    return memo && deepEqual(objectGet(a[0], field), objectGet(b[0], field))
  }, true)
})
const memoizedGetAllPaths = memoizeOne(getAllPaths)
const memoizedGetPageManagerContext = memoizeOne(getPageManagerContext)

class App extends Component {
  static propTypes = {
    authLinkedObject: PropTypes.object,
    permissions: PropTypes.object,
  }

  static defaultProps = {
    authLinkedObject: {},
    permissions: {},
  }

  constructor(props) {
    super(props)

    const {
      mailServiceActions,
    } = this.props

    this.mailServiceContext = {
      mailServiceActions,
    }

    this.restoreAuthData = this.restoreAuthData.bind(this)
    this.openLinkedModal = this.openLinkedModal.bind(this)
  }

  componentDidMount() {
    this.restoreAuthData()
    this.openLinkedModal()
  }

  componentDidUpdate(prevProps) {
    this.restoreAuthData()
    if (prevProps.location.query.modal !== this.props.location.query.modal) {
      this.openLinkedModal()
    }
  }

  openLinkedModal() {
    const {
      history,
      linkedModals,
      isAuthenticated,
      getModalOpen,
    } = this.props

    if (isAuthenticated) {
      const firstLinkedModal = linkedModals[0]
      if (firstLinkedModal) {
        const {
          modalType,
          modelName,
          modelId,
        } = parseModalQuery(firstLinkedModal)

        const getModalName = modalType !== 'view' ? getEditModalName : getViewModalName
        const modalName = getModalName(modelName)
        const modalOpen = getModalOpen(modalName)
        if (!modalOpen) {
          this.props[getModelEntitiesName(modelName)].asyncGetById(modelId)
            .then(model => {
              if (model && !model.$error) {
                this.props[getModelEditorActionsName(modelName)][`${modalType}Entity`](model, { history })
              }
            })
        }
      }
    }
  }

  restoreAuthData() {
    const {
      isLoading,
      isAuthenticated,
      isHasAuthData,
      authActions,
    } = this.props
    if (!isLoading && isAuthenticated && !isHasAuthData) {
      authActions.restoreAuthData()
    }
  }

  render() {
    const {
      isAuthenticated,
      authLinkedObject,
      activeAccount,
      authLinkedObjectIsLoading,
      permissions,

      authData = {},
      authActions = {},

      match,
    } = this.props

    /* TODO authLinkedObjectIsLoading always true
    if (authLinkedObjectIsLoading) {
      return <LoadingIndicator className={style.loading} />
    } */
    if (authLinkedObject.$loading) {
      return <LoadingIndicator className={style.loading} />
    }

    const renderers = memoizedGetRenderers(activeAccount, permissions)
    const registeredRoutesPaths = memoizedGetAllPaths(renderers)
    const pageManagerContextValue = memoizedGetPageManagerContext(registeredRoutesPaths)

    return (
      <AuthManagerContext.Provider value={authData}>
        <PageManagerContext.Provider value={pageManagerContextValue}>
          <MailServiceContext.Provider value={this.mailServiceContext}>
            <EntityManagerContext.Provider>
              <div className={style.root}>
                {React.createElement(modals.container)}
                {!isAuthenticated &&
                  <Switch>
                    <Route {...{
                      path: LOGIN_PAGE_URL,
                      component: auth.container,
                    }} />
                    <Route {...{
                      path: RECOVERY_PAGE_URL,
                      component: auth.container,
                    }} />
                    <Route {...{
                      render: ({ location }) => (
                        <Redirect {...{
                          to: {
                            pathname: LOGIN_PAGE_URL,
                            state: {
                              nextUrl: `${location.pathname}${location.search}`,
                            },
                          },
                        }} />
                      ),
                    }} />
                  </Switch>
                }
                {isAuthenticated &&
                  <React.Fragment>
                    <Route {...{
                      path: LOGIN_PAGE_URL,
                      render: () => <Redirect to="/" />,
                    }} />
                    <Route {...{
                      path: RECOVERY_PAGE_URL,
                      render: () => <Redirect to="/" />,
                    }} />
                    {React.createElement(currentLayout.basePageComponent, {
                      authActions,
                      renderers,
                      registeredRoutesPaths,
                      match,
                      menuRenderers,
                    })}
                  </React.Fragment>
                }
              </div>
            </EntityManagerContext.Provider>
          </MailServiceContext.Provider>
        </PageManagerContext.Provider>
      </AuthManagerContext.Provider>
    )
  }
}

export default App
