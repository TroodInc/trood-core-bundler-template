import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import { NativeTypes } from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
import { defineMessages } from 'react-intl'

import { intlObject } from '$trood/localeService'

import style from './index.css'

import TIcon from '$trood/components/TIcon'
import { ICONS_TYPES } from '$trood/components/TIcon/constants'

import { FILE_API_HOST } from '$trood/fileApiUrlSchema'


const messages = defineMessages({
  dropFile: {
    id: 'files.components.TFileInput.drop_file',
    defaultMessage: 'Drop file here',
  },
})

const dropTarget = {
  drop: (props, monitor) => {
    props.onChange(monitor.getItem().files)
  },
}

const collectDropTarget = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
})

class TFileInput extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    height: PropTypes.number,

    label: PropTypes.node,
    withStyling: PropTypes.bool,
    subLabel: PropTypes.node,

    host: PropTypes.string,

    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    accept: PropTypes.string,

    isUploading: PropTypes.bool,
    loadingProgress: PropTypes.number,

    onChange: PropTypes.func,
    selectedFiles: PropTypes.arrayOf(PropTypes.object),

    errors: PropTypes.arrayOf(PropTypes.string),

    showFileList: PropTypes.bool,
    background: PropTypes.string,

    // Injected by React DnD:
    isOver: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
  }

  static defaultProps = {
    className: '',
    withStyling: true,
    multiple: false,
    disabled: false,
    host: FILE_API_HOST,
    isUploading: false,
    loadingProgress: 0,
    onChange: () => {},
    selectedFiles: [],

    errors: [],

    showFileList: false,
  }

  render() {
    const {
      className,
      accept,
      withStyling,
      subLabel,
      multiple,
      host,
      disabled,
      isUploading,
      loadingProgress,
      selectedFiles,
      onChange,
      height,
      background: propsBackground,

      errors,

      showFileList,

      isOver,
      connectDropTarget,
    } = this.props

    const label = isOver ? intlObject.intl.formatMessage(messages.dropFile) : this.props.label

    let background
    if (propsBackground) {
      if (propsBackground.match(/https?:\/\//) || propsBackground.includes('data:image')) {
        background = propsBackground
      } else {
        background = host + propsBackground
      }
    }

    let backgroundStyle
    if (background) {
      backgroundStyle = {
        background: `url('${background}') no-repeat center center`,
        backgroundSize: 'cover',
      }
    }
    return connectDropTarget(
      <div {...{
        className: classNames(style.root, className),
      }} >
        {showFileList &&
          <div className={style.fileList}>
            {selectedFiles.filter(f => f.name).map((file, key, array) => (
              <div className={style.file} key={key}>
                <div>{file.name}</div>
                <TIcon {...{
                  type: ICONS_TYPES.trashBin,
                  className: style.trash,
                  onClick: () => onChange(array.filter((item, index) => index !== key)),
                }} />
              </div>
            ))}
          </div>
        }
        <label {...{
          className: classNames(withStyling && style.inputContainer, errors.length && style.error),
          style: {
            ...backgroundStyle,
            height,
          },
        }}>
          {isOver &&
            <div className={style.fileOver} />
          }
          <div className={withStyling ? style.label : ''}>
            {isUploading && loadingProgress !== 0 ? `${loadingProgress.toFixed()}%` : label}
          </div>
          {!isUploading && subLabel &&
            <div className={style.subLabel}>
              {subLabel}
            </div>
          }
          <input {...{
            className: style.fileInput,
            type: 'file',
            'data-cy': 'upload_button',
            accept,
            multiple,
            disabled: disabled || isUploading,
            onChange: (e) => onChange(e.target.files),
          }} />
          {isUploading && loadingProgress !== 0 &&
            <div
              style={{ width: `${loadingProgress}%` }}
              className={style.loadingProgress}>
            </div>
          }
        </label>
        {!!errors.length &&
          <div className={style.errors}>
            {errors.map((error, index) => (
              <div className={style.errorText} key={index}>
                {error}
              </div>
            ))}
          </div>
        }
      </div>,
    )
  }
}

const dropDecorator = DropTarget(
  NativeTypes.FILE,
  dropTarget,
  collectDropTarget,
)

export default dropDecorator(TFileInput)
