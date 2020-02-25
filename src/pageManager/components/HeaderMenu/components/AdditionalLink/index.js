import React from 'react'
import classNames from 'classnames'

import style from '../../index.css'

import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'


const AdditionalLink = ({
  link,
  linkClassName,
  linkActiveClassName,
  iconClassName,
  LinkComponent,
}) => {
  return (
    <div {...{
      onClick: link.onClick && (() => link.onClick()),
      className: classNames(
        linkClassName,
        style.url,
        link.active && style.active,
        link.active && linkActiveClassName,
        link.className,
        link.active && link.activeClassName,
      ),
    }}>
      {
        !LinkComponent &&
        <React.Fragment>
          {link.iconType &&
          <TIcon {...{
            className: classNames(style.icon, iconClassName),
            type: link.iconType,
          }} />
          }
          <span>{link.label}</span>
        </React.Fragment>
      }
      {
        LinkComponent &&
        <LinkComponent {...{
          icon: link.iconType,
          label: link.label,
        }} />
      }
      <TIcon {...{
        size: 8,
        type: ICONS_TYPES.triangleArrow,
        className: style.control,
      }} />
    </div>
  )
}

export default AdditionalLink
