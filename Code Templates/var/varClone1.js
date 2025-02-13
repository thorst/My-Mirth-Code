/**
    In the newest js there is a method structuredClone() https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
    but this is not available in mirth yet. There are several hacky ways to clone an object each with thier own pitfalls.
    So, I will have them all here until we can get a better way to do it.

    Im still evaluating, but currently there are 5 to choose from. some more robust than others.

    Source:
    https://stackoverflow.com/a/728694


    Other options that werent included but could be relevant:
        jquery 
        lodash
        structuredClone polyfill https://github.com/ungap/structured-clone
        ramda https://ramdajs.com/docs/#clone
        angular angular.copy(source, destination);
        angus https://github.com/angus-c/just/blob/master/packages/collection-clone/index.mjs
        sasaplus https://github.com/sasaplus1/deepcopy.js

    @param {ANY} obj - Object to clone
    @return {ANY} return a copy of the object
*/
function varClone1(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}