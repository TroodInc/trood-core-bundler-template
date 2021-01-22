import React from 'react'
import Typography from '../index'
import Settings from './Settings'
import { useNode } from '@craftjs/core'


const CraftTypography = (props) => {
  const { connectors: { connect, drag } } = useNode()
  return <Typography {...props} innerRef={dom => connect(drag(dom))} />
}

CraftTypography.craft = {
  displayName: 'Typography',
  related: {
    settings: Settings,
  },
  props: {
    ...Typography.defaultProps,
    value: 'Typography',
  },
}

export default CraftTypography
