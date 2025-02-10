# APIs

Curerntly I have one channel that is a http listener. In the source filter i have the below code. What this will do is take the url path and determine the destination OF THE SAME NAME to be called. 
Whatever the destination sticks in the response, is what is returned to the caller.

```javascript
// Init
responseMap.put('processedResponse', "");

var msg = XML(connectorMessage.getRawData());
var rest = msg['RequestContextPath'];
var myServicePrefix = 'wapi';
var params = rest.substring(myServicePrefix.length).split('/');
var mrn = params[1];

// Mirth puts the query parameters in the source map already

// Make it easy to grab the body, currently its not in the source map
$c("body",String(msg["Content"]));


// THIS IS OLD CODE AND SHOULD NOT BE USED GOING FURTHER
// We accept two kinds of parameters (but currently not both)
// Either in the content portion of the message or in the parameter portion
if (String(msg["Parameters"].content)!="") {
    $c("parameters",String(msg["Parameters"].content));    
} else if (String(msg["Content"])!="") {
    $c("parameters",String(msg["Content"]));  
}


// Only send to that destination
// documentation says it returns true if at least one was removed
// this may not work
if (destinationSet.removeAllExcept(mrn)) {
	return true;
}



return false;
```