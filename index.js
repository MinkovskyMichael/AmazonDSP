/*
 * Primary file for the API
 */

 /*
 * let and const
 * Variables declared with let and const inside a block of code 
 * (denoted by curly braces { }) get stuck in what is known as
 * the temporal dead zone until the variable's declaration is 
 * processed. Thus, these two keywords eliminate the issue 
 * of hoisting whereby executing any JavaScript code only 
 * after all variables declared with var, either scoped 
 * globally or locally to the top of the function scope, are 
 * raised. 
 * Note: Hoisting is a result of how JavaScript is interpreted
 * by your browser.
 */

    // Dependencies
    const http = require('http');
    const url = require('url');
    const StringDecoder = require('string_decoder').StringDecoder;
    
    // The server should respond to all requests with a string
    let server = http.createServer(function(req, res){
    
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    let queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    let method = req.method.toLowerCase();

    // Get the headers as an object
    let headers = req.headers;
    
    // Get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data',function(data){
    buffer += decoder.write(data);    
    });
    req.on('end',function(){
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'buffer' : buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
        // Use the status code called back by the handler, or default to 200
           statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
        
           // Use the payload called back by the payload, or default to empty object
            payload = typeof(payload) == 'object' ? payload:{};
            
        // Convert the payload to a string
        let payloadString = JSON.stringify(payload);
        
        // Return the response
        res.writeHead(statusCode);
        
        // Send the response
        res.end(payloadString);

        // Log the frequest path
        console.log('Returning this response: ', statusCode, payloadString);
        });
    });
});

    // Start the server, and have it listen on port 3000
    server.listen(3000, function(){
        console.log("The server is listening on port 3000 now");
 });

    // Define the handlers
    let handlers = {};
    
    // Sample handlers
    handlers.sample = function(data, callback){
        //Callback a http status code, and a payload object
        callback(406, {'name' : 'sample handler'});
    };

    // Not found handler
    handlers.notFound = function(data, callback){
        callback(406);
    };

    let router = {
     'sample': handlers.sample
 }