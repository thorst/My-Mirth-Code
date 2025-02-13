/**

**ESCAPES XML CHARACTERS**               

proc xml_Escape { input } {
    #&lt;
    #&amp;
    #&gt;
    #&quot;
    #&apos;
	
    return [string map {< &lt; & &amp; > &gt; \" &quot; \' &apos;} $input]
}
#

*/
function xml_Escape(input) {
    var output = stringReplaceAll(input, "<", "&lt;");

    output = stringReplaceAll(output, "&", "&amp;");
    output = stringReplaceAll(output, ">", "&gt;");
    output = stringReplaceAll(output, "\"", "&quot;");
    output = stringReplaceAll(output, "\'", "&apos;");


    return output;
}