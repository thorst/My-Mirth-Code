/**
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    Source:
    https://stackoverflow.com/a/24648941

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function varClone3(o) {
    const gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o; // primitive value
    }

    var set = gdcc in o,
        cache = o[gdcc],
        result;
    if (set && typeof cache == "function") {
        return cache();
    }
    // else
    o[gdcc] = function () { return result; }; // overwrite
    if (o instanceof Array) {
        result = [];
        for (var i = 0; i < o.length; i++) {
            result[i] = cloneDR(o[i]);
        }
    } else {
        result = {};
        for (var prop in o)
            if (prop != gdcc)
                result[prop] = cloneDR(o[prop]);
            else if (set)
                result[prop] = cloneDR(cache);
    }
    if (set) {
        o[gdcc] = cache; // reset
    } else {
        delete o[gdcc]; // unset again
    }
    return result;
}