/**
    Expects names formatted like 
	
    Returns the environment of the server your on. In ngmaintst01
    this would return "tst".

    **NOTE**: It also stuffes the houstname in the channelMap

	
    @return {String} return the environment string (tst,prd,poc)

    Example:
    let env = serverEnv();
    if (env=="tst") {
        // do something in test
    } else if (env=="poc") {
        // do something else in poc
    }
*/
// 
// returns the tst portion
function serverEnv() {
    let addr = java.net.InetAddress.getLocalHost(),
        hostname = String(addr.getHostName()),
        peices = hostname.split("."),
        env = peices[0].substr(-5, 3);
    //$c("hostname", hostname);
    return env;
}