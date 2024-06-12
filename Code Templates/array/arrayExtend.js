/**
    This will take an array and the desired length and ensure its that long.
    If its not that long it will pad out to the length.

    @param {Array} arr - The array in which you would like to extend
    @param {Int} len - The length you need your array to be
	
    @return {Array} return the array with the correct/desired length

    Example:
    let myArr = [1,2,3,4];
    echo(JSON.stringify(myArr)) ; >> [1,2,3,4]
    arrayExtend(myArr,5);
    echo(JSON.stringify(myArr)) ; >> [1,2,3,4,""]
*/

function arrayExtend(arr, len) {
    var currentLen = arr.length;
    if (currentLen <= len) {
        for (let i = 0; i < (len - currentLen + 1); i++) {
            arr.push("");
        }
    }
    return arr;
}