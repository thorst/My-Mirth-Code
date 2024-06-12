/**
    The normal concat method for arrays will create a new varaible as its output,
    so you would need to reassign it to segList. `segList = segList.concat(myOtherArray);`

    Alternatively, if we were on a newer js you could use .push(), but that takes 1 or 
    more items to add, it cannot push an array. You would get around this by using spread
    (...) like so: `array1.push(...array2);` But spread is not available to us currently.

    However, because it was created like `seglist = m.segList`, we are simply creating a 
    reference/pointer to m.segList, and overwriting its value makes it a stand alone variable. 
    To correct this you would need to reestablish the reference by `m.segList = segList;`
    This of course isnt the end of the world, but it can be easy to forget.

    This method mutates the target array, so you dont have to have the additional step.

    If you need to insert the array of values into a specific position see: arrayMergeAtIndex()
    	
    @param {Array} targetArray - The array to which elements will be added.
    @param {Array} sourceArray - The array containing elements to be added.
    @returns {void}
    @example
    let array1 = [1, 2, 3];
    let array2 = [4, 5, 6];
    concatArrays(array1, array2);
    console.log(array1); // Output: [1, 2, 3, 4, 5, 6]
*/
function arrayConcat(targetArray, addedArray) {
    Array.prototype.push.apply(targetArray, addedArray);
}