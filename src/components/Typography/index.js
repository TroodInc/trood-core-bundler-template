import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { knownTypes } from './constants'

import styles from './index.module.css'


const Typography = ({
  innerRef,
  className,
  type,
  value,
  bold,
  children,
  ...other
}) => {
  const component = knownTypes[type]
  return React.createElement(component, {
    ...other,
    ref: innerRef,
    className: classNames(className, styles[type], bold && styles.bold),
    children: children || value,
  })
}

Typography.defaultProps = {
  type: knownTypes.h1,
}

Typography.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(Object.keys(knownTypes)),
  value: PropTypes.string,
  children: PropTypes.node,
  bold: PropTypes.bool,
}

Typography.knownTypes = knownTypes

export default Typography
