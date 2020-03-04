TInput base example:

```js
import TInput from '$trood/components/TInput';

<TInput {...{
    label: 'Input',
    placeholder: 'put the text',
    onEnter: () => console.log('onEnter'),
    onSearch: () => console.log('onSearch'),
    onInvalid: () => console.log('onInvalid'),
    onValid: () => console.log('onValid'),
    onFocus: () => console.log('onFocus'),
    onBlur: () => console.log('onBlur'),
    onChange: () => console.log('onChange'),
}} />
```
