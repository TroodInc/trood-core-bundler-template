import styles from './index.css'

export const TOOLBAR = {
  options: ['inline', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link'],
  inline: {
    className: styles.inline,
    options: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'],
    bold: { className: styles.button },
    italic: { className: styles.button },
    underline: { className: styles.button },
    strikethrough: { className: styles.button },
    superscript: { className: styles.button },
    subscript: { className: styles.button },
  },
  fontSize: {
    options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
    className: styles.dropdown,
  },
  list: {
    className: styles.inline,
    options: ['unordered', 'ordered'],
    unordered: { className: styles.button },
    ordered: { className: styles.button },
  },
  textAlign: {
    className: styles.inline,
    options: ['left', 'center', 'right', 'justify'],
    left: { className: styles.button },
    center: { className: styles.button },
    right: { className: styles.button },
    justify: { className: styles.button },
  },
  colorPicker: {
    className: styles.color,
    popupClassName: styles.colorPopup,
    colors: [
      '#fff',
      '#979696',
      '#312f2f',
      '#e4a642',
      '#e95c5c',
      '#ff00d2',
      '#4dad33',
      '#0070d2',
      '#5d00d2',
    ],
    options: ['text'],
  },
  link: {
    className: styles.inline,
    showOpenOptionOnHover: true,
    defaultTargetOption: '_self',
    options: ['link', 'unlink'],
    link: { className: styles.button },
    unlink: { className: styles.button },
  },
}