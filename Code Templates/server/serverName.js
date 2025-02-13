/**
    This gives you the servername you are currently on.
    Normally you would get 
    you range the java code, but this removes the domain.

    @return {String} return the server name

    Example:
    let servername = serverName();	>> 
*/
function serverName() {
    let addr = java.net.InetAddress.getLocalHost(),
        hostname = String(addr.getHostName());
    return hostname.split(".")[0];;
}