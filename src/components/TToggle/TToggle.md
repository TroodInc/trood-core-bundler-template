TToggle base example:

```js
import TToggle from '$trood/components/TToggle';

<TToggle {...{
  value: true,
  label: 'Toggle checked',
  onChange: (...args) => console.log('onChange', ...args),
  onInvalid: (...args) => console.log('onInvalid', ...args),
  onValid: (...args) => console.log('onValid', ...args),
}} />
```
TToggle base example:

```js
import TToggle from '$trood/components/TToggle';

<TToggle {...{
  value: false,
  label: 'Toggle unchecked',
  onChange: (...args) => console.log('onChange', ...args),
  onInvalid: (...args) => console.log('onInvalid', ...args),
  onValid: (...args) => console.log('onValid', ...args),
}} />
```
