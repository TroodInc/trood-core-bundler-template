TCheckbox checked example:

```js
import TCheckbox from '$trood/components/TCheckbox';

<TCheckbox {...{
  label: 'TCheckbox checked',
  value: true,
  onChange: () => console.log('onChange'),
  onInvalid: () => console.log('onInvalid'),
  onValid: () => console.log('onValid'),
}} />
```
TCheckbox unchecked example:

```js
import TCheckbox from '$trood/components/TCheckbox';

<TCheckbox {...{
  label: 'TCheckbox unchecked',
  value: false,
  onChange: () => console.log('onChange'),
  onInvalid: () => console.log('onInvalid'),
  onValid: () => console.log('onValid'),
}} />
```
