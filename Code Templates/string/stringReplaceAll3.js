/**
 * Replaces all occurrences of a substring in a given string.
 * This uses just javacscript, but uses split and join function (arrays)
 * to remove a substring. This can be slower on very large strings,
 * but otherwise (even an entire hl7 message if fine) this is performant
 * and very common[place in js.
 *
 * Its up in the air (aka havent tested yet) whether stringReplaceAll2 or stringReplaceAll3
 * would be slower, aka is getting into java slower, or creating an array slower. 
 *
 * @param {string} inputString - The original string.
 * @param {string} search - The substring to search for.
 * @param {string} replacement - The string to replace the 'search' substring with.
 * @returns {string} The modified string with all occurrences replaced.
 *
 * @example
 * const originalString = "Hello, world! Hello, universe!";
 * const searchString = "Hello";
 * const replacementString = "Hi";
 * const modifiedString = stringReplaceAll3(originalString, searchString, replacementString);
 * console.log(modifiedString);
 */
function stringReplaceAll3(inputString, search, replacement) {
    if (typeof inputString == "undefined" || inputString == "") {
        return inputString;
    }

    return inputString.split(search).join(replacement);
}