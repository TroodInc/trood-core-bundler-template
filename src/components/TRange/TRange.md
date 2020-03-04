TRange base example:

```js
import TRange from '$trood/components/TRange';

<TRange {...{
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 3,
    onChange: (...args) => console.log('onChange', ...args),
}} />
```
