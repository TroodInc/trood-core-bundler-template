import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { forms } from 'redux-restify'

import * as actions from './actions'
import { PAGE_TYPE_BY_URL } from './constants'

import modals from '$trood/modals'

import PageAuth from './components/PageAuth'


const stateToProps = (state, props) => {
  const pageType = PAGE_TYPE_BY_URL[props.location.pathname]
  return {
    ...props,
    pageType,
    form: forms.selectors[pageType.formName].getForm(state),
    formErrors: forms.selectors[pageType.formName].getErrors(state),
    formIsValid: forms.selectors[pageType.formName].getIsValid(state),
    localeServiceForm: forms.selectors.localeServiceForm.getForm(state),
  }
}

const dispatchToProps = (dispatch) => ({
  authActions: bindActionCreators(actions, dispatch),
  dispatch,
})

const mergeProps = (stateProps, dispatchProps) => {
  return ({
    ...stateProps,
    ...dispatchProps,
    formActions: bindActionCreators(forms.actions[stateProps.pageType.formName], dispatchProps.dispatch),
    modalsActions: bindActionCreators(modals.actions, dispatchProps.dispatch),
  })
}

export default connect(stateToProps, dispatchToProps, mergeProps)(PageAuth)
