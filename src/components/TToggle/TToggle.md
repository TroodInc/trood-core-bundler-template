TToggle base example:

```js
import TToggle from '$trood/components/TToggle';

<TToggle {...{
  value: true,
  label: 'Toggle checked',
  onChange: () => console.log('onChange'),
  onInvalid: () => console.log('onInvalid'),
  onValid: () => console.log('onValid'),
}} />
```
TToggle base example:

```js
import TToggle from '$trood/components/TToggle';

<TToggle {...{
  value: false,
  label: 'Toggle unchecked',
  onChange: () => console.log('onChange'),
  onInvalid: () => console.log('onInvalid'),
  onValid: () => console.log('onValid'),
}} />
```
