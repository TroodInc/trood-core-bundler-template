import React from 'react'
import memoizeOne from 'memoize-one'

import { AppContext } from '$trood/app/constants'

import style from './index.css'
import basePageLayout from '$trood/styles/basePageLayout.css'

import componentsManifest from '$trood/componentLibraries/manifest'

import {
  GRID_COLUMNS,
  DEFAULT_SPAN,
  GRID_MARGIN,
  TROOD_PAGE_PADDING,
  getMobileMargin,
} from '../../constants'

import {
  PageManagerContext,
} from '../../../constants'

import {
  RouteSchema,
} from '../../../components'

import {
  getPagesHeaderRenderers,
  getPagesRouteShemaRenderers,
  getBasePageTitleArgs,
} from '../../../helpers'

import {
  getModelEditorActionsName,
  getFormActionsName,
  getFormPropName,
  getModelComponentsName,
  getModelActionsName,
  getModelConstantsName,
  getModelEntitiesName,
  getModelApiActionsName,
  getChildEntityName,
  EntityManagerContext,
} from '$trood/entityManager'

import {
  SERVICES_PROPS_NAMES,
} from '$trood/serviceManager'

import { currentLayout } from '$trood/layoutsManager'
import localeService, { intlObject } from '$trood/localeService'

import ErrorBoundary from '$trood/components/ErrorBoundary'
import LoadingBlockContainer from '$trood/components/LoadingBlockContainer'


const getEntityManagerContext = (modelName, entityId) => {
  const parents = [{
    modelName,
    id: entityId,
    skipSubmit: true,
  }]
  return {
    parents,
    nextParents: parents,
    prevForm: undefined,
  }
}
const memoizedGetEntityManagerContext = memoizeOne(getEntityManagerContext)

const compPropsNameFunctions = [
  getModelEditorActionsName,
  getModelApiActionsName,
  getModelActionsName,
  getModelComponentsName,
  getModelConstantsName,
  getModelEntitiesName,
  getChildEntityName,
]

