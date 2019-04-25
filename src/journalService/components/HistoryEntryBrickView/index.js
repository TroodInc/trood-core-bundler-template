import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import systemConfig from '$trood/config'

import { api, RestifyField, RestifyForeignKey, RestifyGenericForeignKey, RESTIFY_CONFIG } from 'redux-restify'

import style from './index.css'

import { getModelEntitiesName } from '$trood/entityManager'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'
import SmartDate, { SMART_DATE_FORMATS } from '$trood/components/SmartDate'

import {
  HISTORY_ACTIONS,
  HISTORY_ACTIONS_DICT,
  HISTORY_ACTIONS_ICONS,
} from '../../constants'

import { capitalize, camelToHuman, snakeToCamel } from '$trood/helpers/namingNotation'


class HistoryEntryBrickView extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    model: PropTypes.object,
  }

  static defaultProps = {
    className: '',
  }

  static getModelName(model, history) {
    const modelConfig = RESTIFY_CONFIG.registeredModels[model.$modelType]

    if (typeof modelConfig.toNode === 'function') {
      return modelConfig.toNode(model, history)
    }
    return <div>{model.title || model.name || model.id}</div>
  }

  static getActorName(model, actorEntities, history) {
    const { linkedObject } = model.actor
    if (!linkedObject) return <div>Система</div>

    let actor = {
      ...linkedObject,
      $modelType: systemConfig.services.auth.linkedObject,
    }
    if (actorEntities) actor = actorEntities.getById(actor.id)

    return HistoryEntryBrickView.getModelName(actor, history)
  }

  static defaultDiffToNode({
    model,
    history,
    fieldName,
    fieldConfig,
    arrowComp,
  }) {
    let newValue = model.diff[fieldName].update
    let prevValue = model.revision[fieldName]

    if (fieldConfig instanceof RestifyForeignKey || fieldConfig instanceof RestifyGenericForeignKey) {
      const state = RESTIFY_CONFIG.store.getState()
      let newValueModelType
      let prevValueModelType
      if (fieldConfig instanceof RestifyGenericForeignKey) {
        newValueModelType = (newValue || {})._object
        prevValueModelType = (prevValue || {})._object
      } else {
        newValueModelType = fieldConfig.modelType
        prevValueModelType = fieldConfig.modelType
      }

      if (newValue) {
        const newValueEntities = api.selectors.entityManager[newValueModelType].getEntities(state)
        const newValueId = typeof newValue === 'object' ? newValue.id : newValue
        newValue = newValueEntities.getById(newValueId)
        newValue = HistoryEntryBrickView.getModelName(newValue, history)
      }

      if (prevValue) {
        const prevValueEntities = api.selectors.entityManager[prevValueModelType].getEntities(state)
        const prevValueId = typeof prevValue === 'object' ? prevValue.id : prevValue
        prevValue = prevValueEntities.getById(prevValueId)
        prevValue = HistoryEntryBrickView.getModelName(prevValue, history)
      }
    }

    return (
      <React.Fragment>
        <div>{prevValue}</div>
        {arrowComp}
        <div>{newValue}</div>
      </React.Fragment>
    )
  }

  static getDifference(model, history) {
    const currentModelType = snakeToCamel(model.journalId)
    const currentModelConfig = RESTIFY_CONFIG.registeredModels[currentModelType]
    const diffKeys = Object.keys(model.diff || {})
    if (!diffKeys.length) return null
    return (
      <div className={style.diff}>
        {diffKeys.map(fieldName => {
          const currentFieldConfig = currentModelConfig.defaults[fieldName]
          const currentJournalFieldConfig = (currentModelConfig.journalFieldsConfig || {})[fieldName] || {}
          let fieldVerboseName = camelToHuman(fieldName)
          if (currentFieldConfig instanceof RestifyField && currentFieldConfig.verboseName) {
            fieldVerboseName = currentFieldConfig.verboseName
          }
          if (currentJournalFieldConfig.verboseName) {
            fieldVerboseName = currentJournalFieldConfig.verboseName
          }
          fieldVerboseName = capitalize(fieldVerboseName)

          const diffToNode = currentJournalFieldConfig.diffToNode || HistoryEntryBrickView.defaultDiffToNode

          const diff = diffToNode({
            model,
            history,
            fieldName,
            fieldConfig: currentFieldConfig,
            arrowComp: (
              <TIcon {...{
                type: ICONS_TYPES.arrowWithTail,
                className: style.updateIcon,
                rotate: 180,
                size: 15,
              }} />
            ),
          })

          return (
            <div className={style.diffEntry} key={fieldName}>
              <div className={style.fieldName}>{fieldVerboseName}</div>
              <div className={style.diffFields}>
                {diff}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  constructor(props) {
    super(props)
    this.getJournalModelName = this.getJournalModelName.bind(this)
    this.renderModelAction = this.renderModelAction.bind(this)
  }

  getJournalModelName(modelType, modelId, historyModel) {
    const modelEntityName = getModelEntitiesName(modelType)
    const modelEntity = this.props[modelEntityName]
    if (!modelEntity) return null
    let model = modelEntity.getById(modelId)
    if (!model.$loading && model.$error) {
      model = {
        ...model,
        ...historyModel,
      }
    }
    return HistoryEntryBrickView.getModelName(model, this.props.history)
  }

  renderModelAction({
    modelType,
    modelId,
    modelAction = 'baseObject',
    historyModel,
    getFieldValue = () => {},
    children,
  }) {
    if (!modelType) return children
    const modelConfig = RESTIFY_CONFIG.registeredModels[modelType]
    const modelName = this.getJournalModelName(modelType, modelId, historyModel)

    if (modelConfig.baseModel) {
      const baseModelField = modelConfig.baseModel.linkField
      const baseModelFieldConfig = modelConfig.defaults[baseModelField]
      const baseModelFieldValue = getFieldValue(baseModelField)
      let baseModelType
      let baseModelId
      let baseModel
      if (baseModelFieldValue) {
        if (baseModelFieldConfig instanceof RestifyGenericForeignKey) {
          baseModelType = snakeToCamel(baseModelFieldValue._object)
        } else {
          baseModelType = baseModelFieldConfig.modelType
        }
        if (baseModelType) {
          baseModelId = typeof baseModelFieldValue === 'object' ? baseModelFieldValue.id : baseModelFieldValue

          const baseModelEntityName = getModelEntitiesName(baseModelType)
          const baseModelEntity = this.props[baseModelEntityName]
          baseModel = baseModelEntity.getById(baseModelId)
        }
      }

      if (modelConfig.subModel) {
        const subModelField = modelConfig.subModel.linkField
        const subModelFieldConfig = modelConfig.defaults[subModelField]
        const subModelFieldValue = getFieldValue(subModelField)
        let subModelType
        let subModelId
        if (subModelFieldValue) {
          if (subModelFieldConfig instanceof RestifyGenericForeignKey) {
            subModelType = snakeToCamel(subModelFieldValue._object)
          } else {
            subModelType = subModelFieldConfig.modelType
          }
          if (subModelType) {
            subModelId = typeof subModelFieldValue === 'object' ? subModelFieldValue.id : subModelFieldValue
          }
        }

        const subModelConfig = RESTIFY_CONFIG.registeredModels[subModelType]
        const subModelName = this.getJournalModelName(subModelType, subModelId)
        return this.renderModelAction({
          modelType: baseModelType,
          modelId: baseModelId,
          getFieldValue: field => baseModel[field],
          children: (
            <div className={style.modelAction}>
              <div className={style.modelActionTitle}>
                {HISTORY_ACTIONS_DICT[modelAction](subModelConfig.name, subModelName)}
              </div>
              {children}
            </div>
          ),
        })
      }

      return this.renderModelAction({
        modelType: baseModelType,
        modelId: baseModelId,
        getFieldValue: field => baseModel[field],
        children: (
          <div className={style.modelAction}>
            <div className={style.modelActionTitle}>
              {HISTORY_ACTIONS_DICT[modelAction](modelConfig.name, modelName)}
            </div>
            {children}
          </div>
        ),
      })
    }

    return (
      <div className={style.modelAction}>
        <div className={style.modelActionTitle}>
          {HISTORY_ACTIONS_DICT[modelAction](modelConfig.name, modelName)}
        </div>
        {children}
      </div>
    )
  }

  render() {
    const {
      className,

      model,
      history,

      actorEntities,
    } = this.props

    const hasDiff = !!Object.values(model.diff || {}).length

    if (model.action === HISTORY_ACTIONS.update && !hasDiff) return null

    const actorName = HistoryEntryBrickView.getActorName(model, actorEntities, history)

    const modelType = snakeToCamel(model.journalId)
    const modelId = model.revision.id
    const modelAction = model.action

    return (
      <div {...{
        className: classNames(style.root, className),
      }} >
        <TIcon {...{
          type: HISTORY_ACTIONS_ICONS[model.action],
          className: style.icon,
        }} />
        <div className={style.content}>
          {this.renderModelAction({
            modelType,
            modelId,
            modelAction,
            historyModel: model.revision,
            getFieldValue: field => {
              let fieldValue = ((model.diff || {})[field] || {})[model.action]
              if (!fieldValue) fieldValue = (model.revision || {})[field]
              return fieldValue
            },
            children: model.action === HISTORY_ACTIONS.update ?
              HistoryEntryBrickView.getDifference(model, history) : undefined,
          })}
        </div>
        <div className={style.info}>
          <SmartDate {...{
            className: style.date,
            date: model.ts * 1000,
            format: SMART_DATE_FORMATS.fullWithTime,
          }} />
          {actorName}
        </div>
      </div>
    )
  }
}

const stateToProps = (state, props) => ({
  ...props,
  // We should rerender for every api change, so we don't miss some object updates(nested entities loaded for ex)
  restifyState: state.api,
})

export default connect(stateToProps)(HistoryEntryBrickView)
