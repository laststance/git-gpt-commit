/**
 * Creates an array of elements split into groups the length of size.
 * If array can't be split evenly, the final chunk will be the remaining elements.
 *
 * @param {Array} array - The array to process
 * @param {number} [size=1] - The length of each chunk
 * @returns {Array} Returns the new array of chunks
 */
export function chunk(array, size = 1) {
  const length = array == null ? 0 : array.length
  if (!length || size < 1) {
    return []
  }

  const result = []
  let index = 0

  while (index < length) {
    result.push(array.slice(index, (index += size)))
  }

  return result
}
