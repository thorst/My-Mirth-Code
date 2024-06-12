/**
    Removes whitespace from both sides of the string elements of a array
*/

/*
    The trim() method removes whitespace from both sides of a string.
    The trim() method does not change the original string.
*/
function arrayTrimItems(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] === "string") {
            arr[i] = arr[i].trim();
        }
    }
    return arr;
}