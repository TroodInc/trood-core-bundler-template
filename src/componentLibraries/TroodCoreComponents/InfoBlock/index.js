import React from 'react'

import classNames from 'classnames'
import basePageLayout from '$trood/styles/basePageLayout.css'
import style from './index.css'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'
import SmartDate, { SMART_DATE_FORMATS } from '$trood/components/SmartDate'
import LoadingBlockContainer from '$trood/components/LoadingBlockContainer'
import { templateApplyValues } from '$trood/helpers/templates'
import { isDefAndNotNull } from '$trood/helpers/def'

import { EntityPageLink } from '$trood/pageManager'
import { RESTIFY_CONFIG } from 'redux-restify'


const InfoBlock = ({
  className = '',
  title = '',
  model = {},
  modelEditorActions = {},
  modelIsLoading = false,
  editable = false,
  include = [],
  exclude = [],
}) => {
  const config = RESTIFY_CONFIG.registeredModels[model.$modelType]
  let dataArray = []

  Object.keys(config.meta)
    .filter(fieldName => {
      if (exclude.includes(fieldName)) return false
      if (include.length === 0) return true
      return include.includes(fieldName)
    })
    .forEach(fieldName => {
      if (isDefAndNotNull(model[fieldName])) {
        const field = config.meta[fieldName]

        if (field.linkType && (field.linkType !== 'outer')) {
          const valuesArray = (field.type === 'objects' ? model[fieldName] : [model[fieldName]]).filter(v => v)
          valuesArray.forEach(item => {
            const { name, idField, views } = RESTIFY_CONFIG.registeredModels[item.$modelType]
            const template = views.tableCell || views.default || `${name}/{${item[idField]}}`

            dataArray.push({
              label: fieldName,
              value: (
                <EntityPageLink key={item[idField]} model={item}>
                  {templateApplyValues(template, item)}
                </EntityPageLink>
              ),
            })
          })
        }

        if (field.type === 'string' || field.type === 'number') {
          dataArray.push({
            label: fieldName,
            value: model[fieldName],
          })
        }

        if (field.type === 'bool') {
          dataArray.push({
            label: fieldName,
            value: model[fieldName] ? 'true' : 'false',
          })
        }

        if (field.type === 'datetime') {
          dataArray.push({
            label: fieldName,
            value :
              <SmartDate
                {...{
                  date: model[fieldName],
                  format: SMART_DATE_FORMATS.shortWithTime,
                }}
              />,
          })
        }
      }
    })

  return (
    <LoadingBlockContainer {...{
      className: classNames(basePageLayout.block, style.root, className),
      isBlocked: modelIsLoading,
    }}>
      <div className={
        classNames(
          basePageLayout.blockHeaderContainer,
          style.infoHeaderWrap,
          !title && style.noneTitle,
        )
      }>
        {
          title &&
          <div className={basePageLayout.blockTitle}>
            {title}
          </div>
        }
        {
          editable &&
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
