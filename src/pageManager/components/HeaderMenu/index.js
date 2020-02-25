import PropTypes from 'prop-types'
import React, { PureComponent} from 'react'
import { Route } from 'react-router-dom'
import classNames from 'classnames'

import style from './index.css'
import urlSchema, {
  urlSchemaConfig,
  HEADER_SHOW,
  HEADER_HIDE,
} from '../../urlSchema'

import { getNestedObjectField } from '$trood/helpers/nestedObjects'

import { HEADER_TYPES, MIN_MENU_RENDERERS } from './constants'

import MainLink from './components/MainLink'
import AdditionalLink from './components/AdditionalLink'


class HeaderMenu extends PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(Object.values(HEADER_TYPES)),
    basePath: PropTypes.array,
    menuRenderers: PropTypes.object,
    additionalLinks: PropTypes.array,
    autoResize: PropTypes.bool,
  }

  static defaultProps = {
    type: HEADER_TYPES.left,
    basePath: [],
    menuRenderers: {},
    additionalLinks: [],
    autoResize: true,
  }

  constructor(props) {
    super(props)

    this.state = {
      open: false,
    }
  }

  render() {
    const {
      className = '',
      type = HEADER_TYPES.left,

      basePath = [],
      menuRenderers = {},

      additionalLinks = [],

      autoResize = true,
    } = this.props

    const { open } = this.state

    if (Object.keys(menuRenderers).length < MIN_MENU_RENDERERS && !additionalLinks.length) return null
    const preAdditionalLinks = additionalLinks.filter(link => link && link.pre)
    const postAdditionalLinks = additionalLinks.filter(link => link && !link.pre)

    return (
      <Route render={match => {
        const currentSchemaConfig = getNestedObjectField(
          urlSchemaConfig,
          [].concat(basePath)
            .map(name => [name, 'pages'])
            .reduce((a, b) => a.concat(b), []),
        )
        const currentBaseUrl = getNestedObjectField(urlSchema, basePath)

        const routeToRenderedKeysReduceFunc = (schemaConfig, prevKey) => (memo, key) => {
          const currentConfig = schemaConfig[key]
          if (currentConfig.header === HEADER_HIDE) return memo
          if (currentConfig.header === HEADER_SHOW) return [...memo, prevKey ? [].concat(prevKey, key) : key]
          return memo
        }
        const headerKeysToRender = Object.keys(currentSchemaConfig).reduce(
          routeToRenderedKeysReduceFunc(currentSchemaConfig),
          [],
        )

        return (
          <div {...{
            className: classNames(
              style.root,
              style[type],
              className,
              autoResize && style.autoResize,
              open && style.open,
            ),
            onClick: () => this.setState({ open: !open }),
          }}>
            {preAdditionalLinks.map((link, key) => (
              <AdditionalLink {...{
                ...this.props,
                link,
                key,
              }} />
            ))}
            {headerKeysToRender.map(key => {
              return (
                <MainLink {...{
                  ...this.props,
                  key,
                  navKey: key,
                  currentBaseUrl,
                }} />
              )
            })}
            {postAdditionalLinks.map((link, key) => (
              <AdditionalLink {...{
                ...this.props,
                link,
                key,
              }} />
            ))}
          </div>
        )
      }} />
    )
  }
}

export { HEADER_TYPES }

export default HeaderMenu
