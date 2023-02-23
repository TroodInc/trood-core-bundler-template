import { matchPath } from 'react-router-dom'
import objectHash from 'object-hash'

import { getNestedObjectField } from '$trood/helpers/nestedObjects'
import { ruleChecker } from '$trood/helpers/abac'

import { getPageLayoutProps } from './pageLayouts'

import urlSchema, { getBaseUrl } from './urlSchema'

import { ABAC_FRONTEND_DOMAIN } from '$trood/mainConstants'


const getAbacPageId = id => `${id}Page`

export const getPagesHeaderRenderers = (pages, entityPageModelName, prevPageId) => {
  return pages.reduce((memo, page) => {
    const pageConfig = getPageLayoutProps(page, entityPageModelName, prevPageId)
    if (pageConfig.pageConfig.hideMenu) return memo
    return {
      ...memo,
      [pageConfig.id]: pageConfig.headerRenderer,
    }
  }, {})
}

// We should memoize all pages containers, so we don't create new react components every rerender
const memoizeRenderers = {}

const pageViewAction = 'view'

const getIsAllowPage = (
  pageId,
  {
    rules = {},
    data: {
      obj = {},
      sbj = {},
      ctx,
    } = {},
  } = {},
) => {
  const { access } = ruleChecker({
    rules,
    domain: ABAC_FRONTEND_DOMAIN,
    resource: pageId,
    action: pageViewAction,
    values: { obj, sbj, ctx },
  })
  return access
}

// Here we calculate all redux containers for registered in system config pages
export const getPagesRouteShemaRenderers = (
  pages,
  {
    nestLevel = 0,
    extraPages = {},
    entityPageModelName,
    entityPageModelIdSelector,
    parentPageId,
    parentPath = '/',
  } = {},
  permission,
) => {
  const hash = objectHash({
    pages: pages.map(p => p.title),
    entityPageModelName,
    parentPath,
    data: (permission || {}).data,
  })
  if (memoizeRenderers[hash]) return memoizeRenderers[hash]

  const getSubpages = (subpages, baseId, pageEntityName) => {
    if (!subpages || !subpages.length) return undefined
    const filtredSubpages = subpages.filter(subPage => {
      const pageProps = getPageLayoutProps(subPage, pageEntityName, baseId)
      const abacPageId = getAbacPageId(pageProps.id)
      return !permission || getIsAllowPage(abacPageId, permission)
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
      const pageProps = getPageLayoutProps(pageConfig, pageEntityName, parentPageId)
      const realPageConfig = pageProps.pageConfig
      const {
        modelIdSelector,
        id: pageId,
      } = pageProps
      const abacPageId = getAbacPageId(pageId)
      if (permission && !getIsAllowPage(abacPageId, permission)) return memo
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
    const { id: pageId, pages = [] } = currentPageProps.page
    if (pages.length) {
      const subPages = getPagesRouteShemaRenderers(pages, {
        nestLevel: nestLevel + 1,
        parentPageId: pageId,
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

export { getBasePageTitleArgs } from './pageLayouts'
