import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useNode } from '@craftjs/core'
import styles from './index.module.css'

const Block = props => {
  const {
    connectors: { connect },
  } = useNode(node => ({
    selected: node.events.selected,
  }))
  const {
    children,
    className,
    rounded = true,
    transparent = false,
    ...other
  } = props

  return (
    <div
      {...other}
      ref={connect}
      className={classNames(
        styles.root,
        className,
        rounded && styles.rounded,
        transparent && styles.transparent,
      )}
    >
      {children}
    </div>
  )
}

Block.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  rounded: PropTypes.bool,
  transparent: PropTypes.bool,
}

Block.craft = {
  displayName: 'Block',
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
}

export default Block
