/**
    Similar to that of tcl, can only taking one argument, keeps track of the count to be used as the
    key. Stuffs data into channel map, and ensures everything is a string.
	
    BUT, you can send in two parameters and have it use that instead of a counter.

    @param {String} str1 - This is the key if two parameters sent, if one is sent, this is the value
    @param {String} str2 - This is the value if two parametrs are sent
     
    @return {UNDEFINED} - There is no value returned
	
    Examples: 
        echo(1);                // Numbers
    	
        echo("hey");            // Strings
    	
        echo([1, 2, 3]);        // Arrays
    	
        echo({ key: "bal" });   // Objects
    	
        echo(new String(msg));  // e4x xml node (aka any java object) echo(String(msg));      // e4x xml
        node (aka any java object) echo(msg.toString());   // e4x xml node alternative (aka any java
        object), this doesnt always work
    	
        echo("myKey","myVal");	// Named item


*/

function echo(str1, str2) {

    // Optionally allow 1 or 2 args
    if (typeof str2 === "undefined") {
        // Backup str1
        str2 = str1;

        // Keep a running count for us
        str1 = $c("echoCount");
        $c("echoCount", ++str1);
    }

    // Only stringify if needed
    if (typeof str1 !== "string") { str1 = JSON.stringify(str1); }
    if (typeof str2 !== "string") { str2 = JSON.stringify(str2); }

    // Actually log what they are looking for
    $c(str1, str2);
}