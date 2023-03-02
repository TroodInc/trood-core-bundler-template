import classNames from 'classnames'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { EditorState, ContentState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'

import { Editor } from 'react-draft-wysiwyg'
import { connect } from 'react-redux'
import { forms } from 'redux-restify'

import { checkCurrentLocale } from '$trood/localeService'

import { TOOLBAR } from './constants'
import styles from './index.css'


/**
 * Component for output Wysiwyg Editor.
 */

class WysiwygEditor extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** text value */
    value: PropTypes.string,
    /** onChange function */
    onChange: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    value: '',
    onChange: () => {},
  }

  constructor(props) {
    super(props)

    let editorState
    if (props.value) {
      const { contentBlocks, entityMap } = htmlToDraft(props.value)
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
      editorState = EditorState.createWithContent(contentState)
    } else {
      editorState = EditorState.createEmpty()
    }
    this.state = { editorState }

    this.onChange = this.onChange.bind(this)
  }

  onChange(editorState) {
    this.props.onChange({
      target: {
        value: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      },
    })
    this.setState({ editorState })
  }

  render() {
    const { className, placeholder, locale } = this.props

    const { editorState } = this.state

    return (
      <Editor {...{
        placeholder,
        toolbar: TOOLBAR,
        editorState,
        wrapperClassName: classNames(className, styles.root),
        toolbarClassName: styles.toolbar,
        editorClassName: styles.editor,
        onEditorStateChange: this.onChange,
        localization: locale ? { locale } : undefined,
      }} />
    )
  }
}

const mapStateToProps = (state) => {
  const localeServiceForm = forms.selectors.localeServiceForm.getForm(state)
  return ({
    locale: checkCurrentLocale(localeServiceForm.selectedLocale),
  })
}

export default connect(mapStateToProps)(WysiwygEditor)
