/**
    Test to see if this is a non prod environment
	
    @return {Boolean} return true if this environment is NOT production

    Example:
    if (serverIsNonProd()) {
        // Do something for poc and tst
    }
*/
function serverIsNonProd() {
    let env = serverEnv();
    return env != "prd";
}