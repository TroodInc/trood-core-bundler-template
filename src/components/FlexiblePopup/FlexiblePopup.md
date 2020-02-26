FlexiblePopup base example:

```js
import FlexiblePopup  from '$trood/components/FlexiblePopup';

/*
toggleOpen(open) {
    let newOpen = open
    const oldOpen = this.state.open
    if (newOpen === undefined) {
      newOpen = !oldOpen
    }
    this.setState({
      open: newOpen,
    })
    if (oldOpen !== newOpen) {
      if (newOpen) {
        this.props.onOpen()
      } else {
        this.props.onClose()
      }
    }
}
*/

<FlexiblePopup {...{
  //position: arrow && position,
  // onClose: () => this.toggleOpen(false),
}}>
  some code to output children
</FlexiblePopup>
```
