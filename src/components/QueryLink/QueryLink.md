QueryLink base example:

```js
import QueryLink from '$trood/components/QueryLink';
import TIcon, { ICONS_TYPES } from '$trood/components/TIcon';
import { BrowserRouter as Router } from 'react-router-dom';

const to = {
    pathname: '/',
    query: {},
};

<Router>
    <QueryLink {...{ to }}>
        <TIcon {...{
          size: 15,
          type: ICONS_TYPES.mail,
        }} />
    </QueryLink>
</Router>
```
