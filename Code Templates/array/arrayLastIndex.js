/**


--- This is part of core js, but not the version we have ---
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf#:~:text=Array.-,prototype.,if%20it%20is%20not%20present.
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    @param {String} arg1 - arg1 description
    @return {String} return description
*/

function arrayLastIndex(arr, cond) {
    if (!arr.length) return -1;
    if (!cond) return arr.length - 1;

    for (var i = arr.length - 1; i >= 0; --i) {
        if (cond(arr[i])) return i;
    }

    return -1;
}

