import classNames from 'classnames'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { Editor, EditorState, RichUtils, ContentState, convertToRaw, convertFromHTML } from 'draft-js'
import draftToHtml from 'draftjs-to-html'

import StylizationMenu from './components/StylizationMenu'

import {
  DEFAULT_STYLES,
  DEFAULT_COLORS,
  DEFAULT_STYLES_SCHEMA,
  getColorStylesSchema,
  getColorStylesMap,
} from './constants'

import style from './index.css'

/**
 * Component for output Wysiwyg Editor.
 */

class WysiwygEditor extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** text value */
    value: PropTypes.string,
    /** you can specify an array of siliconizing tools. You can find more information at https://draftjs.org/ */
    usedStyles: PropTypes.arrayOf(PropTypes.string),
    /** you can specify an array of colors to style the text */
    usedColors: PropTypes.arrayOf(PropTypes.string),
    /** onChange function */
    onChange: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    value: '',
    usedStyles: Object.values(DEFAULT_STYLES),
    usedColors: DEFAULT_COLORS,
    onChange: () => {},
  }

  constructor(props) {
    super(props)
    const initialDraftValue = convertFromHTML(this.props.value)
    let initialContent
    if (initialDraftValue.contentBlocks) {
      initialContent = ContentState.createFromBlockArray(initialDraftValue)
    }
    this.state = {
      editorState: initialContent ? EditorState.createWithContent(initialContent) : EditorState.createEmpty(),
    }
    this.usedStylesSchema = props.usedStyles.map(s => DEFAULT_STYLES_SCHEMA[s]).filter(v => v)
    this.customStyleMap = {}
    this.usedTextColorStylesSchema = []
    this.usedBackgroundColorStylesSchema = []
    if (this.props.usedStyles.includes(DEFAULT_STYLES.textColor)) {
      this.usedTextColorStylesSchema = getColorStylesSchema(props.usedColors)
      this.customStyleMap = {
        ...this.customStyleMap,
        ...getColorStylesMap(props.usedColors),
      }
    }
    if (this.props.usedStyles.includes(DEFAULT_STYLES.backgroundColor)) {
      this.usedBackgroundColorStylesSchema = getColorStylesSchema(props.usedColors, true)
      this.customStyleMap = {
        ...this.customStyleMap,
        ...getColorStylesMap(props.usedColors, true),
      }
    }

    this.onChange = this.onChange.bind(this)
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this)
  }

  onChange(editorState) {
    const rawContentState = convertToRaw(editorState.getCurrentContent())
    this.props.onChange({
      target: {
        value: draftToHtml(rawContentState),
      },
    })
    this.setState({ editorState })
  }

  toggleInlineStyle(inlineStyle, editorState) {
    this.onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  render() {
    const { className, placeholder } = this.props

    const { editorState } = this.state

    return (
      <div className={classNames(style.root, className)}>
        <StylizationMenu {...{
          className: style.menu,
          inlineStyles: this.usedStylesSchema,
          textColorStyles: this.usedTextColorStylesSchema,
          backgroundColorStyles: this.usedBackgroundColorStylesSchema,
          editorState,
          onToggle: this.toggleInlineStyle,
        }} />
        <Editor {...{
          customStyleMap: this.customStyleMap,
          editorState,
          onChange: this.onChange,
          placeholder,
        }} />
      </div>
    )
  }
}

export {
  DEFAULT_STYLES,
  DEFAULT_COLORS,
  DEFAULT_STYLES_SCHEMA,
  getColorStylesSchema,
  getColorStylesMap,
} from './constants'

export default WysiwygEditor
