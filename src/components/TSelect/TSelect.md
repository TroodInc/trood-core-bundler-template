TSelect base example:

```js
import TSelect from '$trood/components/TSelect';

const selectItems = [
  {
    label: "label 1",
    value: "value 1",
  },
  {
    label: "label 2",
    value: "value 2",
  },
  {
    label: "label 3",
    value: "value 3",
  },
];

<TSelect {...{
    label: 'Select label',
    items: selectItems.map(item => ({ value: item.value, label: item.label })),
    onChange: (...args) => console.log('onChange', ...args),
    onAdd: (...args) => console.log('onAdd', ...args),
    onScrollToEnd: (...args) => console.log('onScrollToEnd', ...args),
    onSearch: (...args) => console.log('onSearch', ...args),
    onInvalid: (...args) => console.log('onInvalid', ...args),
    onValid: (...args) => console.log('onValid', ...args),
    onFocus: (...args) => console.log('onFocus', ...args),
    onBlur: (...args) => console.log('onBlur', ...args),
}} />
```
