import uuidV4 from 'uuid/v4'
import deepEqual from 'deep-equal'

import { isDefAndNotNull, isPureObject } from '$trood/helpers/def'


// Replacing given value in given path in object, path can be just single key, or array of keys
export const getRecursiveObjectReplacement = (obj, name, value) => {
  if (!isDefAndNotNull(obj)) return obj
  if (typeof name === 'string' || typeof name === 'number' || name.length === 1) {
    const currentName = Array.isArray(name) ? name[0] : name
    if (!Array.isArray(obj)) {
      return {
        ...obj,
        [currentName]: value,
      }
    }
    const newArray = obj.slice()
    if (value === null) {
      newArray.splice(currentName, 1)
    } else {
      newArray.splice(currentName, 1, value)
    }
    return newArray
  }
  const currentName = name[0]
  const nextObject = isDefAndNotNull(obj[currentName]) ? obj[currentName] : {}
  if (!Array.isArray(obj)) {
    return {
      ...obj,
      [currentName]: getRecursiveObjectReplacement(nextObject, name.slice(1), value),
    }
  }
  const newArray = obj.slice()
  newArray.splice(currentName, 1, getRecursiveObjectReplacement(nextObject, name.slice(1), value))
  return newArray
}

export const getNestedObjectField = (obj, name) => {
  if (!isDefAndNotNull(obj) || !isDefAndNotNull(name)) return obj
  if (typeof name === 'string') return obj[name]
  return name.reduce((memo, item) => {
    return memo ? memo[item] : undefined
  }, obj)
}

export const reduceObject = (predicate) => (obj) => {
  if (!isPureObject(obj)) return obj
  if (Array.isArray(obj)) {
    return obj.map(item => reduceObject(predicate)(item))
  }
  return Object.keys(obj).reduce((memo, key) => {
    if (predicate(key, obj[key], obj)) return memo
    return {
      ...memo,
      [key]: reduceObject(predicate)(obj[key]),
    }
  }, {})
}

export const mutateObject = (predicate, transformFunc, keyParentPath = []) => (obj) => {
  if (!isPureObject(obj)) return obj
  if (Array.isArray(obj)) {
    return obj.map(item => mutateObject(predicate, transformFunc, keyParentPath)(item))
  }
  return Object.keys(obj).reduce((memo, key) => {
    if (predicate(key, obj[key], obj, keyParentPath)) {
      return {
        ...memo,
        [key]: transformFunc(obj[key]),
      }
    }
    return {
      ...memo,
      [key]: mutateObject(predicate, transformFunc, keyParentPath.concat(key))(obj[key]),
    }
  }, {})
}

export const removePrivateFields = reduceObject(key => key[0] === '$')

export const removeUndefinedKeys = reduceObject((key, value) => value === undefined)

export const updateUuuids = mutateObject(
  key => key === 'uuid',
  uuidV4,
)

export const replaceNulls = mutateObject(
  (key, value) => value === null,
  () => undefined,
)

export const deepEqualWithUndefines = (a, b) => deepEqual(removeUndefinedKeys(a), removeUndefinedKeys(b))

const merge = (first, second) => {
  if (!first) return second
  if (!second) return first
  if (typeof second !== 'object' || second === null || typeof first !== typeof second || Array.isArray(second)) {
    return second
  }
  const existsKeys = Object.keys({ ...first, ...second })
  const result = {}
  existsKeys.forEach(key => {
    result[key] = merge(first[key], second[key])
  })
  return result
}

export const mergeAndReplaceArrays = (...args) => {
  let obj
  args.forEach(arg => {
    obj = merge(obj, arg)
  })
  return obj
}
