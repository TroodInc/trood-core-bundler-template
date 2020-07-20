import React, { useContext } from 'react'
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

const ModalComponentWrapper = type => props => {
  const {
    editMask,
    getMask,
    model,
    modelFormActions: { changeField, setFieldError, resetFieldError },
    modelErrors,
    modelName,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useContext(ModalContext)
  const { fieldName } = props
  if (getMask.includes(Array.isArray(fieldName) ? fieldName[0] : fieldName)) return null

  const onChange = e => changeField(fieldName, e)
  const onInvalid = errs => setFieldError(fieldName, errs)
  const onValid = () => resetFieldError(fieldName)
  const value = getNestedObjectField(model, fieldName)
  const errors = getNestedObjectField(modelErrors, fieldName)
  const label = intlObject.intl.formatMessage(localeService.entityMessages[modelName][fieldName])

  const commonProps = {
    label,
    disabled: editMask.includes(Array.isArray(fieldName) ? fieldName[0] : fieldName),
    className: modalsStyle.control,
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
            ...props,
          }}
        />
      )
    case 'checkbox':
      return (
        <TCheckbox
          {...{
            ...commonProps,
            validate: validateInput,
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
            clearable: true,
            placeHolder: intlObject.intl.formatMessage(localeService.generalMessages.notSet),
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
