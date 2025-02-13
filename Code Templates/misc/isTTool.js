/**
    General function to determine if you are in the testing tool in NGTools. The testing tool
    sends in a sourceMap variable 'TestConnector' set to 1 when it 'resends' a message. This
    would potentially allow you to only execute code based on if you were in the testing tool.
    Note though, if you filter it out, by returing false in your filter code, it will show in 
    NGTools that it was filtered. So that may not be what you want. I'm (Todd H.) still working 
    on how we can test better, and this is one idea on how to prevent things from going out to 
    a vendor if we are just testing

	
    @return {Bool} returns if this is the testing tool in NGTools

    Example:
    if (isTTool()) {
        // So something if its the testing tool
    }
*/
function isTTool() {
    return sourceMap.containsKey("TestConnector") && $s("TestConnector") !== "";
}