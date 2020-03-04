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
    onChange: () => console.log('onChange'),
    onAdd: () => console.log('onAdd'),
    onScrollToEnd: () => console.log('onScrollToEnd'),
    onSearch: () => console.log('onSearch'),
    onInvalid: () => console.log('onInvalid'),
    onValid: () => console.log('onValid'),
    onFocus: () => console.log('onFocus'),
    onBlur: () => console.log('onBlur'),
}} />
```
