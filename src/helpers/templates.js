export const templateApplyValues = (template, args) => {
  const templateArray = template.split('|')
  let i = 0
  let value = ''
  while (i < templateArray.length && !value) {
    const tmpl = templateArray[i]
    value = tmpl.replace(/\{([^{}]+)}/g, (m, key) => args[key] || '').trim()
    i += 1
  }
  return value
}
