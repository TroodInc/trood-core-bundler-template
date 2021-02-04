/* eslint-disable jsx-a11y/no-onchange */
import React from 'react'
import { useNode } from '@craftjs/core'
import { TCheckbox, TSelect, TInput } from '$trood/components'

import { BUTTON_TYPES, BUTTON_SPECIAL_TYPES, BUTTON_COLORS } from '../../constants'

import styles from './index.module.css'


const Settings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }))

  const selectProps = ({ label, key, items }) => ({
    label,
    items,
    values: props[key] ? [props[key]] : [],
    onChange: vals => setProp((props) => props[key] = vals[0]),
  })

  const checkboxProps = ({ label, key }) => ({
    label,
    value: props[key],
    onChange: value => setProp((props) => props[key] = value),
  })

  const inputProps = ({ label, key, type }) => ({
    label,
    type,
    value: props[key],
    onChange: value => setProp((props) => props[key] = value),
  })

  return (
    <div className={styles.root}>
      <TInput.default {...{
        ...inputProps({
          label: 'Label',
          key: 'label',
        }),
      }} />
      <TSelect.default {...{
        ...selectProps({
          label: 'Type',
          key: 'type',
          items: Object.values(BUTTON_TYPES).map(value => ({ value })),
        }),
      }} />
      <TSelect.default {...{
        ...selectProps({
          label: 'Special Type',
          key: 'specialType',
          items: Object.values(BUTTON_SPECIAL_TYPES).map(value => ({ value })),
          clearable: true,
        }),
      }} />
      <TSelect.default {...{
        ...selectProps({
          label: 'Color',
          key: 'color',
          items: Object.values(BUTTON_COLORS).map(value => ({ value })),
        }),
      }} />
      <TCheckbox.default {...{
        ...checkboxProps({
          label: 'Thin',
          key: 'thin',
        }),
      }} />
      <TCheckbox.default {...{
        ...checkboxProps({
          label: 'Disabled',
          key: 'disabled',
        }),
      }} />
      <TInput.default {...{
        ...inputProps({
          label: 'Tab Index',
          type: 'int',
          key: 'tabIndex',
        }),
      }} />
      <TInput.default {...{
        ...inputProps({
          label: 'Link address',
          type: 'url',
          key: 'link',
        }),
      }} />
      <TInput.default {...{
        ...inputProps({
          label: 'Tooltip',
          key: 'tooltip',
        }),
      }} />
    </div>
  )
}

export default Settings
