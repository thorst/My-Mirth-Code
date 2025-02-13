/**
    This is an attempt at making a generic, fully featured, http proc for 
    mirth.
	
    By default this proc will loop until it gets a response code of
    less than 400. The theory here is that, if you have everything set
    correctly, that we dont want to proceed until the service call is
    successfully made. If I were to error out transactions, it just means youll 
    need to	resend them, and data could be out of order. Things like a momentary
    downtime will, with a loop, resolve and catch up once the service is back 
    up. There may be instances where you want to make a BEST-EFFORT call,
    but the transmission of the message isnt dependent on a successful call.
    In this instance, you would set param.loop=false. This will stop it from
    ever looping.
	
    In test, looping is disabled by default. This is because I dont want to
    slow your development down. If you just put in a wrong url, you dont want
    to cause an infinite loop just to find that out. So if the execution fails,
    or the status code is >400, itll return response.successful=false. 
    You can force it to loop, to test how it would function in production by 
    changing param.isProd=true.
	
    If you find yourself in a situation where in production, your channel is 
    stuck in an infinite loop that requires a code change (service changed urls,
    or password or username change), instead of simply being a server downtime, 
    you will need to halt the channel, change your code, deploy the change, and 
    any existing messages will use your new code.
	
    Note, just because a service was successfully called doesnt mean that 
    the service completed any actions correctly as far as your concerned. 
    So you will want to check to see if the response object has the successful property
    set to true. THEN, interrogate the response to check for a valid response.
    Basically, the service could have handled the error and returned that it
    couldnt complete it internally, but the payload is valid, and a status code
    of 200. This is often how I (todd) write my services. For an example of this
    look at the WEL call below.

	

    @param {String} url - The url you would like to call
    @param {Object} param - An object with additional optional parameters
    @param {String} param.method - Default: "GET" - Also supports "POST" - case sensitive
    @param {Object} param.headers - Default: {} - A Key:Value set of headers to send with request
    @param {String} param.payload - Default: "" - If POST method, data to be sent
    @param {Boolean} param.isProd - Default: serverIsProd() - This will be based on your env, but you can override, if you'd like to test how looping wpuld function in prod
    @param {Boolean} param.loop - Default: true - This will loop (ONLY IN PROD) continuously to ensure you get the data you need
    @param {String} param.responseEncoding - Default: "UTF-8" - How do we want to encode the result
        
        
    @return {Object} return response
        {Boolean} successful - Whether the call was successful from a client perspective
        {String} error - The error message, if one was caught
        {Object) json - Will attempt to parse the response into a js object
        {String} response - The unparsed response
        {Number? or String, Not sure} - statusCode - The status code returned by the server
        
    Change Log==================================================================
    2023-08-02 - Todd Horst 
        - Initial Version
    2024-05-16 - Todd Horst
        - Wasnt properly exiting the loop, i gave it a label, and if it makes it
            to the end of the code, we break that label.
        - Added timeout code
        
    Examples====================================================================
	
    1. Basic get with JSON response:
	
        var x = httpClient("https://api.publicapis.org/entries");
        echo(x);
        echo(x.json);
        echo(x.json.count);
        
    2. Calling WAPI, though you should never do this. Please call
        java methods directly. If needed pull code out of WAPI
        and put into a code template and make both places call 
        that:
        
        var un = "admin";
        var pw = "";
        var auth = "Basic " + stringBaseEncode(un + ":" + pw);
        var headers = {
            "X-Requested-With" : "XMLHttpRequest",
            "Authorization" : auth
        };
        
        var x = httpClient("https://server:8443/api/channels/8b4ea453-8590-4fb7-ad50-ba53cb216bc6",{headers:headers});
        echo(x.successful);
        echo(x.error);
        echo(x.response);
       
    3. Post data to cloverleaf wapi service to get recover db 
        count of _other01:
	
        var payload = {
            site: "_other01",
            db: "r" // or e
        };
        var x = httpClient("https://server:15047/wellspan/api/?dbCount", {
            method: "POST",
            payload: JSON.stringify(payload)
        });
        echo("successful",x.successful);
        echo("error",x.error);
        echo("response",x.response);
        // This service returns error messages based
        // In this case we dont really need to pass data
        // If we dont itll error, if we do, itll return a count
        echo("messageError",stringBaseDecode(x.json.error));
        echo("messageCount",x.json.count);
        echo("messageDB",x.json.db);
        
    4. Post to i2i to get token:
        var headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        
        // Create our own array and join it
        var payload = [
            "client_id=",
            "client_secret=",
            "Resource=",
            "grant_type=client_credentials"
        ];
        echo("payload",payload.join("&"));
        
        // OR
        // Create an object and use httpFormUrlEncoded
        var payload2 = {
            "client_id":"",
            "client_secret":"",
            "Resource":"",
            "grant_type":"client_credentials"
        };
        echo("payload2",httpFormUrlEncoded(payload2));
        
        var url = "";
        var x = httpClient(url, {
            method: "POST",
            headers: headers,
            payload: payload.join("&")
        });
        echo(x.response);
        echo("Token",x.json.access_token);
        
    5. WEL Lookup (with error checking):
    
        var url = "";
        var x = httpClient(url);
    
        // If the service call was successful
        if (x.successful) {
            echo(x.response);
            
            // Confirm json was parsed successfully
            if (typeof x.json != "undefined") {
                var result = x.json.Results;
    
                // Verify there are matches found in the patient list
                if (result.length > 0) {
                    var top = result[0];
                    var person = top.Person;
                    echo("Name:", person.FirstName + " " + person.LastName);
                } else {
                    //You will want to handle this in some way
                    //Appropriate to the context of your script
                    echo(" MRN  Not Found");
                }
            } else {
                echo("Bad JSON");
            }
    
        }

        
    6. Valid Domain, Wrong endpoint:
    
        //This returns a 404
        var x = httpClient("https://api.publicapis.org/ThisApiDoesntExistTryAgain");
        echo(x);
        echo("statusCode",x.statusCode);
        if (!x.successful) {
            echo("The call wasnt successful");
        }
     
    7. Invalid Domain Error, doesnt return any status code:
    
        var x = httpClient("https://api.ThisURLdoesntExistAndYouShouldDoubleCheckYourSettings.org/entries");
        echo(x);
        echo("statusCode",x.statusCode);
        if (!x.successful) {
            echo("The call wasnt successful");
        }
    
    Other Resources=============================================================
        https://www.tabnine.com/code/java/methods/org.apache.http.client.methods.HttpPost/setEntity
*/

