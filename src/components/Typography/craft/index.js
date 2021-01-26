import React from 'react'
import { useNode } from '@craftjs/core'
import classNames from 'classnames'

import Settings from './Settings'
import Typography from '../index'

import EditWrapper from '../../internal/EditWrapper'

import styles from '../index.module.css'


const CraftTypography = props => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode((node) => ({ props: node.data.props }))

  return (
    <EditWrapper {...{
      innerRef: ref => connect(drag(ref)),
      onChange: e => setProp(props => props.value = e.target.value.replace(/<\/?[^>]+(>|$)/g, '')),
      text: props.value,
      tagName: Typography.knownTypes[props.type],
      className: classNames(styles[props.type], props.bold && styles.bold),
    }}>
      <Typography {...props} />
    </EditWrapper>
  )
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
