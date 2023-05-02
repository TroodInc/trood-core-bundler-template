import React, { useContext } from 'react'
import classNames from 'classnames'
import TInput from '$trood/components/TInput'
import TCheckbox from '$trood/components/TCheckbox'
import DateTimePicker, { PICKER_TYPES } from '$trood/components/DateTimePicker'
import TSelect, { SELECT_TYPES } from '$trood/components/TSelect'
import modalsStyle from '$trood/styles/modals.css'
import localeService, { intlObject } from '$trood/localeService'

import { getNestedObjectField } from '$trood/helpers/nestedObjects'

export const ModalContext = React.createContext()

const validateInput = {
  required: true,
  checkOnBlur: true,
}
const validateDateTime = {
  checkOnBlur: true,
  dateRequired: false,
  timeRequired: false,
}

const ModalComponentWrapper = type => ({ className, ...props }) => {
  const {
    editMask,
    getMask,
    model,
    modelFormActions: { changeField, setFieldError, resetFieldError },
    modelErrors,
    modelName,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useContext(ModalContext)
  const { fieldName, extraModelName } = props
  const firstFieldName = Array.isArray(fieldName) ? fieldName[0] : fieldName
  if (getMask.includes(firstFieldName)) return null

  const onChange = e => changeField(fieldName, e)
  const onInvalid = errs => setFieldError(fieldName, errs)
  const onValid = () => resetFieldError(fieldName)
  const value = getNestedObjectField(model, fieldName)
  const errors = getNestedObjectField(modelErrors, fieldName)
  let { label } = props
  const lastFieldName = Array.isArray(fieldName) ? fieldName[fieldName.length - 1] : fieldName
  if (!label && localeService.entityMessages[extraModelName || modelName][lastFieldName]) {
    label = intlObject.intl.formatMessage(localeService.entityMessages[extraModelName || modelName][lastFieldName])
  }

  const commonProps = {
    label,
    disabled: editMask.includes(Array.isArray(fieldName) ? fieldName[0] : fieldName),
    className: classNames(className, modalsStyle.control),
    errors,
    onInvalid: onInvalid,
    onValid: onValid,
    onChange: onChange,
    value,
  }

  switch (type) {
    case 'input':
      return (
        <TInput
          {...{
            ...commonProps,
            validate: validateInput,
            placeholder: label,
            ...props,
          }}
        />
      )
    case 'checkbox':
      return (
        <TCheckbox
          {...{
            ...commonProps,
            ...props,
          }}
        />
      )
    case 'datetimepicker':
      return (
        <DateTimePicker
          {...{
            ...commonProps,
            type: PICKER_TYPES.dateTime,
            validate: validateDateTime,
            placeholder: label,
            ...props,
          }}
        />
      )
    case 'select':
      return (
        <TSelect
          {...{
            ...commonProps,
            value: undefined,
            // eslint-disable-next-line no-nested-ternary
            values: props.multi ? value : value ? [value] : [],
            onChange: vals => onChange(props.multi ? vals : vals[0]),
            type: SELECT_TYPES.filterDropdown,
            multi: false,
            placeHolder: intlObject.intl.formatMessage(localeService.generalMessages.notSet),
            validate: validateInput,
            ...props,
          }}
        />
      )
    default:
      return null
  }
}

export const ModalComponents = {
  ModalInput: ModalComponentWrapper('input'),
  ModalCheckbox: ModalComponentWrapper('checkbox'),
  ModalDateTimePicker: ModalComponentWrapper('datetimepicker'),
  ModalSelect: ModalComponentWrapper('select'),
}
