All TIcon types:
                                      
```js
import TIcon, { ICONS_TYPES, LABEL_POSITION_TYPES } from '$trood/components/TIcon';

const wrapItemStyle = {
    "display": "flex",
    "flexDirection": "row",
    "flexWrap": "wrap",
    "justifyContent": "flex-start",
    "alignContent": "center",
    "alignItems": "center",
};
const itemStyle = {
    "width": "270px",
    "margin": "5px",
    "padding": "5px",
    "border": "1px solid #000",
};

<div style={wrapItemStyle}>
{
    Object.values(ICONS_TYPES).map(item => 
        <div style={itemStyle} key={item}>
            <TIcon {...{
              size: 25,
              label: `ICONS_TYPES.${item}`,
              labelPosition: LABEL_POSITION_TYPES.down,
              type: ICONS_TYPES[item],
            }} />
      </div>
    )
}
</div>
```


TIcon base example:
                                      
```js
import TIcon, { ICONS_TYPES } from '$trood/components/TIcon';

<TIcon {...{
  size: 18,
  type: ICONS_TYPES.edit,
  onClick: (...args) => console.log('onClick', ...args),
}} />
```
