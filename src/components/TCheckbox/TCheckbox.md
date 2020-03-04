TCheckbox checked example:

```js
import TCheckbox from '$trood/components/TCheckbox';

<TCheckbox {...{
  label: 'TCheckbox checked',
  value: true,
  onChange: (...args) => console.log('onChange', ...args),
  onInvalid: (...args) => console.log('onInvalid', ...args),
  onValid: (...args) => console.log('onValid', ...args),
}} />
```
TCheckbox unchecked example:

```js
import TCheckbox from '$trood/components/TCheckbox';

<TCheckbox {...{
  label: 'TCheckbox unchecked',
  value: false,
  onChange: (...args) => console.log('onChange', ...args),
  onInvalid: (...args) => console.log('onInvalid', ...args),
  onValid: (...args) => console.log('onValid', ...args),
}} />
```