const PageGridLayout = (props) => {
  const {
    history,
    page: {
      id: pageId,
      components = [],
      pages,
      url,
      columns = GRID_COLUMNS,
    },
    parentPath,
    nestLevel = 0,
    isFirstColumn = true,
    isLastColumn = true,
    modelId,
    entityPageModelName,
    entityPageModelIdSelector,
    authActions,
    layoutProps,
    ...other
  } = props

  if (other.modelIsLoading) {
    return <LoadingBlockContainer isBlocked={other.modelIsLoading} />
  }

  return (
    <AppContext.Consumer>
      {({ media = {} }) => {
        const basePageTitleArgs = props.basePageTitleArgs || getBasePageTitleArgs(props.page, entityPageModelName)
        if (entityPageModelName && !modelId) return null
        let prevColumn = 0
        const currentGridColumns = media.portable ? 1 : columns
        const pageComponent = (
          <div {...{
            className: nestLevel > 0 ? style.nestedRoot : style.root,
            style: {
              grid: `auto-flow auto / repeat(${currentGridColumns}, 1fr)`,
            },
          }}>
            {
              !nestLevel && (!pages || !pages.length) &&
              <PageManagerContext.Consumer>
                {({ basePath }) => (
                  <div {...{
                    style: {
                      gridColumn: `1 / span ${currentGridColumns}`,
                    },
                    className: style.secondaryMenu,
                  }}>
                    {React.createElement(currentLayout.nestedPageMenuComponent, {
                      basePageTitleArgs,
                      menuRenderers: getPagesHeaderRenderers([], entityPageModelName, pageId),
                      basePath,
                      authActions,
                      layoutProps,
                      history,
                    })}
                  </div>
                )}
              </PageManagerContext.Consumer>
            }
            {components.map((comp, index) => {
              const currentSpan = comp.span || DEFAULT_SPAN
              const currentId = comp.id || index

              const currentColumnIndex = prevColumn
              prevColumn = (prevColumn + currentSpan) % currentGridColumns

              let compToRender
              const CurrentComponent = componentsManifest.components[comp.type]
              if (!CurrentComponent) {
                compToRender = (
                  <PageGridLayout {...{
                    basePageTitleArgs,
                    history,
                    page: {
                      components: comp.components,
                      url,
                      columns: comp.columns,
                    },
                    modelId,
                    parentPath,
                    nestLevel: nestLevel + 1,
                    isFirstColumn: currentColumnIndex === 0,
                    isLastColumn: prevColumn === 0,
                    entityPageModelName,
                    ...other,
                  }} />
                )
              } else {
                let componentServices = {}
                if (componentsManifest.services[comp.type]) {
                  // Here we get all services injected props for the component
                  // Iterate by component services and get general props object
                  componentServices = componentsManifest.services[comp.type].reduce((memo, serviceName) => ({
                    ...memo,
                    // Iterate by service prop names and get service props object
                    ...SERVICES_PROPS_NAMES[serviceName].reduce((propsMemo, propName) => ({
                      ...propsMemo,
                      [propName]: other[propName],
                    }), {}),
                  }), {})
                }

                const currentComponentProps = Object.keys(comp.models || {}).reduce((memo, modelAlias) => {
                  const modelName = (comp.models || {})[modelAlias]

                  return {
                    ...memo,
                    ...compPropsNameFunctions.reduce((memoProps, nameFunc) => ({
                      ...memoProps,
                      [nameFunc(modelAlias)]: other[nameFunc(modelName)],
                    }), {}),
                  }
                }, {
                  history,
                  model: other.model,
                  modelIsLoading: other.modelIsLoading,
                  form: other[getFormPropName(comp.id)],
                  formActions: other[getFormActionsName(comp.id)],
                  modalsActions: other.modalsActions,
                  pageParams: other.match.params,
                  PageChildContainer: other.PageChildContainer,
                  ...componentServices,
                })

                let title = localeService.localeMessages[comp.id]
                if (title) {
                  title = intlObject.intl.formatMessage(title)
                } else {
                  title = comp.title || (comp.props || {}).title
                }
                compToRender = (
                  <CurrentComponent {...{
                    ...(comp.props || {}),
                    title,
                    ...currentComponentProps,
                  }} />
                )
              }

              // Define margings for current grid unit
              // We can have page edges(extra padding) or components without marging
              let marginLeft
              let marginRight
              let marginTop
              let marginBottom
              if (comp.withMargin && !comp.components) {
                marginTop = media.portable ? getMobileMargin(GRID_MARGIN) : GRID_MARGIN
                marginRight = media.portable ? getMobileMargin(GRID_MARGIN) : GRID_MARGIN
                if (comp.withMarginBottom) {
                  marginBottom = media.portable ? getMobileMargin(GRID_MARGIN) : GRID_MARGIN
                }
                if (currentColumnIndex === 0 && isFirstColumn) {
                  marginLeft = media.portable ? getMobileMargin(TROOD_PAGE_PADDING) : TROOD_PAGE_PADDING
                }
                if (prevColumn === 0 && isLastColumn) {
                  marginRight = media.portable ? getMobileMargin(TROOD_PAGE_PADDING) : TROOD_PAGE_PADDING
                }
              }

              return (
                <div {...{
                  'data-cy': comp.type,
                  key: currentId,
                  className: style.gridCell,
                  style: {
                    // We add 1, because css grid columns starts from 1
                    gridColumn: `${currentColumnIndex + 1} / span ${currentSpan}`,
                    marginLeft,
                    marginRight,
                    marginTop,
                    marginBottom,
                  },
                }}>
                  <ErrorBoundary errorClassName={basePageLayout.block}>
                    {compToRender}
                  </ErrorBoundary>
                </div>
              )
            })}
            {
              pages && !!pages.length &&
              <PageManagerContext.Consumer>
                {({ match, basePath, registeredRoutesPaths }) => (
                  <React.Fragment>
                    <div {...{
                      style: {
                        gridColumn: `1 / span ${currentGridColumns}`,
                      },
                      className: style.secondaryMenu,
                    }}>
                      {React.createElement(currentLayout.nestedPageMenuComponent, {
                        basePageTitleArgs,
                        menuRenderers: getPagesHeaderRenderers(pages, entityPageModelName, pageId),
                        basePath,
                        authActions,
                        layoutProps,
                        history,
                      })}
                    </div>

                    <div style={{
                      gridColumn: `1 / span ${currentGridColumns}`,
                    }}>
                      <RouteSchema {...{
                        basePath,
                        prevMatch: match,
                        registeredRoutesPaths,
                        renderers: getPagesRouteShemaRenderers(pages, {
                          nestLevel: nestLevel + 1,
                          entityPageModelName,
                          parentPageId: pageId,
                          parentPath: parentPath.concat(url),
                          entityPageModelIdSelector: other.entityPageModelIdSelector,
                        }),
                      }} />
                    </div>
                  </React.Fragment>
                )}
              </PageManagerContext.Consumer>
            }
          </div>
        )

        if (nestLevel === 0 && entityPageModelName) {
          const contextValue = memoizedGetEntityManagerContext(entityPageModelName, modelId)
          return (
            <EntityManagerContext.Provider value={contextValue}>
              {pageComponent}
            </EntityManagerContext.Provider>
          )
        }

        return pageComponent
      }}
    </AppContext.Consumer>
  )
}

export default PageGridLayout
