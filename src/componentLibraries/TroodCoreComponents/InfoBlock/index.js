import React from 'react'

import classNames from 'classnames'
import basePageLayout from '$trood/styles/basePageLayout.css'
import style from './index.css'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'
import SmartDate, { SMART_DATE_FORMATS } from '$trood/components/SmartDate'
import LoadingBlockContainer from '$trood/components/LoadingBlockContainer'
import { templateApplyValues } from '$trood/helpers/templates'

import { EntityPageLink } from '$trood/pageManager'
import { camelToLowerSnake } from '$trood/helpers/namingNotation'
import { RESTIFY_CONFIG } from 'redux-restify'


const InfoBlock = ({
  className = '',
  title = '',
  model = {},
  modelEditorActions = {},
  isLoading = false,
  editable = false,
  include = [],
  exclude = [],
}) => {
  const config = RESTIFY_CONFIG.registeredModels[model.$modelType]
  let subDataArray = []

  const dataArray = Object.keys(config.meta)
    .filter(fieldName => {
      if (exclude.includes(fieldName)) return false
      if (include.length === 0) return true
      return include.includes(fieldName)
    })
    .map(fieldName => {
      const fieldNameSnake = camelToLowerSnake(fieldName)
      const itemName = fieldName.replace( /([A-Z])/g, ' $1' ).toLowerCase()
      const label = itemName.charAt(0) + itemName.slice(1)
      const field = config.meta[fieldName]

      if (field.linkType === 'outer') return null

      if (field.linkType) {
        if (!model[fieldName]) return null

        if (field.type === 'objects') {
          if (!model[fieldName].length) return null

          subDataArray = model[fieldName].map(item => {
            const { name, idField, views } = RESTIFY_CONFIG.registeredModels[item.$modelType]
            const template = views.name || views.default || `${name}/{${item[idField]}}`

            return {
              label,
              value:
                <EntityPageLink key={item[idField]} model={item}>
                  {templateApplyValues(template, item)}
                </EntityPageLink>,
            }
          })

          return undefined
        }

        const { name, idField, views } = RESTIFY_CONFIG.registeredModels[model[fieldName].$modelType]
        const template = views.name || views.default || `${name}/{${model[idField]}}`

        return {
          label,
          value:
            <EntityPageLink model={model[fieldName]}>
              {templateApplyValues(template, model[fieldName])}
            </EntityPageLink>,
        }
      }

      if ((model[fieldName] && field.type === 'string') || (model[fieldName] && field.type === 'number')) {
        return {
          label,
          value: model[fieldName],
        }
      }

      if (model[fieldName] && field.type === 'bool') {
        return {
          label,
          value: model[fieldName] ? 'true' : 'false',
        }
      }

      if (model[fieldName] && field.type === 'datetime') {
        return {
          label,
          value :
            <SmartDate
              {...{
                date: model[fieldName],
                format: SMART_DATE_FORMATS.shortWithTime,
              }}
            />,
        }
      }

      if (config.idField === fieldNameSnake) {
        return {
          label,
          value: <EntityPageLink model={model[fieldName]}>{model[fieldName]}</EntityPageLink>,
        }
      }

      return undefined
    }).concat(subDataArray)
    .filter((v) => v)

  return (
    <LoadingBlockContainer {...{
      className: classNames(basePageLayout.block, style.root, className),
      isBlocked: isLoading,
    }}>
      <div className={
        classNames(
          basePageLayout.blockHeaderContainer,
          style.infoHeaderWrap,
          !title && style.noneTitle,
        )
      }>
        {title &&
          <div className={basePageLayout.blockTitle}>
            {title}
          </div>
        }
        {editable &&
          <div className={basePageLayout.blockHeaderButtons}>
            <TIcon {...{
              className: style.edit,
              type: ICONS_TYPES.edit,
              size: 16,
              onClick: () => modelEditorActions.editEntity(model),
            }} />
          </div>
        }
      </div>
      <div className={classNames(basePageLayout.blockContentThin, style.infoRowWrap)}>
        {dataArray.map((item, i)=> (
          <div className={style.infoRow} key={i}>
            <div className={style.infoLabel}>
              {item.label}
            </div>
            <div className={style.infoValue}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </LoadingBlockContainer>
  )
}

export default InfoBlock
