DateTimePicker only date example:

```js
import DateTimePicker, { PICKER_TYPES } from '$trood/components/DateTimePicker';

<DateTimePicker {...{
    label: 'Date',
    placeholder: 'value',
    type: PICKER_TYPES.date,
    onChange: (...args) => console.log('onChange', ...args),
    onInvalid: (...args) => console.log('onInvalid', ...args),
    onValid: (...args) => console.log('onValid', ...args),
}} />
```
DateTimePicker only time example:
   
```js
import DateTimePicker, { PICKER_TYPES } from '$trood/components/DateTimePicker';

<DateTimePicker {...{
    label: 'Time',
    placeholder: 'value',
    type: PICKER_TYPES.time,
    onChange: (...args) => console.log('onChange', ...args),
    onInvalid: (...args) => console.log('onInvalid', ...args),
    onValid: (...args) => console.log('onValid', ...args),
}} />
```
