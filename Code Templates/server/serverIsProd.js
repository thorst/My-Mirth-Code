/**
    Test to see if this is a prod environment
	
    @return {Boolean} return true if this environment is production

    Example:
    if (serverIsNonProd()) {
        // Do something for prod
    }
*/
function serverIsProd() {
    let env = serverEnv();
    return env == "prd";
}