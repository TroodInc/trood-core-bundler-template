TCurrency base example:
                                   
```js
import TCurrency from '$trood/components/TCurrency';

<TCurrency value={ 2000 } />
```
TCurrency base usd:
                                   
```js
import TCurrency, { CURRENCY_CODES } from '$trood/components/TCurrency';

<TCurrency value={ 2000 } currency={ CURRENCY_CODES.usd } />
```
