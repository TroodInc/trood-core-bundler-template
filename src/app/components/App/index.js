import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import debounce from 'lodash/debounce'

import style from './index.css'

import modals from '$trood/modals'
import auth, { AuthManagerContext, LOGIN_PAGE_URL, RECOVERY_PAGE_URL } from '$trood/auth'

import { ruleChecker } from '$trood/helpers/abac'
import { snakeToCamel } from '$trood/helpers/namingNotation'

import { PageManagerContext } from '$trood/pageManager'

import LoadingIndicator from '$trood/components/LoadingIndicator'

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

import {
  menuRenderers,
  memoizedGetAllPaths,
  memoizedGetPageManagerContext,
  memoizedGetRenderers,
} from './helpers'

import { getWindowMediaFlags } from '../../selectors'
import { AppContext } from '../../constants'


class App extends Component {
  static propTypes = {
    permissions: PropTypes.object,
  }

  static defaultProps = {
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

    this.state = {
      media: getWindowMediaFlags(),
    }

    this.onResize = debounce(this.onResize.bind(this), 300)
    this.restoreAuthData = this.restoreAuthData.bind(this)
    this.openLinkedModal = this.openLinkedModal.bind(this)
  }

  componentDidMount() {
    this.restoreAuthData(true)
    this.openLinkedModal()
    window.addEventListener('resize', this.onResize)
  }

  componentDidUpdate(prevProps) {
    this.restoreAuthData()
    if (prevProps.location.query.modal !== this.props.location.query.modal) {
      this.openLinkedModal()
    }
  }

  onResize() {
    this.setState({ media: getWindowMediaFlags() })
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

  restoreAuthData(force) {
    const {
      isLoading,
      isAuthenticated,
      isHasAuthData,
      authActions,
    } = this.props
    if (!isLoading && isAuthenticated && (!isHasAuthData || force)) {
      authActions.restoreAuthData()
    }
  }

  render() {
    const {
      isAuthenticated,
      activeAccount,
      permissions,

      authData = {},
      authActions = {},

      match,
      getProfile,

      layoutProps,
      history,
    } = this.props

    const authProfile = getProfile()
    if (authProfile.$loading) {
      return <LoadingIndicator className={style.loading} />
    }

    const renderers = memoizedGetRenderers(activeAccount, { media: this.state.media }, permissions)
    const registeredRoutesPaths = memoizedGetAllPaths(renderers)
    const pageManagerContextValue = memoizedGetPageManagerContext(registeredRoutesPaths)

    const checkRule = ({
      domain = 'custodian',
      resource,
      action,
      obj,
      ctx,
    }) => ruleChecker({
      rules: permissions,
      domain,
      resource: snakeToCamel(resource),
      action,
      values: {
        sbj: activeAccount,
        obj,
        ctx: {
          data: ctx,
        },
      },
    })

    const checkCustodianGetRule = (props) => checkRule({ ...props, action: 'dataGet' })

    const checkCustodianCreateRule = (props) => checkRule({ ...props, action: 'dataPost' })

    const checkCustodianUpdateRule = (props) => checkRule({ ...props, action: 'dataPatch' })

    const checkCustodianDeleteRule = (props) => checkRule({ ...props, action: 'dataDelete' })

    return (
      <AppContext.Provider value={ this.state }>
        <AuthManagerContext.Provider value={{
          ...authData,
          getProfile,
          checkRule,
          checkCustodianGetRule,
          checkCustodianCreateRule,
          checkCustodianUpdateRule,
          checkCustodianDeleteRule,
        }}>
          <PageManagerContext.Provider value={pageManagerContextValue}>
            <MailServiceContext.Provider value={this.mailServiceContext}>
              <EntityManagerContext.Provider>
                <div className={style.root}>
                  {React.createElement(modals.container)}
                  {
                    !isAuthenticated &&
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
                  {
                    isAuthenticated &&
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
                        layoutProps,
                        history,
                      })}
                    </React.Fragment>
                  }
                </div>
              </EntityManagerContext.Provider>
            </MailServiceContext.Provider>
          </PageManagerContext.Provider>
        </AuthManagerContext.Provider>
      </AppContext.Provider>
    )
  }
}

export default App
