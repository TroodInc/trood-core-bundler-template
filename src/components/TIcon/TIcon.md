TIcon base example:
                                      
```js
import TIcon, { ICONS_TYPES } from '$trood/components/TIcon';
import style from './index.css';

<TIcon {...{
  size: 18,
  type: ICONS_TYPES.edit,
  className: style.matterInfoEditIcon,
  onClick: () => matterInfoEditorActions.editInlineChildEntity(model),
}} />
```
