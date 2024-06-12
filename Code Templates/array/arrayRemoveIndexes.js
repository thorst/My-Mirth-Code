/**
    This will take an array and remove the required indexes.

    @param {Array} arr - Array of data
    @param {Array} indexes - Array of indexes to remove from arr
    @return {Array} - Returns original array with removed indexes
*/
function arrayRemoveIndexes(arr, indexes) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (indexes.indexOf(i) >= 0) {
            arr.splice(i, 1);
        }
    }
    return arr;
}