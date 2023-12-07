import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import { getDisplayName } from '$trood/helpers/react'

import ModalWrapper from './components/ModalWrapper'
import * as actions from './actions'


const defaultCloseModalActions = ['cancelAction', 'submitAction', 'closeAction']
const defaultMapToProps = () => {}
const defaultMergeProps = (stateProps, dispatchProps) => ({ ...stateProps, ...dispatchProps })

const registerModal = (
  name,
  stateToProps = defaultMapToProps,
  dispatchToProps = defaultMapToProps,
  mergeProps = defaultMergeProps,
) => (WrappedModal) => {
  const modalStateToProps = (state, props) => {
    if (!props.show) {
      // Do not calculate props for closed modals
      return {}
    }
    return stateToProps(state, props)
  }
  const modalDispatchToProps = (dispatch) => ({
    ...dispatchToProps(dispatch),
    dispatch,
  })

  const modalMergeProps = (stateProps, dispatchProps, props) => {
    if (!props.show) {
      // For closed modals only modal props(line show) matters
      return props
    }
    const {
      dispatch,
    } = dispatchProps

    const mergedProps = mergeProps(stateProps, dispatchProps)
    const minimizeAction = () => dispatch(actions.toggleModalMinimize(name))
    const closingActions = defaultCloseModalActions.reduce((memo, action) => ({
      ...memo,
      [action]: (additionalAction) => {
        const finallyAction = () => {
          dispatch(actions.showModal(false, name))
          if (mergedProps[action]) {
            dispatch(mergedProps[action])
          }
        }
        if (typeof additionalAction === 'function') {
          const actionResult = additionalAction()
          if (actionResult instanceof Promise) {
            actionResult.then(() => {
              finallyAction()
            })
          } else {
            finallyAction()
          }
        } else {
          finallyAction()
        }
      },
    }), {})
    return {
      ...props,
      ...mergedProps,
      model: mergedProps.model || {}, // Some workaround for deleted forms, so we don't check in every modal
      minimizeAction,
      ...closingActions,
    }
  }
  const reduxModal = connect(modalStateToProps, modalDispatchToProps, modalMergeProps)
  const ConnectedModal = reduxModal(WrappedModal)
  const ConnectedModalWrapper = reduxModal(ModalWrapper)

  return class extends PureComponent {
    static displayName = `registerModal(${getDisplayName(WrappedModal)})`

    static propTypes = {
      openByNameMap: PropTypes.object,
      modalsOrderByNameMap: PropTypes.object,
    }

    static defaultProps = {
      openByNameMap: {},
      modalsOrderByNameMap: {},
    }

    render() {
      const {
        openByNameMap,
        modeByNameMap,
        paramsByNameMap,
        modalsOrderByNameMap,
        ...other
      } = this.props

      return (
        <ConnectedModalWrapper {...{
          name,
          key: 'modal',
          show: !!openByNameMap[name],
          mode: modeByNameMap[name],
          ...paramsByNameMap[name],
          order: modalsOrderByNameMap[name],
        }}>
          <ConnectedModal {...{
            show: !!openByNameMap[name],
            ...paramsByNameMap[name],
            ...other,
          }} />
        </ConnectedModalWrapper>
      )
    }
  }
}

export default registerModal
