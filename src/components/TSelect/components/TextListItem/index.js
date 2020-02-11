import React from 'react'
import classNames from 'classnames'

import style from './index.css'


const TextListItem = ({
  className,
  value,
  label,
  disabled,
  onChange,
}) => {
  return (
    <div {...{
      className: classNames(style.root, className, value && style.selected, disabled && style.disabled),
      onClick: disabled ? undefined : () => onChange(),
    }}>
      {label}
    </div>
  )
}

export default TextListItem
