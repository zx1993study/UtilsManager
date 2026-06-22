const escapeControlCharactersInStrings = (value) => {
  let result = ''
  let inString = false
  let escaped = false

  for (const char of value) {
    if (!inString) {
      result += char
      if (char === '"') {
        inString = true
      }
      continue
    }

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"') {
      result += char
      inString = false
      continue
    }

    if (char === '\n') {
      result += '\\n'
    } else if (char === '\r') {
      result += '\\r'
    } else if (char === '\t') {
      result += '\\t'
    } else if (char.charCodeAt(0) < 32) {
      result += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
    } else {
      result += char
    }
  }

  return result
}

export const parseLooseJsonObject = (value) => {
  const raw = value || '{}'
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
    throw new Error('JSON内容必须是对象')
  } catch (error) {
    const normalized = escapeControlCharactersInStrings(raw)
    const parsed = JSON.parse(normalized)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
    throw new Error('JSON内容必须是对象')
  }
}

export const normalizeJsonObject = (value) => {
  return JSON.stringify(parseLooseJsonObject(value), null, 2)
}
