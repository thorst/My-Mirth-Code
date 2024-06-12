/**
 * Inserts the elements of one array into another array at a specified index.
 * THIS MUTATES THE TARGET ARRAY, ENSURING THAT THE REFERENCE WAS KEPT.
 * 
 * Normally you would have something like `arr.splice(index, 0, ...elements);`
 * but we do not currently have access to the spread operator (...).
 *
 * @param {Array} targetArray - The array into which elements will be inserted.
 * @param {number} insertionIndex - The index at which to insert the elements.
 * @param {Array} arrayToInsert - The array whose elements will be inserted.
 * @returns Nothing
 *
 * @example
 * // Example usage:
 * let mainArray = [1, 2, 3, 4, 5, 7, 8];
 * let newArray = [6, 9, 10];
 * arrayMergeAtIndex(mainArray, 5, newArray);
 * console.log(mainArray); // Output: [1, 2, 3, 4, 5, 6, 9, 10, 7, 8]
 *
 * Another Example:
 * var lastNTEIdx = 8;
 * var pushNtes = ["NTE||||Test".split("|"),"NTE||||Test2".split("|")];
 * arrayMergeAtIndex(segList,lastNTEIdx+1,pushNtes);
 */
function arrayMergeAtIndex(targetArray, insertionIndex, arrayToInsert) {
    Array.prototype.splice.apply(targetArray, [insertionIndex, 0].concat(arrayToInsert));
}
