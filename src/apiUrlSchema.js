import { CRUD_ACTIONS } from 'redux-restify'

import { snakeToCamel, camelToLowerSnake } from '$trood/helpers/namingNotation'


export const DEFAULT_ALLOWED_NO_TOKEN_ENDPOINTS = [
  /.*/,
]

export const API_TYPE_CUSTODIAN = 'CUSTODIAN'

const transformAccessDeniedResponse = (data) => {
  if (Array.isArray(data)) {
    return data.map(d => transformAccessDeniedResponse(d))
  }
  if (data && typeof data === 'object') {
    const dataKeys = Object.keys(data)
    if (dataKeys.length === 1 && data.access === 'denied') {
      return null
    }
    return dataKeys.reduce((memo, key) => ({
      ...memo,
      [key]: transformAccessDeniedResponse(data[key]),
    }), {})
  }
  return data
}

export const API_TYPES = {
  [API_TYPE_CUSTODIAN]: {
    getEntityUrl: ({
      apiHost,
      apiPrefix,
      modelEndpoint,
      entityId,
      crudAction,
    }) => {
      const url = `${apiHost}${apiPrefix}${modelEndpoint}${entityId ? `/${entityId}` : ''}`
      if (crudAction === CRUD_ACTIONS.read || crudAction === CRUD_ACTIONS.delete) return url
      return `${url}?depth=3`
    },
    getPaginationQuery: (query, page, pageSize) => {
      if (/limit\u0028[0-9]+\u002c[0-9]+\u0029/.test(query.q)) return query // for custom limit
      const limitStr = `limit(${(page - 1) * pageSize},${pageSize})`
      return {
        ...query,
        q: query.q ? `${query.q},${limitStr}` : limitStr,
      }
    },
    transformArrayResponse: response => ({
      data: transformAccessDeniedResponse(response.data),
      count: response.totalCount,
    }),
    transformEntityResponse: response => {
      // TODO by @deylak one more custodian hack, cause for update requests it doesn't send this format
      if (typeof response.data === 'object' && typeof response.status === 'string') {
        return {
          data: transformAccessDeniedResponse(response.data),
        }
      }
      return {
        data: transformAccessDeniedResponse(response),
      }
    },
    getGenericModel: (fieldValue) => ({
      modelType: snakeToCamel(fieldValue._object || 'undefined'),
      model: fieldValue,
    }),
    getGenericFormField: (fieldValue) => ({
      _object: camelToLowerSnake(fieldValue._object || 'unedfined'),
      id: fieldValue.id,
    }),
  },
}

export const noSlashEnforceUrl = ({
  apiHost,
  apiPrefix,
  modelEndpoint,
  entityId,
  specialAction,
}) => {
  let slashAfterId = ''
  if (entityId && (typeof entityId === 'number' || (typeof entityId === 'string' && !entityId.endsWith('/')))) {
    slashAfterId = '/'
  }
  const baseUrl = `${modelEndpoint}${entityId || ''}${slashAfterId}${specialAction || ''}`
  return `${apiHost}${apiPrefix}${baseUrl}`
}
