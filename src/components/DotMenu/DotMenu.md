DotMenu base example:

```js
import DotMenu  from '$trood/components/DotMenu';

<DotMenu {...{
    size: 20,
    onOpen: () => console.log('onOpen'),
    onClose: () => console.log('onClose'),
}}>
  Some code to display menu items
</DotMenu>
```
