import React from 'react'
import moment from 'moment'
import StoreContext from 'core/StoreContext'
import PageStoreContext from 'core/PageStoreContext'
import AuthStoreContext from 'core/AuthStoreContext'
import ContextContext from 'core/ContextContext'
import { useObserver } from 'mobx-react-lite'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Parser } from 'expr-eval'

import LoadingIndicator from 'components/LoadingIndicator'

import loadable from '@loadable/component'

const ComponentsWrapper = loadable.lib(() => import('components'))

const getData = (path, $data) => {
  const connectedPath = path.replace(/\[.*?\]/g, (replacement) => {
    const parsedParams = JSON.parse(replacement)
    const connectedParams = parsedParams.map((param) => {
      return param.$type ? connectProps([param], $data)[0] : connectProps(param, $data)
    })

    return JSON.stringify(Object.values(connectedParams))
  })

  const paths = connectedPath
    .replace(/\[[^\]]*\]/g, match => match.replace(/\./g, '\u2063')) // replace for save dot in args
    .split('.')
    .map(item => item.replace(/\u2063/g, '.')) // restore dot in args

  return paths.reduce((memo, key) => {
    if (memo === undefined) return memo
    if (memo[key] !== undefined) return memo[key]
    const params = /\[.*\]/g.exec(key)
    if (params && params[0]) {
      const action = key.split('[')[0]
      const parsedParams = JSON.parse(params)
      return memo[action](...parsedParams)
    }
    return undefined
  }, $data)
}

const connectProps = (props, $data, childBaseComponent) => {
  if (typeof props !== 'object') return props
  if (!props) return {}
  return Object.keys(props).reduce(
    (memo, key) => {
      const item = props[key]
      if (typeof item === 'object' && item.$type === '$data') {
        const propValue =
                    typeof item.path === 'object' ? connectProps(item.path, $data) : getData(item.path, $data)
        return { ...memo, [key]: propValue }
      }

      if (typeof item === 'object' && item.$type === '$expression') {
        const parser = new Parser()
        parser.functions.data = function (path) {
          return getData(path, $data)
        }
        const val = parser.evaluate(item.expression)
        return { ...memo, [key]: val }
      }

      if (typeof item === 'object' && item.$type === '$action') {
        const sequense = item.sequense ? item.sequense : [item]
        const executor = async ($event) => {
          const getConnectedFunction = (path, args) => {
            const connectedAction = getData(path, $data)
            return ($event) => {
              const connectedArgs = args
                ? args.map((param) => {
                  return param.$type
                    ? connectProps([param], { ...$data, $event })[0]
                    : connectProps(param, { ...$data, $event })
                })
                : {}
              return typeof connectedAction === 'function'
                ? connectedAction(...Object.values(connectedArgs))
                : undefined
            }
          }

          const connectedActions = sequense.map((actionItem) => {
            return {
              action: getConnectedFunction(actionItem.path, actionItem.args),
              then: actionItem.then
                ? getConnectedFunction(actionItem.then.path, actionItem.then.args)
                : null,
              catch: actionItem.catch
                ? getConnectedFunction(actionItem.catch.path, actionItem.catch.args)
                : null,
              finally: actionItem.finally
                ? getConnectedFunction(actionItem.finally.path, actionItem.finally.args)
                : null,
            }
          })
          try {
            for (const currentAction of connectedActions) {
              // execute action, try and catch of action
              let result
              try {
                result = await currentAction.action($event)
                if (typeof currentAction.then === 'function') {
                  currentAction.then(result)
                }
              } catch (error) {
                if (typeof currentAction.catch === 'function') {
                  currentAction.catch(error)
                } else {
                  throw error
                }
              } finally {
                if (typeof currentAction.finally === 'function') {
                  currentAction.finally(result)
                }
              }
            }
          } catch (error) {
            if (item.sequense && item.catch) {
              const action = getConnectedFunction(item.catch.path, item.catch.args)
              action(error)
            }
            //TODO remove console
            console.log(error)
          } finally {
            if (item.sequense && item.finally) {
              const action = getConnectedFunction(item.finally.path, item.finally.args)
              action()
            }
          }
        }
        return { ...memo, [key]: executor }
      }
      if (key === 'children' && childBaseComponent) {
        return {
          ...memo,
          [key]: [...(Array.isArray(props[key]) ? props[key] : [props[key]]), childBaseComponent],
        }
      }

      return memo
    },
    { ...props },
  )
}

const Wrapper = WrappedComponent => props => (
  <ComponentsWrapper
    fallback={
      <LoadingIndicator style={{ width: '100vw', height: '100vh' }} size={100} />
    }
  >
    {({ default: components }) => (<WrappedComponent {...props} coreComponents={components} />)}
  </ComponentsWrapper>
)

const BaseComponent = Wrapper(({ component, coreComponents }) => {
  const $store = React.useContext(StoreContext)
  const $page = React.useContext(PageStoreContext)
  const $auth = React.useContext(AuthStoreContext)
  const $context = React.useContext(ContextContext)

  React.useEffect(() => {
    if (component) component.loadChunk()
  }, [component])
  const history = useHistory()
  const location = useLocation()
  const params = useParams()
  const searchParams = new URLSearchParams(location.search)

  const $data = {
    $store,
    $route: { history, params, location, searchParams },
    $context,
    $page,
    $auth,
    $global: {
      window,
      moment,
    },
  }

  return useObserver(() => {
    if (!component || !component.nodes) return null
    return component.nodes.map((childComponent) => {
      if (!childComponent) return null
      const Component = coreComponents[childComponent.type] || childComponent.type
      const childBaseComponent = <BaseComponent key="Base" component={childComponent} />
      const connectedProps = childComponent.props
        ? connectProps(childComponent.props, $data, childBaseComponent)
        : {}
      if (typeof childComponent !== 'object') {
        return childComponent
      } else if (!connectedProps.children && childComponent.nodes.length) {
        connectedProps.children = [childBaseComponent]
      }

      return <Component key={childComponent.id} {...connectedProps} />
    })
  })
})

export default BaseComponent
export { getData }
