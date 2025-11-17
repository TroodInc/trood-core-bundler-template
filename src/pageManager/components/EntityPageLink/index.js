import React from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

import style from './index.css'

import { PageManagerContext } from '../../constants'
import { getEntityPageUrl } from '../../urlSchema'
import { getIsAllowPath } from '../../helpers'


const getEntityPageLink = (
  model,
  registeredRoutesPaths,
) => {
  if (!model.$modelType) return undefined
  const to = getEntityPageUrl(model.$modelType, model.id)
  if (!to) return undefined
  return getIsAllowPath(to, registeredRoutesPaths) ? to : undefined
}

const EntityPageLink = ({
  model = {},
  className,
  children,
  ...other
}) => {
  return (
    <PageManagerContext.Consumer>
      {({ registeredRoutesPaths }) => {
        const to = getEntityPageLink(model, registeredRoutesPaths)
        const Component = to ? Link : props => <div {...props} />
        return (
          <Component {...{
            to,
            className: classNames(style.root, className, model.$error && style.error),
            'data-cy': `${model.$modelType}Link_${model.id}`,
            ...other,
          }}>
            {children}
          </Component>
        )
      }}
    </PageManagerContext.Consumer>
  )
}

export { getEntityPageLink }

export default EntityPageLink

