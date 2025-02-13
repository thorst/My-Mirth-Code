/*
    stringRemoveNonAscii
    Removes non-asci characters from a string

    This should be a code template, but I would recomend code templates that are general
    purpose be validated through me. That said, I dont want to give the impression that
    code templates should be specific, on the contrary, where possible code templates should
    be as generic as possible, and this certainly qualifies as something people would be 
    interested in. Im unsure if this will do what you need, but it should be tested.

    @param {String} inputString - The string you want to modify
    @return {String} the modified string
*/
function stringRemoveNonAscii(inputString) {
    // Use a regular expression to match only ASCII characters
    return inputString.replace(/[^\x00-\x7F]/g, '');
}