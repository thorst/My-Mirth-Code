/**
 * Checks if an object is empty.
 * @param {Object} obj - The object to be checked.
 * @returns {boolean} Returns true if the object is empty, otherwise false.
 */
function objectIsEmpty(obj) {
    for (var key in obj) {
        echo(key);
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}