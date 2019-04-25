import React from 'react'

const BoolDiff = ({ model, fieldName, arrowComp }) => {
  const newValue = model.diff[fieldName].update
  const prevValue = model.revision[fieldName]
  return (
    <React.Fragment>
      <div>{prevValue ? 'Да' : 'Нет'}</div>
      {arrowComp}
      <div>{newValue ? 'Да' : 'Нет'}</div>
    </React.Fragment>
  )
}

export default BoolDiff
