import memoizeOne from 'memoize-one'
import objectGet from 'lodash/get'
import deepEqual from 'deep-equal'

import systemConfig from '$trood/config'

import {
  defaultPageManagerContext,
  getPagesRouteShemaRenderers,
  getPagesHeaderRenderers,
  getAllPaths,
} from '$trood/pageManager'


export const menuRenderers = getPagesHeaderRenderers(systemConfig.pages)

const getProfileNeededFields = (permissions = {}) => {
  let frontendPermissions = permissions.frontend || {}
  frontendPermissions = Object.values(frontendPermissions)
  frontendPermissions = frontendPermissions.reduce((memo, curr) => {
    if (typeof curr !== 'object') return memo
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

const getRenderers = (sbj, ctx, permissions = {}) => {
  return getPagesRouteShemaRenderers(
    systemConfig.pages,
    {
      extraPages: systemConfig.entityPages,
    },
    {
      data: {
        sbj,
        ctx,
      },
      rules: permissions,
    },
  )
}

const getPageManagerContext = registeredRoutesPaths => ({
  ...defaultPageManagerContext,
  registeredRoutesPaths,
})

const memoizedGetProfileNeededFields = memoizeOne(getProfileNeededFields)
export const memoizedGetRenderers = memoizeOne(getRenderers, (a, b) => {
  if (a[2] !== b[2]) return false
  const neededField = memoizedGetProfileNeededFields(a[2])
  if (!deepEqual(a[1], b[1])) return false
  return neededField.reduce((memo, field) => {
    return memo && deepEqual(objectGet(a[0], field), objectGet(b[0], field))
  }, true)
})
export const memoizedGetAllPaths = memoizeOne(getAllPaths)
export const memoizedGetPageManagerContext = memoizeOne(getPageManagerContext)