// Packages required to work
// On one hand, every thread will now have these packages included
// On the other hand, its only called once per deploy I beleive
importPackage(Packages.org.apache.http.client);
importPackage(Packages.org.apache.http.client.methods);
importPackage(Packages.org.apache.http.impl.client);
importPackage(Packages.org.apache.http.message);
importPackage(Packages.org.apache.http.client.entity);
importPackage(Packages.org.apache.http.entity);
importPackage(Packages.org.apache.http.util);
importPackage(Packages.org.apache.http.ssl);
importPackage(Packages.org.apache.http.conn.ssl);
importPackage(Packages.org.apache.http.client.config);

function httpClient(url, param) {

    // Define default parameters
    param = Object.assign({}, {
        method: "GET",
        headers: {},
        payload: "",
        isProd: serverIsProd(),
        loop: true,
        responseEncoding: "UTF-8",
        timeout: 5000, // Default timeout in milliseconds
        validateStatusCode: true,
    }, param);


    // Initialize Reply
    var reply = {};
    reply.error = "";
    reply.successful = true;

    // Start client, this ssl stuff is from the get proc
    var httpclient = HttpClients.custom()
        .setDefaultRequestConfig(RequestConfig.custom()
            .setConnectTimeout(param.timeout)
            .setConnectionRequestTimeout(param.timeout)
            .setSocketTimeout(param.timeout)
            .build())
        .setSSLContext(new org.apache.http.ssl.SSLContextBuilder()
            .loadTrustMaterial(null, TrustAllStrategy.INSTANCE).build())
        .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE).build();

    // Determine type of request to start, based on method
    var requestSettings = null;
    if (param.method == "GET") {
        requestSettings = new HttpGet(url);
    } else if (param.method == "POST") {
        requestSettings = new HttpPost(url);
        requestSettings.setEntity(new StringEntity(param.payload));
    }

    // Set any headers
    if (Object.keys(param.headers).length > 0) {
        const headerKeys = Object.keys(param.headers);
        headerKeys.forEach((key, index) => {
            requestSettings.setHeader(key, param.headers[key]);
        });
    }


    let request = "";
    try {
        // Execute at least once
        doLoop: do {
            // Execute request
            try {
                request = httpclient.execute(requestSettings);
            } catch (executError) {
                // Executing failed, restart
                if (param.isProd && param.loop) {
                    continue;
                } else {
                    throw (executError);
                }
            }

            // If status code isnt 200 basically (300 are redirect, not sure about them yet)
            // then restart
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
            reply.statusCode = request.getStatusLine().getStatusCode();
            if (param.validateStatusCode && reply.statusCode >= 400 && param.isProd && param.loop) {
                continue;
            } else if (param.validateStatusCode && reply.statusCode >= 400) {
                throw ("Status code greater than 400.");
            }

            // Get response string
            var entity = request.getEntity();
            reply.response = EntityUtils.toString(entity, param.responseEncoding);

            // Make best effort to parse json
            try {
                reply.json = JSON.parse(reply.response);
            } catch (parseError) { }

            break doLoop;

            // Do forever if its prod and we want to loop
        } while (param.isProd && param.loop);

    } catch (err) {

        // Normalize the exception value to make sure it's an Error object.
        // In the above, where I throw if its above 400, its not a valud
        // error object so err is the message. Whereas a normal error the 
        // message is held in err.message. I could correct that above but
        // Im unsure if its possible 
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
        if (!(err instanceof Error)) {
            err = new Error(err);
        }

        reply.successful = false;
        reply.error = err.message;
    } finally {
        if (request) {
            request.close();
        }
        return reply;
    }
}