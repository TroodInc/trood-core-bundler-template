DotMenu base example:

```js
import DotMenu  from '$trood/components/DotMenu';

<DotMenu {...{
    size: 20,
    onOpen: (...args) => console.log('onOpen', ...args),
    onClose: (...args) => console.log('onClose', ...args),
}}>
  Some code to display menu items
</DotMenu>
```
