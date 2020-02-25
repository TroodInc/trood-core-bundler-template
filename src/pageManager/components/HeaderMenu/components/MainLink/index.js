import React from 'react'
import classNames from 'classnames'

import style from '../../index.css'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'

import { getNestedObjectField } from '$trood/helpers/nestedObjects'
import localeService, { intlObject } from '$trood/localeService'

import PageNavLink from '../../../PageNavLink'


const MainLink = ({
  navKey,
  currentBaseUrl,
  menuRenderers,
  linkClassName,
  linkActiveClassName,
  iconClassName,
  LinkComponent,
}) => {
  const currentRenderer = getNestedObjectField(menuRenderers, navKey) || menuRenderers[navKey[navKey.length - 1]]
  if (!currentRenderer) return null
  let currentLabel = currentRenderer.label
  const currentMessage = localeService.localeMessages[currentRenderer.localeMessageId]
  if (currentRenderer.localeMessageId && intlObject.intl && currentMessage) {
    currentLabel = intlObject.intl.formatMessage(currentMessage)
  }
  const currentIconType = currentRenderer.iconType
  return (
    <PageNavLink {...{
      key: navKey,
      navKey,
      baseUrl: currentBaseUrl,
      activeClassName: classNames(style.active, linkActiveClassName),
      className: classNames(style.url, linkClassName),
    }}>
      {
        !LinkComponent &&
        <React.Fragment>
          {currentIconType &&
          <TIcon className={classNames(style.icon, iconClassName)} type={currentIconType} />
          }
          {currentLabel}
        </React.Fragment>
      }
      {
        LinkComponent &&
        <LinkComponent {...{
          icon: currentIconType,
          label: currentLabel,
        }} />
      }
      <TIcon {...{
        size: 8,
        type: ICONS_TYPES.triangleArrow,
        className: style.control,
      }} />
    </PageNavLink>
  )
}

export default MainLink
