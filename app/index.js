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
    const https = require('https');
    const url = require('url');
    const StringDecoder = require('string_decoder').StringDecoder;
    const config = require('./config');
    const fs = require('fs');

    // Instantiate the HTTP server
    let httpServer = http.createServer(function(req, res){
        unifiedServer(req, res);
});

    // Start the HTTP server
    httpServer.listen(config.httpPort, function(){
        console.log("The server is listening on port "+config.httpPort);
});

    // Instantiate the HTTPS server
    let httpsServerOptions = {
        'key' : fs.readFileSync('./https/key.pem'),
        'cert' : fs.readFileSync('./https/cert.pem')
};
    let httpsServer = https.createServer(httpsServerOptions, function(req, res){
        unifiedServer(req, res);
});

    // Start the HTTPS server
    httpsServer.listen(config.httpsPort, function(){
        console.log("The server is listening on port "+config.httpsPort);
});

    // All the server logic for both the http and https server
    let unifiedServer = function(req, res){

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
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        // Log the frequest path
        console.log('Returning this response: ', statusCode, payloadString);
        });
    });
    };
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
