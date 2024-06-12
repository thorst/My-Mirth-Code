/**
 * Removes duplicate values from an array.
 * Written by chatgpt.
 *
 * @param {Array} originalArray - The array with potential duplicate values.
 * @returns {Array} A new array containing only unique values from the original array.
 */
function arrayUniq(originalArray) {
    const uniqueArray = [];

    for (let value of originalArray) {
        if (!uniqueArray.includes(value)) {
            uniqueArray.push(value);
        }
    }

    return uniqueArray;
}