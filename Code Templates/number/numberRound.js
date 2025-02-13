/**
    Round a number to a given set of places

    @param {Number} myNum - The number to round
    @param {Number} places - The decimals to round to
	
    @return {String} return description

    Example:
    numberRound(2.444);		>> 2.44
    numberRound(2.555);		>> 2.56
    numberRound(2.3423,3)	>> 2.342

    Changelog:
    TMH - 10/21/2022
        -Default places to 2
*/
function numberRound(myNum, places) {
    if (typeof places == "undefined") { places = 2; }
    return +(Math.round(myNum + "e+" + places) + "e-" + places);
}