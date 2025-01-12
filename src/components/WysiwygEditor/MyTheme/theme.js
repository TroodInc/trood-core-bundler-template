import ReactQuill from 'react-quill'
import Tooltip from './tooltip'

const Quill = ReactQuill.Quill

const Theme = Quill.import('themes/snow')
const icons = Quill.import('ui/icons')

class MyTheme extends Theme {
  extendToolbar(toolbar) {
    toolbar.container.classList.add('ql-snow')
    this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), icons)
    this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), icons)
    this.tooltip = new Tooltip(this.quill, this.options.bounds)
    if (toolbar.container.querySelector('.ql-link')) {
      this.quill.keyboard.addBinding({ key: 'K', shortKey: true }, function(range, context) {
        toolbar.handlers['link'].call(toolbar, !context.format.link)
      })
    }
  }
}

export default MyTheme
