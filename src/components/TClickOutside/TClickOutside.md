TClickOutside base example:
                                   
```js
import TClickOutside from '$trood/components/TClickOutside';

<TClickOutside {...{
  onClick: (...args) => console.log('onClick', ...args),
}}>
  some code
</TClickOutside>
```
