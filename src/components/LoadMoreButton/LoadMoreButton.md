LoadMoreButton base example:

```js
import LoadMoreButton  from '$trood/components/LoadMoreButton';

const isLoading = true;

<LoadMoreButton {...{
  isLoading,
  onClick: (...args) => console.log('onClick', ...args),
}} />
```
