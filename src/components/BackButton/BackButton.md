BackButton base example:

```js
import BackButton  from '$trood/components/BackButton';
import { BrowserRouter as Router } from 'react-router-dom';

<Router>
  <BackButton {...{
  withLabel: false,
  onClick: (...args) => console.log('onClick', ...args),
}} />
</Router>
```
