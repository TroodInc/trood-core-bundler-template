import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Modifier, EditorState, RichUtils } from 'draft-js'

import TClickOutside from '../../../TClickOutside'
import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '../../../TIcon'
import StyleButton from '../StyleButton'

import style from './index.css'
import classNames from 'classnames'

class StyleColorPicker extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.node,
    editorState: PropTypes.object,
    colorStyles: PropTypes.arrayOf(PropTypes.object),
    onToggle: PropTypes.func,
  }

  static defaultProps = {
    colorStyles: [],
    editorState: {},
    onToggle: () => {},
  }

  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
    this.onStyleToggle = this.onStyleToggle.bind(this)
    this.onClose = () => this.setState({ open: false })
    this.toggleOpen = () => this.setState({ open: !this.state.open })
  }

  onStyleToggle(inlineStyle, editorState) {
    const selection = editorState.getSelection()

    // Let's just allow one color at a time. Turn off all active colors.
    const nextContentState = this.props.colorStyles
      .reduce((memo, curr) => {
        return Modifier.removeInlineStyle(memo, selection, curr.style)
      }, editorState.getCurrentContent())

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style',
    )

    const currentStyle = editorState.getCurrentInlineStyle()

    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((memo, curr) => {
        return RichUtils.toggleInlineStyle(memo, curr)
      }, nextEditorState)
    }

    this.props.onToggle(inlineStyle, nextEditorState)
  }

  render() {
    const {
      className,
      placeholder,
      colorStyles,
      editorState,
    } = this.props

    const { open } = this.state

    return (
      <TClickOutside onClick={this.onClose}>
        <div className={classNames(style.root, className)}>
          <div className={style.select} onClick={this.toggleOpen}>
            <span className={style.placeholder}>
              {placeholder}
            </span>
            <TIcon {...{
              size: 20,
              type: ICONS_TYPES.arrow,
              rotate: open ? ROTATE_TYPES.down : ROTATE_TYPES.up,
              onClick: this.toggleOpen,
              className: style.arrow,
            }} />
          </div>
          {open &&
            <div className={style.optionsContainer}>
              {colorStyles.map(type => (
                <StyleButton {...{
                  ...type,
                  editorState,
                  key: type.style,
                  onToggle: this.onStyleToggle,
                }} />
              ))}
            </div>
          }
        </div>
      </TClickOutside>
    )
  }
}

export default StyleColorPicker
