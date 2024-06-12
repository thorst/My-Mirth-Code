/**


--- This is part of core js, but not the version we have ---

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex



Mimic this functionality but return multiple

@param {String} arg1 - arg1 description
@return {String} return description
*/

function arrayFindIndexes(arr, predicate) {

    let len = arr.length >>> 0,
        thisArg = arguments[1];
    var k = 0;
    var l = [];
    while (k < len) {
        var kValue = arr[k];
        if (predicate.call(thisArg, kValue, k, arr)) {
            l.push(k);
        }
        k++;

    }

    return l;
}
