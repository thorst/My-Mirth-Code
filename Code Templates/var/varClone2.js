/**
    In the newest js there is a method structuredClone() https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
    but this is not available in mirth yet. There are several hacky ways to clone an object each with thier own pitfalls.
    So, I will have them all here until we can get a better way to do it.

    Source:
    https://stackoverflow.com/a/10869248


    @param {ANY} obj - Object to clone
    @return {ANY} return a copy of the object
*/
function varClone2(obj) {
    return JSON.parse(JSON.stringify(obj));
}