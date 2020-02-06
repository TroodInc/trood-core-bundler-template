import React from 'react'
import TButton, { BUTTON_COLORS } from './index'


export default {
  title: 'TButton',
  component: TButton,
}

export const base = () => <TButton label="TButton" />

export const redButton = () => <TButton label="TButton" color={BUTTON_COLORS.red} />
