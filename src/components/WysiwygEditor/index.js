import React, { useMemo, useCallback } from 'react'
import ReactQuill from 'react-quill'
// import debounce from 'lodash/debounce'

import MyTheme from './MyTheme/theme'

import styles from './index.css'


const Quill = ReactQuill.Quill

const Size = Quill.import('attributors/style/size')
Size.whitelist = [8, 9, 10, 11, 12, false, 16, 18, 24, 30, 36, 48, 60, 72, 96]
  .map(s => s ? `${s}px` : s)
Quill.register(Size, true)

const AlignClass = Quill.import('attributors/style/align')
Quill.register(AlignClass, true)

Quill.register({
  'themes/snow': MyTheme,
}, true)

const getImageHandler = (uploadFile) => {
  return function () {
    const { quill } = this
    const range = quill.getSelection()
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()
    input.onchange = (e) => {
      const input = e.target
      const file = (input && input.files) ? input.files[0] : null
      uploadFile(file)
        .then(({ data }) => {
          const { fileUrl } = data
          quill.insertText(range.index, '\n')
          quill.insertEmbed(range.index, 'image', fileUrl)
        })
        .catch(console.error)
    }
  }
}

const WysiwygEditor = ({
  value,
  onChange,
  placeholder,

  link = true,
  image,
  uploadFile,
  video,
}) => {
  const modules = useMemo(() => {
    const config = {
      toolbar: {},
    }
    config.toolbar.container = [
      [
        'bold',
        'italic',
        'underline',
        'strike',
        { script: 'sub'},
        { script: 'super' },
        { size: Size.whitelist },
        { list: 'ordered' },
        { list: 'bullet' },
        { align: [] },
        { color: [] },
        { background: [] },
        link && 'link',
        image && 'image',
        video && 'video',
      ].filter(Boolean),
      ['clean'],
    ]
    if (typeof uploadFile === 'function') {
      config.toolbar.handlers = {
        image: getImageHandler(uploadFile),
      }
    }
    return config
  }, [link, image, uploadFile, video])

  const handleChange = useCallback(value => {
    onChange({ target: { value } })
  }, [onChange])

  // const handleChange = useCallback(debounce(innerHandleChange, 500), [innerHandleChange])

  return <ReactQuill
    value={value}
    placeholder={placeholder}
    onChange={handleChange}
    className={styles.root}
    bounds={`.${styles.root}`}
    modules={modules}
  />
}

export default WysiwygEditor
