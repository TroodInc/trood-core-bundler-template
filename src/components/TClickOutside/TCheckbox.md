TClickOutside base example:
                                   
```js
import TClickOutside from '$trood/components/TClickOutside';

const onClose = () => {console.log('test')};

<TClickOutside onClick={onClose}>
  <div>
    some code
  </div>
</TClickOutside>
```
