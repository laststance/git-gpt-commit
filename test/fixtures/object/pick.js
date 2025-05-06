/**
 * Creates an object composed of the picked object properties.
 *
 * @param {Object} object - The source object
 * @param {...(string|string[])} [paths] - The property paths to pick
 * @returns {Object} Returns the new object
 */
export function pick(object, ...paths) {
  const result = {}

  if (object == null) {
    return result
  }

  const flatPaths = [].concat(...paths)

  flatPaths.forEach((path) => {
    if (path in object) {
      result[path] = object[path]
    }
  })

  return result
}
