/**
    stringReplaceAll
    This is a shim, aka how javascript defined the .replaceAll() funciton in core 
    javascripot in the newest versions of ECMAscript. It can do regex or regular strings.
	
---  this part of core js, just not our version ---

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll


 * String.prototype.replaceAll() polyfill
 * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
 * https://vanillajstoolkit.com/polyfills/stringreplaceall/
 * @author Chris Ferdinandi
 * @license MIT
 */
function stringReplaceAll(myStr, str, newStr) {
    if (typeof myStr == "undefined" || myStr == "") {
        return myStr;
    }

    // If a regex pattern
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
        return myStr.replace(str, newStr);
    }

    // If a string
    return myStr.replace(new RegExp(str, 'g'), newStr);

};

