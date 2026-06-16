module.exports = function uniTemplateExportCompatLoader(source) {
  let prefix = ''

  if (!/\brecyclableRender\b\s*=|var\s+recyclableRender\b|let\s+recyclableRender\b|const\s+recyclableRender\b/.test(source)) {
    prefix += 'var recyclableRender\n'
  }

  if (!/\bcomponents\b\s*=|var\s+components\b|let\s+components\b|const\s+components\b/.test(source)) {
    prefix += 'var components\n'
  }

  return prefix + source
}
