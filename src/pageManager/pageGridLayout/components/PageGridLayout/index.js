import React from 'react'
import memoizeOne from 'memoize-one'

import style from './index.css'
import basePageLayout from '$trood/styles/basePageLayout.css'

import componentsManifest from '$trood/componentLibraries/manifest'

import {
  GRID_COLUMNS,
  DEFAULT_SPAN,
  GRID_COMPONENT_TYPE,
  GRID_MARGIN,
  TROOD_PAGE_PADDING,
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

import ErrorBoundary from '$trood/components/ErrorBoundary'


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

const PageGridLayout = (props) => {
  const {
    history,
    page: {
      components = [],
      pages,
      url,
      columns,
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

  const basePageTitleArgs = props.basePageTitleArgs || getBasePageTitleArgs(props.page, entityPageModelName)
  if (entityPageModelName && !modelId) return null
  let prevColumn = 0
  const currentGridColumns = columns || GRID_COLUMNS
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
                menuRenderers: getPagesHeaderRenderers([], entityPageModelName),
                basePath,
                authActions,
                ...layoutProps,
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
        if (comp.type === GRID_COMPONENT_TYPE) {
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
          const CurrentComponent = componentsManifest.components[comp.type]
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

          const currentComponentProps = Object.keys(comp.models || {}).reduce((memo, key) => {
            const currentEditorActionsName = getModelEditorActionsName(key)
            const currentApiActionsName = getModelApiActionsName(key)
            const currentActionsName = getModelActionsName(key)
            const currentComponentsName = getModelComponentsName(key)
            const currentConstantsName = getModelConstantsName(key)
            const currentEntitiesName = getModelEntitiesName(key)
            const currentChildEntitiesName = getChildEntityName(key)
            return {
              ...memo,
              [key]: other[key],
              [currentEditorActionsName]: other[currentEditorActionsName],
              [currentActionsName]: other[currentActionsName],
              [currentComponentsName]: other[currentComponentsName],
              [currentConstantsName]: other[currentConstantsName],
              [currentEntitiesName]: other[currentEntitiesName],
              [currentApiActionsName]: other[currentApiActionsName],
              [currentChildEntitiesName]: other[currentChildEntitiesName],
            }
          }, {
            history,
            model: other.model,
            form: other[getFormPropName(comp.type)],
            formActions: other[getFormActionsName(comp.type)],
            modalsActions: other.modalsActions,
            pageParams: other.match.params,
            PageChildContainer: other.PageChildContainer,
            ...componentServices,
          })

          compToRender = (
            <CurrentComponent {...{
              ...comp.props,
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
          marginTop = GRID_MARGIN
          marginRight = GRID_MARGIN
          if (comp.withMarginBottom) {
            marginBottom = GRID_MARGIN
          }
          if (currentColumnIndex === 0 && isFirstColumn) {
            marginLeft = TROOD_PAGE_PADDING
          }
          if (prevColumn === 0 && isLastColumn) {
            marginRight = TROOD_PAGE_PADDING
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
                  menuRenderers: getPagesHeaderRenderers(pages, entityPageModelName),
                  basePath,
                  authActions,
                  ...layoutProps,
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
}

export default PageGridLayout
