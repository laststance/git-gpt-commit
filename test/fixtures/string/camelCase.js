/**
 * Converts string to camel case.
 *
 * @param {string} string - The string to convert
 * @returns {string} Returns the camel cased string
 */
export function camelCase(string) {
  if (!string) {
    return ''
  }

  return string
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
}
