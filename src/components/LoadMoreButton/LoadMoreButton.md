LoadMoreButton base example:

```js
import LoadMoreButton  from '$trood/components/LoadMoreButton';

const nextPage = 2;
const isLoading = true;

<LoadMoreButton {...{
  isLoading,
  // onClick: () => {nextPageAction()}, // Action for load next page
}} />
```
