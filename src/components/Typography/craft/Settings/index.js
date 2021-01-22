/* eslint-disable jsx-a11y/no-onchange */
import React from 'react'
import Typography from '../../index'
import { useNode } from '@craftjs/core'
import { TCheckbox, TSelect } from '$trood/components'


const Settings = ({
  DataSelector,
}) => {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }))

  return (
    <div>
      <TSelect.default {...{
        label: 'Type',
        items: Object.keys(Typography.knownTypes).map(value => ({ value })),
        values: props.type ? [props.type] : [],
        onChange: vals => setProp((props) => {
          props.type = vals[0]
        }),
      }} />
      <TCheckbox.default {...{
        label: 'Bold',
        value: props.bold,
        onChange: value => {
          setProp((props) => {
            props.bold = value
          })
        },
      }} />
      {/*
      <DataSelector setProp={setProp} props={props} propName="value" $context={props.$context} />
      */}
    </div>
  )
}

export default Settings
