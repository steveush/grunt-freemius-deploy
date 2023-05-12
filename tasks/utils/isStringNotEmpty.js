const isEmptyString = /^\s*$/;
/**
 * Check if the value is a string and is not empty.
 * @param {*} value
 * @returns {boolean}
 */
const isStringNotEmpty = value => value != null && typeof value === 'string' && !isEmptyString.test(value);

module.exports = isStringNotEmpty;