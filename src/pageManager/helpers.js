import { matchPath } from 'react-router-dom'
import objectHash from 'object-hash'
import lodashGet from 'lodash/get'

import { getNestedObjectField } from '$trood/helpers/nestedObjects'
import { snakeToCamel } from '$trood/helpers/namingNotation'

import { getPageLayoutProps } from './pageLayouts'

import urlSchema, { getBaseUrl } from './urlSchema'


const getPageGlobalId = (id, baseId) => snakeToCamel(`${baseId ? `${baseId}_` : ''}${id}_page`)


export const getPagesHeaderRenderers = (pages, entityPageModelName) => {
  return pages.reduce((memo, page) => {
    const pageConfig = getPageLayoutProps(page, entityPageModelName)
    return {
      ...memo,
      [pageConfig.id]: pageConfig.headerRenderer,
    }
  }, {})
}

// We should memoize all pages containers, so we don't create new react components every rerender
const memoizeRenderers = {}

const pageViewAction = 'view'
const any = '*'
const allowedRules = [
  'allow',
  any,
]

const checkRule = (value = {}, rule) => {
  if (typeof rule === 'string') return rule === any || rule === value || rule === value.id
  if (Array.isArray(rule.in)) return rule.in.some(item => item === any || item === value || item === value.id)
  return false
}

const getIsAllowPage = (pageId, permission) => {
  const pageRules = (permission.rules || {})[pageId]
  if (!pageRules) return true
  return (pageRules[pageViewAction] || [])
    .some(viewRule => {
      if (!allowedRules.includes(viewRule.result)) return false
      // TODO take rule priority
      return Object.keys(viewRule.rule).every(key => checkRule(lodashGet(permission, key), viewRule.rule[key]))
    })
}

// Here we calculate all redux containers for registered in system config pages
export const getPagesRouteShemaRenderers = (
  pages,
  {
    nestLevel = 0,
    extraPages = {},
    entityPageModelName,
    entityPageModelIdSelector,
    parentPath = '/',
  } = {},
  permission,
) => {
  const hash = objectHash({
    pages: pages.map(p => p.title),
    entityPageModelName,
    parentPath,
    sbj: (permission || {}).sbj,
  })
  if (memoizeRenderers[hash]) return memoizeRenderers[hash]

  const getSubpages = (subpages, baseId, pageEntityName) => {
    if (!subpages || !subpages.length) return undefined
    const filtredSubpages = subpages.filter(subPage => {
      const pageProps = getPageLayoutProps(subPage, pageEntityName)
      const pageId = pageProps.id
      const pageGlobalId = getPageGlobalId(pageId, baseId)
      return !permission || getIsAllowPage(pageGlobalId, permission)
    })
    return filtredSubpages.length ? filtredSubpages : undefined
  }

  const reducePagesFunc = (
    getPageConfig = () => {},
    getPageEntityName = () => '',
    isExtra,
  ) =>
    (memo, curr) => {
      const pageConfig = getPageConfig(curr)
      const pageEntityName = getPageEntityName(curr)
      const pageProps = getPageLayoutProps(pageConfig, pageEntityName)
      const realPageConfig = pageProps.pageConfig
      const {
        modelIdSelector,
        id: pageId,
      } = pageProps
      const pageGlobalId = getPageGlobalId(pageId)
      if (permission && !getIsAllowPage(pageGlobalId, permission)) return memo
      return {
        ...memo,
        [pageId]: {
          isExtra,
          component: pageProps.container,
          props: {
            page: {
              ...realPageConfig,
              // TODO by @deylak We need to refactor logic here, so we can natively support page props inheritance
              // And we don't need to pass all the top props to children directly
              // I hope, this change will make the code a lot simplier and functional
              pages: getSubpages(realPageConfig.pages, pageId, pageEntityName),
            },
            entityPageModelName: pageProps.modelType || pageEntityName,
            entityPageModelIdSelector: entityPageModelIdSelector || modelIdSelector,
            nestLevel,
            parentPath,
          },
        },
      }
    }

  const result = pages.reduce(
    reducePagesFunc(
      v => v,
      () => entityPageModelName,
    ),
    Object.keys(extraPages).reduce(
      reducePagesFunc(
        key => extraPages[key],
        v => v,
        true,
      ),
      {},
    ),
  )
  memoizeRenderers[hash] = result
  return result
}

export const getAllPaths = (pagesRouteSchema, parentPath, basePath = [], nestLevel = 0) => {
  const currentBaseUrl = getNestedObjectField(urlSchema, basePath)
  const paths = []
  Object.keys(pagesRouteSchema).forEach(key => {
    let currentPath = `/${getBaseUrl(getNestedObjectField(currentBaseUrl, key))}`
    if (parentPath) {
      currentPath = (parentPath === '/' ? '' : parentPath) + currentPath
    }
    paths.push(currentPath)
    const currentPageProps = pagesRouteSchema[key].props
    const { pages = [] } = currentPageProps.page
    if (pages.length) {
      const subPages = getPagesRouteShemaRenderers(pages, {
        nestLevel: nestLevel + 1,
        parentPath: currentPath,
        entityPageModelName: currentPageProps.entityPageModelName,
        entityPageModelIdSelector: currentPageProps.entityPageModelIdSelector,
      })
      const subPaths = getAllPaths(subPages, currentPath, basePath.concat(key), nestLevel + 1)
      paths.push(...subPaths)
    }
  })
  return paths
}

export const getIsAllowPath = (path, registeredRoutesPaths = []) => {
  return registeredRoutesPaths.some(routesPath => matchPath(path, {
    path: routesPath,
    exact: true,
  }))
}
