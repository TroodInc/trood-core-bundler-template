import uuidV4 from 'uuid/v4'

import systemConfig from '$trood/config'

import { getPageLayoutProps } from './pageLayouts'


export const HEADER_SHOW = 'show'
export const HEADER_HIDE = 'hide'

const reducePages = (modelType, prevPageId) => (memo, page) => {
  const currentPageProps = getPageLayoutProps(page, modelType, prevPageId)
  const realConfig = currentPageProps.pageConfig
  const pageModelType = currentPageProps.modelType
  return {
    ...memo,
    [currentPageProps.id]: {
      header: HEADER_SHOW,
      url: realConfig.url,
      pages: realConfig.pages && realConfig.pages.reduce(
        reducePages(pageModelType || modelType, currentPageProps.baseId),
        {},
      ),
    },
  }
}

const urlSchema = systemConfig.pages.reduce(reducePages(), {
  ...Object.keys(systemConfig.entityPages).reduce((memo, key) => {
    const currentConfig = systemConfig.entityPages[key]
    const currentPageProps = getPageLayoutProps(currentConfig, key)
    const realConfig = currentPageProps.pageConfig
    return {
      ...memo,
      [currentPageProps.id]: {
        modelType: key,
        header: HEADER_HIDE,
        url: `${realConfig.url || key}/:id(\\d+)`,
        pages: realConfig.pages && realConfig.pages.reduce(reducePages(key, currentPageProps.baseId), {}),
      },
    }
  }, {}),
})
const paramsRegex = /:\w+(?=\/|$)/g

// Different urls properties to find by uuid
const uniqueUrls = {}
const aliases = {}
const basePathsUrls = {}
const noParamsUrls = {}
const baseUrls = {}
const permissionsForUrl = {}
const redirectForUrl = {}
const rootLevel = {}

const createSchemaMapObject = (schema, baseUrl = '', basePath = []) => {
  return Object.keys(schema).reduce((memo, key) => {
    const currentSchema = schema[key]
    const currentUrl = `${baseUrl}${currentSchema.url && '/'}${currentSchema.url}`
    const newUuid = uuidV4()

    uniqueUrls[newUuid] = currentUrl
    noParamsUrls[newUuid] = currentUrl.replace(paramsRegex, '')
    basePathsUrls[newUuid] = basePath
    baseUrls[newUuid] = currentSchema.url
    aliases[newUuid] = currentSchema.alias || key
    permissionsForUrl[newUuid] = currentSchema.roles
    redirectForUrl[newUuid] = currentSchema.redirect
    rootLevel[newUuid] = basePath.length

    const newBasePath = basePath.concat(key)

    return {
      ...memo,
      [key]: {
        $uuid: newUuid,
        ...(currentSchema.pages ? createSchemaMapObject(currentSchema.pages, currentUrl, newBasePath) : {}),
      },
    }
  }, {})
}

const urlSchemaMap = createSchemaMapObject(urlSchema)
const getFromUrlsObject = (obj) => (urlMapObject, config = {}) => {
  let result = obj[urlMapObject.$uuid || urlMapObject]
  Object.keys(config).forEach(key => {
    result = result.replace(`:${key}(\\d+)`, config[key])
  })
  return result
}

const getAliasFromUrlsObject = (obj) => (urlMapObject) => obj[urlMapObject.$uuid || urlMapObject]

export const getUrl = getFromUrlsObject(uniqueUrls)
export const getAlias = getAliasFromUrlsObject(aliases)
export const getNoParamsUrl = getFromUrlsObject(noParamsUrls)
export const getBaseUrl = getFromUrlsObject(baseUrls)
export const getRedirectUrl = getFromUrlsObject(redirectForUrl)
export const getRootLevel = getFromUrlsObject(rootLevel)

export const getEntityPageUrl = (modelType, id) => {
  const currentSchemaKey = Object.keys(urlSchema).find(key => urlSchema[key].modelType === modelType)
  return getUrl(urlSchemaMap[currentSchemaKey], { id })
}

export const getUuidByPathname = (pathname) => {
  return Object.keys(uniqueUrls).find(key => {
    const url = uniqueUrls[key]
    if (!url) return false
    const regex = RegExp(`^${url.replace('/', '\\/').replace(paramsRegex, '[\\w\\-]+')}/?$`)
    return regex.test(pathname)
  })
}

export const getPermissionsForPathname = (pathname) => {
  const uuid = getUuidByPathname(pathname)
  return uuid && permissionsForUrl[uuid]
}

export const getBasePathForPathname = (pathname) => {
  const uuid = getUuidByPathname(pathname)
  return uuid && basePathsUrls[uuid]
}

export const getAliasForPathname = (pathname) => {
  const uuid = getUuidByPathname(pathname)
  return uuid && aliases[uuid]
}

export const getRootLevelForPathname = (pathname) => {
  const uuid = getUuidByPathname(pathname)
  return uuid && rootLevel[uuid]
}

export const urlSchemaConfig = urlSchema

export default urlSchemaMap
