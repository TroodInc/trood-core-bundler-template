import ReactQuill from 'react-quill'

const Quill = ReactQuill.Quill

const Tooltip = Quill.import('ui/tooltip')
const Keyboard = Quill.import('modules/keyboard')
const LinkBlot = Quill.import('formats/link')

const events = {
  EDITOR_CHANGE        : 'editor-change',
  SCROLL_BEFORE_UPDATE : 'scroll-before-update',
  SCROLL_OPTIMIZE      : 'scroll-optimize',
  SCROLL_UPDATE        : 'scroll-update',
  SELECTION_CHANGE     : 'selection-change',
  TEXT_CHANGE          : 'text-change',
}

const sources = {
  API    : 'api',
  SILENT : 'silent',
  USER   : 'user',
}



const toLink = (value) => {
  if (!value || /^https?:\/\//.test(value)) return value
  return `https://${value}`
}

const toVideoUrl = (value) => {
  if (!value) return value
  let url = toLink(value)

  // youtube
  let match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) ||
    url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return (match[1] || 'https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0'
  }

  // vimeo
  match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)
  if (match) {
    return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/'
  }

  // vk
  match = url.match(/^(https?:\/\/)?(www\.)?vk\.(com|ru)\/video(-?\d+)_(\d+)/) ||
    url.match(/^(https?:\/\/)?(www\.)?vk\.(com|ru)\/vkvideo\?z=video(-?\d+)_(\d+)/) ||
    url.match(/^(https?:\/\/)?(www\.)?vkvideo\.(com|ru)\/video(-?\d+)_(\d+)/) ||
    url.match(/^(https?:\/\/)?(www\.)?vkvideo\.(com|ru)\/playlist\/-?\d+_-?\d+\/video(-?\d+)_(\d+)/)
  if (match) {
    const [,,,, oid, id] = match
    return `https://vk.com/video_ext.php?oid=${oid}&id=${id}`
  }

  return url
}

class Range {
  constructor(index, length = 0) {
    this.index = index
    this.length = length
  }
}

class MyTooltip extends Tooltip {
  constructor(quill, boundsContainer) {
    super(quill, boundsContainer)
    this.textbox = this.root.querySelector('input[type="text"]')
    this.preview = this.root.querySelector('a.ql-preview')
    this.listen()
  }

  listen() {
    this.textbox.addEventListener('keydown', (event) => {
      if (Keyboard.match(event, 'enter')) {
        this.save()
        event.preventDefault()
      } else if (Keyboard.match(event, 'escape')) {
        this.cancel()
        event.preventDefault()
      }
    })
    this.root.querySelector('a.ql-action').addEventListener('click', (event) => {
      if (this.root.classList.contains('ql-editing')) {
        this.save()
      } else {
        this.edit('link', this.preview.textContent)
      }
      event.preventDefault()
    })
    this.root.querySelector('a.ql-remove').addEventListener('click', (event) => {
      if (this.linkRange != null) {
        let range = this.linkRange
        this.restoreFocus()
        this.quill.formatText(range, 'link', false, sources.USER)
        delete this.linkRange
      }
      event.preventDefault()
      this.hide()
    })
    this.quill.on(events.SELECTION_CHANGE, (range, oldRange, source) => {
      if (range == null) return
      if (range.length === 0 && source === sources.USER) {
        let [link, offset] = this.quill.scroll.descendant(LinkBlot, range.index)
        if (link != null) {
          const linkRange = new Range(range.index - offset, link.length())
          this.linkRange = linkRange
          let preview = LinkBlot.formats(link.domNode)
          this.preview.textContent = preview
          this.preview.setAttribute('href', preview)
          this.show()
          this.position(this.quill.getBounds(linkRange))
          return
        }
      } else {
        delete this.linkRange
      }
      this.hide()
    })
  }

  show() {
    super.show()
    this.root.removeAttribute('data-mode')
  }

  cancel() {
    this.hide()
  }

  edit(mode = 'link', preview = null) {
    this.root.classList.remove('ql-hidden')
    this.root.classList.add('ql-editing')
    if (preview != null) {
      this.textbox.value = preview
    } else if (mode !== this.root.getAttribute('data-mode')) {
      this.textbox.value = ''
    }
    this.position(this.quill.getBounds(this.quill.selection.savedRange))
    this.textbox.select()
    this.textbox.setAttribute('placeholder', this.textbox.getAttribute(`data-${mode}`) || '')
    this.root.setAttribute('data-mode', mode)
  }

  restoreFocus() {
    let scrollTop = this.quill.scrollingContainer.scrollTop
    this.quill.focus()
    this.quill.scrollingContainer.scrollTop = scrollTop
  }

  save() {
    let value = this.textbox.value
    switch (this.root.getAttribute('data-mode')) {
      case 'link': {
        value = toLink(value)
        let scrollTop = this.quill.root.scrollTop
        if (this.linkRange) {
          this.quill.formatText(this.linkRange, 'link', value, sources.USER)
          delete this.linkRange
        } else {
          this.restoreFocus()
          this.quill.format('link', value, sources.USER)
        }
        this.quill.root.scrollTop = scrollTop
        break
      }
      case 'video': {
        value = toVideoUrl(value)
      } // eslint-disable-next-line no-fallthrough
      case 'formula': {
        if (!value) break
        let range = this.quill.getSelection(true)
        if (range != null) {
          let index = range.index + range.length
          this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value, sources.USER)
          if (this.root.getAttribute('data-mode') === 'formula') {
            this.quill.insertText(index + 1, ' ', sources.USER)
          }
          this.quill.setSelection(index + 2, sources.USER)
        }
        break
      }
      default:
    }
    this.textbox.value = ''
    this.hide()
  }
}

MyTooltip.TEMPLATE = [
  '<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
  '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Ссылка на видео">',
  '<a class="ql-action"></a>',
  '<a class="ql-remove"></a>',
].join('')

export default MyTooltip
