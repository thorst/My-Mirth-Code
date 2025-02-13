/**
 * Checks if a given value is null, undefined, or an empty string.
 *
 * @param {string|null|undefined} value - The value to check.
 * @returns {boolean} - Returns true if the value is null, undefined, or an empty string; otherwise, false.
 */
function varIsNullOrEmpty(value) {
    return value === null || value === undefined || value.trim().length === 0;
}