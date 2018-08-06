// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Instantiate server
const server = http.createServer((req,res) => {

  // Parse URL from request, get pathname, and trim pathname
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get HTTP method
  const method = req.method.toLowerCase();

  // Get payload if payload exists
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  // Return response
  req.on('data', data => buffer += decoder.write(data));
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler that request should be routed to, default = notFound
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : routeHandlers.notFound;

    // Data object to send to route handlers
    const data = {
      trimmedPath,
      method,
      'payload': buffer,
    };

    // Route request to handler specified in router
    chosenHandler(data, (statusCode, payload) => {

      // Set status code for response
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Set response payload
      payload = typeof(payload) == 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);

      // Return response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
});

// Start server on port 3000
server.listen(3000, () => console.log('Server up on port 3000'));

// Create route handler object
const routeHandlers = {};

// Create hello handler
routeHandlers.hello = (data, callback) => {
  const welcomeMessage = data.method == 'post' ? {'welcomeMessage': 'Hello Pirple!'} : {};
  callback(200, welcomeMessage);
};

// Create notFound Handler
routeHandlers.notFound = (data, callback) => {
  callback(404);
};

// Create router
const router = {
  'hello': routeHandlers.hello,
};
