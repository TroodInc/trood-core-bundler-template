import React, { forwardRef } from 'react'
import styled from 'styled-components'

import Context from './Context'

import Row from './Grids/Row'
import Cell from './Grids/Cell'
import Conditional from './Conditional'
import Container from './Grids/Container'

import { Link, NavLink, Switch } from 'react-router-dom'

import Block from './Block'
import Button from './Button'
import Checkbox from './Checkbox'
import DateTimePicker from './DateTimePicker'
import Icon from './Icon'
import Input from './Input'
import Label from './Label'
import List from './List'
import LoadingIndicator from './LoadingIndicator'
import Menu from './Menu'
import Modal from './Modal'
import PeriodSelector from './PeriodSelector'
import Popup from './Popup'
import RadioButton from './RadioButton'
import Range from './Range'
import Remote from './Remote'
import Route from './Route'
import Spacer from './Spacer'
import Select from './Select'
import Table from './Table'
import Typography from './Typography'

const components = {
  Context,
  Row,
  Cell,
  Conditional,
  Container,
  Link,
  NavLink,
  Switch,
  Block,
  Button,
  Checkbox,
  DateTimePicker,
  Icon,
  Input,
  Label,
  List,
  LoadingIndicator,
  Menu,
  Modal,
  PeriodSelector,
  Popup,
  RadioButton,
  Range,
  Remote,
  Route,
  Select,
  Spacer,
  Table,
  Typography,
}

export default Object.keys(components).reduce((memo, key) => {
  const Component = components[key]
  const refComponent = forwardRef((props, ref) => <Component {...props} innerRef={ref} />)
  return {
    ...memo,
    [key]: styled(refComponent)`${(props = {}) => props.style || ''}`,
  }
}, {})
