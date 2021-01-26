import React, { useState } from 'react'
import ContentEditable from 'react-contenteditable'


const EditWrapper = ({
  children,

  innerRef,
  text,
  tagName,
  className,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div {...{
      ref: innerRef,
      onMouseLeave: () => setIsEditing(false),
      onMouseEnter: () => setIsEditing(true),
    }}>
      {isEditing
        ? (
          <ContentEditable
            html={text}
            onChange={onChange}
            tagName={tagName}
            className={className}
          />
        )
        : children}
    </div>
  )
}

export default EditWrapper
