TRadioButton base example:

```js
import TRadioButton from '$trood/components/TRadioButton';

<TRadioButton {...{
    label: 'Radio unchecked',
    onChange: () => console.log('onChange'),
    onInvalid: () => console.log('onInvalid'),
    onValid: () => console.log('onValid'),
}} />
```
TRadioButton base example:

```js
import TRadioButton from '$trood/components/TRadioButton';

<TRadioButton {...{
    label: 'Radio checked',
    value: true,
    onChange: () => console.log('onChange'),
    onInvalid: () => console.log('onInvalid'),
    onValid: () => console.log('onValid'),
}} />
```
