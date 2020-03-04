PopupBox base example:

```js
import TIcon, { ICONS_TYPES } from '$trood/components/TIcon';
import PopupBox from '$trood/components/PopupBox';

<PopupBox {...{
  ...this.props,
  control: (
    <TIcon {...{
        size: 20,
        type: ICONS_TYPES.dotMenu,
    }} />
  ),
  onOpen: (...args) => console.log('onOpen', ...args),
  onClose: (...args) => console.log('onClose', ...args),
}} />
```
