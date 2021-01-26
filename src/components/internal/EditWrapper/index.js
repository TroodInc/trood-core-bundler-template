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
    <div ref={innerRef}>
      {isEditing
        ? (
          <ContentEditable
            html={text}
            onChange={onChange}
            onMouseLeave={() => setIsEditing(false)}
            tagName={tagName}
            className={className}
          />
        )
        : (
          React.cloneElement(children, {
            onMouseEnter: () => setIsEditing(true),
          })
        )}
    </div>
  )
}

export default EditWrapper
