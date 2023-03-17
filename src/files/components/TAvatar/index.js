import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'
import { DEFAULT_SIZE } from './constants'

import TFileInput from '../TFileInput'
import TIcon, { ICONS_TYPES } from '$trood/components/TIcon'

import { UUID_REGEXP } from '$trood/mainConstants'
import { FILE_API_HOST } from '$trood/fileApiUrlSchema'

import localeService, { intlObject } from '$trood/localeService'


const avatarUUIDRegExp = new RegExp(`^${UUID_REGEXP.source}$`)

class TAvatar extends PureComponent {
  static propTypes = {
    size: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    defaultAvatar: PropTypes.string,
    host: PropTypes.string,
    round: PropTypes.bool,
    editable: PropTypes.bool,
    label: PropTypes.node,
    avatar: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.number,
    ]),
    canClear: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string,
    labelClassName: PropTypes.string,
    filesEntities: PropTypes.object,
    filesActions: PropTypes.object,
  }

  static defaultProps = {
    size: DEFAULT_SIZE,
    defaultAvatar: '/static/img/defaultAvatar.png',
    host: FILE_API_HOST,
    filesActions: {},
  }

  constructor(props) {
    super(props)
    this.editImage = this.editImage.bind(this)
  }

  editImage(value) {
    if (value) {
      const { filesActions, size, width, height } = this.props
      const reader = new FileReader()
      reader.onload = file =>
        filesActions.editImage(
          file.target.result,
          img => filesActions.uploadFile(img.imgFile)
            .then(this.props.onChange),
          {
            width: (width || size) * 2,
            height: (height || size) * 2,
          },
        )
      reader.readAsDataURL(value)
    }
  }

  render() {
    const {
      label,
      defaultAvatar,
      host,
      size,
      width,
      height,
      round,
      editable,
      onClear,
      className,
      labelClassName,
      filesEntities,
      filesActions,
    } = this.props

    let { avatar } = this.props
    if (avatar) {
      if (typeof avatar === 'object') {
        avatar = this.props.avatar.fileUrl
      } else if (avatarUUIDRegExp.test(avatar) || Number.isInteger(avatar)) {
        avatar = filesEntities.getById(avatar).fileUrl
      }

      if (avatar && !/^(https?:)?\/\//.test(avatar)) {
        avatar = host + avatar
      }
    }

    return (
      <div {...{
        className: classNames(style.root, className),
        style: {
          width: width || size,
        },
      }}>
        {label &&
          <div className={classNames(style.label, labelClassName)}>
            {label}
          </div>
        }
        <div {...{
          className: classNames(style.avatarBox, { [style.round]: round }),
          style: { height: height || size },
        }}>
          {avatar && onClear &&
            <TIcon {...{
              type: ICONS_TYPES.clear,
              className: style.clear,
              onClick: onClear,
            }} />
          }
          <img src={avatar || defaultAvatar} alt="avatar" />
        </div>
        {editable && filesActions.editImage &&
          <TFileInput {...{
            key: `${avatar}FileInput`,
            className: style.uploadButton,
            label: (
              <div className={style.uploadLabel}>
                {intlObject.intl.formatMessage(localeService.generalMessages.upload)}
              </div>
            ),
            onChange: (values) => this.editImage(values[0]),
          }} />
        }
      </div>
    )
  }
}

export default TAvatar
