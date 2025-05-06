/**
 * Sample function
 * @param {string} name Name parameter
 * @returns {string} Greeting message
 */
function greet(name) {
  return `Hello, ${name}!`
}

/**
 * Calculate the sum of numbers
 * @param {number[]} numbers Array of numbers
 * @returns {number} Sum value
 */
function sum(numbers) {
  return numbers.reduce((total, num) => total + num, 0)
}

module.exports = {
  greet,
  sum,
}
