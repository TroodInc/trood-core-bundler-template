import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import withTooltip from '../internal/Tooltip'

import style from './index.module.css'

import Icon, { ICONS_TYPES } from '../Icon'

import {
  BUTTON_TYPES,
  BUTTON_COLORS,
  BUTTON_SPECIAL_TYPES,
} from './constants'


const BUTTON_SPECIAL_ICONS = {
  [BUTTON_SPECIAL_TYPES.add]: (
    <Icon {...{
      type: ICONS_TYPES.plus,
      className: style.addIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.addFill]: (
    <Icon {...{
      type: ICONS_TYPES.plus,
      className: style.addIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.minus]: (
    <Icon {...{
      type: ICONS_TYPES.minus,
      className: style.minusIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.delete]: (
    <Icon {...{
      type: ICONS_TYPES.trashBin,
      className: style.deleteIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.text]: (
    <Icon {...{
      type: ICONS_TYPES.paragraph,
      className: style.textIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.attach]: (
    <Icon {...{
      type: ICONS_TYPES.attachment,
      className: style.textIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.icon]: null,
  [BUTTON_SPECIAL_TYPES.arrowLeft]: (
    <Icon {...{
      type: ICONS_TYPES.arrow,
      rotate: 90,
      size: 20,
      className: style.textIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.arrowRight]: (
    <Icon {...{
      type: ICONS_TYPES.arrow,
      rotate: 270,
      size: 20,
      className: style.textIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.edit]: (
    <Icon {...{
      type: ICONS_TYPES.edit,
      className: style.textIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.download]: (
    <Icon {...{
      type: ICONS_TYPES.download,
      className: style.textIcon,
    }} />
  ),
  [BUTTON_SPECIAL_TYPES.upload]: (
    <Icon {...{
      type: ICONS_TYPES.upload,
      className: style.textIcon,
    }} />
  ),
}

/**
 * Component for output Button.
 */

class Button extends PureComponent {
  static propTypes = {
    /** type is one of BUTTON_TYPES.text, BUTTON_TYPES.border, BUTTON_TYPES.fill */
    type: PropTypes.oneOf(Object.values(BUTTON_TYPES)),
    /** special type is one of BUTTON_TYPES.add, BUTTON_TYPES.addFill, BUTTON_TYPES.minus, BUTTON_TYPES.delete,
     * BUTTON_TYPES.text, BUTTON_TYPES.icon, BUTTON_TYPES.arrowLeft, BUTTON_TYPES.arrowRight, BUTTON_TYPES.attach,
     * BUTTON_TYPES.edit, BUTTON_TYPES.download, BUTTON_TYPES.upload */
    specialType: PropTypes.oneOf(Object.values(BUTTON_SPECIAL_TYPES)),
    /** color is one of BUTTON_COLORS.red, BUTTON_COLORS.blue, BUTTON_COLORS.white, BUTTON_COLORS.gray,
     * BUTTON_COLORS.orange, BUTTON_COLORS.green */
    color: PropTypes.oneOf(Object.values(BUTTON_COLORS)),
    /** tab index number*/
    tabIndex: PropTypes.number,
    /** link */
    link: PropTypes.string,
    /** label text */
    label: PropTypes.node,
    /** set tooltip */
    tooltip: PropTypes.string,
    /** thin or not */
    thin: PropTypes.bool,
    /** disabled or not */
    disabled: PropTypes.bool,
    /** onClick function */
    onClick: PropTypes.func,
    /** class name for styling component */
    className: PropTypes.string,
  }

  static defaultProps = {
    type: BUTTON_TYPES.fill,
    color: BUTTON_COLORS.blue,
    disabled: false,
    thin: false,
    className: '',
    onClick: () => {},
  }

  render() {
    const {
      type,
      tabIndex,
      specialType,
      color,
      disabled,
      thin,
      onClick,
      className,
      link,
      dataAttributes,
    } = this.props

    const specialLabel = BUTTON_SPECIAL_ICONS[specialType]
    const label = (
      <div className={style.labelContainer}>
        {specialLabel}
        {this.props.label &&
          <div className={style.label}>
            {this.props.label}
          </div>
        }
      </div>
    )

    return (
      <div {...dataAttributes} className={classNames(
        style.root,
        className,
        style[type],
        style[color],
        specialType && style[specialType],
        thin && style.thin,
        disabled && style.disabled,
      )}>
        {!link &&
          <button {...{
            'data-cy': this.props.label,
            className: style.button,
            disabled,
            onClick: () => onClick(),
            tabIndex,
          }} >
          </button>
        }
        {link &&
          <Link {...{
            'data-cy': this.props.label,
            to: link,
            className: style.link,
            onClick: () => onClick(),
          }} />
        }
        {label}
      </div>
    )
  }
}

export {
  BUTTON_SPECIAL_TYPES,
  BUTTON_COLORS,
  BUTTON_TYPES,
} from './constants'

export default withTooltip(Button)
