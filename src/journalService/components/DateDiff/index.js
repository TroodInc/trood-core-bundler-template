import React from 'react'

import SmartDate from '$trood/components/SmartDate'

const DateDiff = ({
  model,
  fieldName,
  arrowComp,
  ...other
}) => {
  const newValue = model.diff[fieldName].update
  const prevValue = model.revision[fieldName]
  return (
    <React.Fragment>
      <SmartDate {...{
        ...other,
        date: prevValue,
      }} />
      {arrowComp}
      <SmartDate {...{
        ...other,
        date: newValue,
      }} />
    </React.Fragment>
  )
}

export default DateDiff
