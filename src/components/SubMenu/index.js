import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'

import style from './index.css'

/**
 * Component for output sub menu.
 */

class SubMenu extends PureComponent {
  static propTypes = {
    /** class name for styling component */
    className: PropTypes.string,
    /** array with item for menu */
    items: PropTypes.arrayOf(PropTypes.object),
    /** thin or not */
    thin: PropTypes.bool,
    /** vertical or not */
    vertical: PropTypes.bool,
    /** id of selected item */
    selectedItem: PropTypes.number,
    /** onChange function */
    onChange: PropTypes.func,
  }


  render() {
    const {
      thin,
      vertical,
      items = [],
      className,
      selectedItem,
      onChange,
    } = this.props

    const currentItem = items.find(item => item.id === selectedItem)
    if (items.length < 2) return null

    return (
      <React.Fragment>
        <div className={classNames(style.root, thin && style.thin, vertical && style.vertical, className)}>
          {items.map(item => {
            if (!item) return undefined
            return (
              <div {...{
                key: item.id,
                'data-cy': item.id,
                className: classNames(style.link, item.id === selectedItem && style.active),
                onClick: () => onChange(item.id),
              }}>
                {item.label}
              </div>
            )
          })}
        </div>
        {currentItem && currentItem.content}
      </React.Fragment>
    )
  }
}

export default SubMenu
