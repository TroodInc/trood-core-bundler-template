TButton base example:

```js
import TButton from '$trood/components/TButton';
<TButton {...{
  label: 'TButton',
  onClick: (...args) => console.log('onClick', ...args),
}} />
```

TButton red example:

```js
import TButton, { BUTTON_COLORS } from '$trood/components/TButton';
<TButton {...{
  label: 'TButton',
  color: BUTTON_COLORS.red,
  onClick: (...args) => console.log('onClick', ...args),
}} />
```
