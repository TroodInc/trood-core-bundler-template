import React from 'react'
import ReactTooltip from 'react-tooltip'
import { nanoid } from 'nanoid'

import BaseComponent from 'core/BaseComponent'
import { Component } from 'core/pageStore'

import { groupDataAndAriaAttributes } from 'helpers/react'

import styles from './index.module.css'


const getTooltip = tooltip => {
  if (typeof tooltip === 'object') {
    const componentsStore = Component.create({
      nodes: Array.isArray(tooltip) ? tooltip : [tooltip],
    })
    return <BaseComponent component={componentsStore} />
  }
  return tooltip
}

const withTooltip = WrappedComponent => {
  const Component = ({
    tooltip,
    ...other
  }) => {
    if (!tooltip) return <WrappedComponent {...other} />

    const Comp = groupDataAndAriaAttributes(WrappedComponent)
    const id = nanoid()
    return (
      <React.Fragment>
        <Comp {...other } data-tip data-for={id} />
        <ReactTooltip
          id={id}
          className={styles.root}
          delayShow={100}
          delayUpdate={100}
          delayHide={100}
          border
          borderColor="var(--trood-border)"
          backgroundColor="var(--trood-background-light)"
          textColor="var(--trood-text-gray)"
        >
          {getTooltip(tooltip)}
        </ReactTooltip>
      </React.Fragment>
    )
  }

  Component.defaultProps = WrappedComponent.defaultProps

  return Component
}

export default withTooltip
