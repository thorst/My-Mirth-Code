/**
    This will generate a random integer. I think the max is exclusive.
    Meaning up to but not including that number

    @param {Number} min - Inclusive, the minimum number to return
    @param {Number} max - Exclusive, the maximum number to return
	
    @return {Number} return random integer

    Example:
    numberRandomInt() 		>> Results in a number between 1 and up to but not including 999999999999999999
    numberRandomInt(1050) 	>> Results in a number between 1050 and up to but not including 999999999999999999
    numberRandomInt(-20,1) 	>> Results in a number between -21 and up to but not including 1
*/
function numberRandomInt(min, max) {
    if (typeof min == "undefined") { min = 1; }
    if (typeof max == "undefined") { max = 999999999999999999; }

    return parseInt(Math.random() * (max - min) + min);
}