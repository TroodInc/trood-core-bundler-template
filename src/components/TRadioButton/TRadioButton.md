TRadioButton base example:

```js
import TRadioButton from '$trood/components/TRadioButton';

<TRadioButton {...{
    label: 'Radio unchecked',
    onChange: (...args) => console.log('onChange', ...args),
    onInvalid: (...args) => console.log('onInvalid', ...args),
    onValid: (...args) => console.log('onValid', ...args),
}} />
```
TRadioButton base example:

```js
import TRadioButton from '$trood/components/TRadioButton';

<TRadioButton {...{
    label: 'Radio checked',
    value: true,
    onChange: (...args) => console.log('onChange', ...args),
    onInvalid: (...args) => console.log('onInvalid', ...args),
    onValid: (...args) => console.log('onValid', ...args),
}} />
```
