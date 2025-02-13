/**
 * Checks if a value is numeric.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} Returns true if the value is numeric, otherwise false.
 * @example
 * varIsNumeric('123');    // true
 * varIsNumeric('-45.67'); // true
 * varIsNumeric('abc');    // false
 * varIsNumeric('1a');      // false
 */
function varIsNumeric(value) {
    // Use Number.isFinite to exclude NaN and Infinity
    return !isNaN(parseFloat(value)) && Number.isFinite(Number(value));
}