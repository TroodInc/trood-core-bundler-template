SubMenu base example:

```js
import SubMenu from '$trood/components/SubMenu';

const itemsMenu = [
    {
      id: 1,
      label: 'item 1', 
    },
    {
      id: 2,
      label: 'item 2', 
    },
    {
      id: 3,
      label: 'item 3', 
    },
];

<SubMenu {...{
  vertical: true,
  items: itemsMenu,
  selectedItem: 2,
}} />
```
