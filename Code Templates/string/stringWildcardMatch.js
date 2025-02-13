/**
    I hate regex, so I asked Bing to write me a js method that
    can compare strings based on wildcards. This is what it
    had to say.

    The ? matches any single character, while the * matches any 
    sequence of characters, including the empty string. For 
    example, the pattern h?ll* can match strings like hello, hell, 
    hull, hilly, etc. The pattern w*d can match strings like world, 
    wood, wad, etc. The pattern f*o can match strings like foo, 
    frodo, fido, etc. The pattern b?r can match strings like bar,
    bur, brr, etc. The pattern *z can match strings like baz, z, 
    fizz, etc. The pattern q?x* can match strings like qux, qix, 
    qax, etc.

    @param {String} str - The string we would like to compare
    @param {String} pattern - The pattern with which to compare against
    @return {Bool} return Whether there was a match or not

    echo(wildcardMatch("hello", "h?ll*")); // true
    echo(wildcardMatch("world", "w*d")); // true
    echo(wildcardMatch("foo", "f*o")); // false
    echo(wildcardMatch("bar", "b?r")); // true
    echo(wildcardMatch("baz", "*z")); // true
    echo(wildcardMatch("qux", "q?x*")); // false
*/
function stringWildcardMatch(str, pattern) {
    // base case: if both strings are empty, return true
    if (str.length === 0 && pattern.length === 0) {
        return true;
    }

    // base case: if pattern is empty, return false
    if (pattern.length === 0) {
        return false;
    }

    // if the first character of the pattern is ?, match it with any character in the string
    if (pattern[0] === "?") {
        // if the string is empty, return false
        if (str.length === 0) {
            return false;
        }
        // otherwise, recurse on the remaining parts of the string and the pattern
        return wildcardMatch(str.slice(1), pattern.slice(1));
    }

    // if the first character of the pattern is *, match it with any substring in the string
    if (pattern[0] === "*") {
        // if the string is empty, return true
        if (str.length === 0) {
            return true;
        }
        // otherwise, try to match the rest of the pattern with every possible suffix of the string
        for (let i = 0; i <= str.length; i++) {
            if (wildcardMatch(str.slice(i), pattern.slice(1))) {
                return true;
            }
        }
        // if none of them matches, return false
        return false;
    }

    // if the first characters of both strings are equal, recurse on the remaining parts
    if (str[0] === pattern[0]) {
        return wildcardMatch(str.slice(1), pattern.slice(1));
    }

    // otherwise, return false
    return false;
}
