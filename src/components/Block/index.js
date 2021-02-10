import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import styles from './index.module.css'


const Block = (props) => {
  const {
    children,
    className,
    rounded,
    transparent,
    innerRef,
    ...other
  } = props

  return (
    <div
      {...other}
      ref={innerRef}
      className={classNames(styles.root, className, rounded && styles.rounded, transparent && styles.transparent)}
    >
      {props.children}
    </div>
  )
}

Block.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  rounded: PropTypes.bool,
  transparent: PropTypes.bool,
}

Block.defaultProps = {
  rounded: false,
  transparent: true,
}

export default Block
