/**
    Method to generate a random string of random length.
    Includes both numbers and letters. If you want just 
    numbers see numberRandom. Can also look at stringGuid.
    This is not meant to randomly generate a secure string.
    AKA dont use for password salting etc. Use soemthing like
    crypto.getRandomValues in that case.

    @param {Integer} length - Required - Length of string to generate
    @param {Object} param - Optional - Object with values 
    @param {String} param.characters - Optional - The characters to use to generate the string. If valued, will supercede all other character settings
    @param {String} param.includeSpecial - Optional - Default: False - Should the list of avaible characters include special characters
    @param {String} param.includeUpper - Optional -  Default: True - Should the list of avaible characters include uppercase letters
    @param {String} param.includeNumbers - Optional - Default: True - Should the list of avaible characters include number
    @param {String} param.includeLower - Optional -  Default: True - Should the list of avaible characters include lowercase letters
	
    @return {String} returns RandomString

    Based on: https://stackoverflow.com/a/1349426

    Examples:
        stringRandom(12); ================================>  EkfHRBYPceBW
        stringRandom(12,{includeSpecial:true}); ==========>  /?63$l&gt;@s=g=
        stringRandom(12,{characters:"qwerty"}); ==========>  qteqrtrrtwqq

    Revision History:
    07/18/2023 - TMH
        -Initial Version
        -Added ability to build charset with booleans, including special chars
        -Added ability to override charset with any charset
        -Removed Math.Floor()
	
*/
function stringRandom(length, param) {

    // Populate param with default values
    param = Object.assign({
        includeSpecial: false,
        includeUpper: true,
        includeNumbers: true,
        includeLower: true,
        characters: ""
    }, param);

    // Build character set
    let characters = '';
    if (param.includeSpecial) {
        characters += "!@#$%^&*()-_=+`~/?,<.>;:";
    }
    if (param.includeUpper) {
        characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (param.includeNumbers) {
        characters += "0123456789";
    }
    if (param.includeLower) {
        characters += "abcdefghijklmnopqrstuvwxyz";
    }

    // If they override, just overwrite
    if (param.characters) {
        characters = param.characters;
    }


    let result = '',
        charactersLength = characters.length,
        counter = 0;

    // Loop correct number of times and pull the value
    while (counter < length) {
        result += characters.charAt(Math.random() * charactersLength);
        counter += 1;
    }

    // Return
    return result;
}