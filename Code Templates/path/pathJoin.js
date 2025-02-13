/*
    pathJoin - Join parts of a path, automatically removing redundant slashes,
    . or .., or trailing slashes.
    
    Examples:
        var o = pathJoin(["1","/3","5"]);                   // 	/1/3/5
        echo(o);
        var o = pathJoin(["c:","/3","5/"],{windows:true});  // c:\3\5
        echo(o);
        var o = pathJoin(["1","/3","5"],{addTrailing:true});// /1/3/5/
        echo(o);
        var o = pathJoin(["1","3","5","/"]);                // /1/3/5
        echo(o);
        var o = pathJoin(["1","3",".","5","/"]);            // /1/3/5
        echo(o);
        var o = pathJoin(["1","3","..","5","/"]);           // /1/5
        echo(o);
    
    @param {Array} parts - A js array of the parts to join
    @param {Object} settings - A js object of settings
    @param {boolean} settings.windows - Optional - Default:false - If windows use \ if not use / and make sure we start with a /
    @param {boolean} settings.addTrailing - Optional - Default:false - If false, no trailing slash will be added
    @return {String} return description
	
    Change Log:
        2024-06-20 - TMH
            -Initial version
*/
function pathJoin(parts, settings) {
    settings = Object.assign({}, {
        windows: false, // False for Unix-like paths (start with / and be / not \)
        addTrailing: false,
    }, settings);

    // Use Java's Paths class to join parts and normalize the path
    var path = java.nio.file.Paths.get("", parts).normalize().toString();

    // Determine the correct separator based on the settings
    var separator = settings.windows ? '\\' : '/';

    // If the system is Unix-like and the path does not start with '/', add it
    if (!settings.windows && !path.startsWith("/")) {
        path = "/" + path;
    }

    // Convert separators if necessary
    if (settings.windows) {
        path = String(path).replace(/\//g, separator);
    }

    // Handle addTrailing settings
    if (settings.addTrailing && !path.endsWith(separator)) {
        path = path + separator;
    }

    return path;
}