import React from 'react'
import { ICONS_TYPES } from '$trood/components/TIcon'


export const HISTORY_ACTION_CREATE = 'create'
export const HISTORY_ACTION_UPDATE = 'update'
export const HISTORY_ACTION_DELETE = 'remove'
export const HISTORY_BASE_OBJECT = 'baseObject'

export const HISTORY_ACTIONS = {
  [HISTORY_ACTION_CREATE]: HISTORY_ACTION_CREATE,
  [HISTORY_ACTION_UPDATE]: HISTORY_ACTION_UPDATE,
  [HISTORY_ACTION_DELETE]: HISTORY_ACTION_DELETE,
  [HISTORY_BASE_OBJECT]: HISTORY_BASE_OBJECT,
}

export const HISTORY_ACTIONS_DICT = {
  [HISTORY_ACTION_CREATE]: (objectName, modelName) => (
    <React.Fragment>
      <span>Создан объект</span>
      <span>{objectName.toLowerCase()}</span>
      {
        modelName &&
        <span>{modelName}</span>
      }
    </React.Fragment>
  ),
  [HISTORY_ACTION_UPDATE]: (objectName, modelName) => (
    <React.Fragment>
      <span>Изменен объект</span>
      <span>{objectName.toLowerCase()}</span>
      {
        modelName &&
        <span>{modelName}</span>
      }
    </React.Fragment>
  ),
  [HISTORY_ACTION_DELETE]: (objectName, modelName) => (
    <React.Fragment>
      <span>Удален объект</span>
      <span>{objectName.toLowerCase()}</span>
      {
        modelName &&
        <span>{modelName}</span>
      }
    </React.Fragment>
  ),
  [HISTORY_BASE_OBJECT]: (objectName, modelName) => (
    <React.Fragment>
      <span>{objectName}</span>
      {
        modelName &&
        <span>{modelName}</span>
      }
    </React.Fragment>
  ),
}

export const HISTORY_ACTIONS_ICONS = {
  [HISTORY_ACTION_CREATE]: ICONS_TYPES.plus,
  [HISTORY_ACTION_UPDATE]: ICONS_TYPES.edit,
  [HISTORY_ACTION_DELETE]: ICONS_TYPES.trashBin,
}
