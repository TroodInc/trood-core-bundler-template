DatePicker base example:

```js
import DateTimePicker, { PICKER_TYPES } from '$trood/components/DateTimePicker';

<DateTimePicker {...{
    label: 'Date',
    placeholder: 'value',
    type: PICKER_TYPES.date,
    onChange: () => console.log('onChange'),
    onInvalid: () => console.log('onInvalid'),
    onValid: () => console.log('onValid'),
}} />
```
TimePicker base example:
   
```js
import DateTimePicker, { PICKER_TYPES } from '$trood/components/DateTimePicker';

<DateTimePicker {...{
    label: 'Time',
    placeholder: 'value',
    type: PICKER_TYPES.time,
    onChange: () => console.log('onChange'),
    onInvalid: () => console.log('onInvalid'),
    onValid: () => console.log('onValid'),
}} />
```
