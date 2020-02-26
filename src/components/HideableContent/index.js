import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import TIcon, {ICONS_TYPES, ROTATE_TYPES} from '../TIcon'

import style from './index.css'

/**
 * Component for output hideable content.
 */

class HideableContent extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.node,
    /** title for component */
    title: PropTypes.string,
    /** children node */
    children: PropTypes.node,
    /** open or not */
    open: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
    }

    this.toggelOpen = () => this.setState({ open: !this.state.open })
  }

  render() {
    const { open } = this.state
    const { title, className, children } = this.props

    return (
      <div className={classNames(style.root, className)}>
        <div className={style.header} onClick={this.toggelOpen}>
          <div className={style.title}>{title}</div>
          <TIcon {...{
            className: style.arrow,
            type: ICONS_TYPES.arrow,
            size: 20,
            rotate: open ? ROTATE_TYPES.down : ROTATE_TYPES.up,
          }} />
        </div>
        <div className={classNames(style.content, open && style.contentOpen)}>
          {children}
        </div>
      </div>
    )
  }
}

export default HideableContent
