TTable base example:

```js
import TTable from '$trood/components/TTable';

const data = [
  {
    id: 1,
    name: 'box 1',
    height: 10,
    width: 25,
  },
  {
    id: 2,
    name: 'box 3',
    height: 20,
    width: 45,
  },
  {
    id: 3,
    name: 'box 4',
    height: 40,
    width: 55,
  },
];

<TTable {...{
  body: data,
  header: [
    {
      title: 'id',
      model: item => item.id,
    },
    {
      title: 'name',
      model: item => item.name,
    },
    {
      title: 'height',
      model: item => item.height,
    },
    {
      title: 'width',
      model: item => item.width,
    },
  ],
  onSort: (...args) => console.log('onSort', ...args),
  onRowClick: (...args) => console.log('onRowClick', ...args),
  onCheckedChange: (...args) => console.log('onCheckedChange', ...args),
}} />
```
