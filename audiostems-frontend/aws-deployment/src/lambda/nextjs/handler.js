// MSC & Co Next.js Lambda Handler - Server-Side Rendering on AWS Lambda
// Handles all frontend requests with enterprise-grade performance

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Initialize Next.js app
const app = next({
  dev: false,
  conf: {
    // Next.js configuration for Lambda
    target: 'server',
    distDir: '.next',
    generateEtags: false,
    compress: false,
  },
});

const handle = app.getRequestHandler();

// Lambda handler
exports.main = async (event, context) => {
  console.log('Next.js Lambda Event:', JSON.stringify(event, null, 2));

  // Ensure Next.js is prepared
  if (!app.prepared) {
    await app.prepare();
  }

  try {
    // Convert API Gateway event to HTTP request
    const { path, httpMethod, headers, body, queryStringParameters, isBase64Encoded } = event;
    
    // Build URL
    const url = path + (queryStringParameters 
      ? '?' + new URLSearchParams(queryStringParameters).toString() 
      : '');

    // Create mock request/response objects
    const req = createMockRequest({
      method: httpMethod,
      url,
      headers,
      body: isBase64Encoded ? Buffer.from(body, 'base64') : body,
    });

    const res = createMockResponse();

    // Handle request with Next.js
    await handle(req, res);

    // Convert response back to API Gateway format
    return {
      statusCode: res.statusCode || 200,
      headers: {
        ...res.headers,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Powered-By': 'MSC & Co AWS Lambda',
      },
      body: res.body || '',
      isBase64Encoded: false,
    };
  } catch (error) {
    console.error('Next.js Lambda Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
        'X-Error': 'Next.js Lambda Error',
      },
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>MSC & Co - Service Temporarily Unavailable</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
              .logo { color: #3498db; font-size: 2em; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="logo">MSC & Co</div>
            <h1>Service Temporarily Unavailable</h1>
            <p class="error">We're experiencing technical difficulties. Please try again in a few moments.</p>
            <p>If the problem persists, please contact support.</p>
          </body>
        </html>
      `,
    };
  }
};

// Create mock HTTP request object
function createMockRequest({ method, url, headers, body }) {
  const parsedUrl = parse(url, true);
  
  return {
    method,
    url,
    path: parsedUrl.pathname,
    query: parsedUrl.query,
    headers: {
      ...headers,
      host: process.env.CDN_DOMAIN || headers.host,
    },
    body,
    on: () => {},
    emit: () => {},
    pipe: () => {},
    read: () => body,
    readable: true,
    complete: true,
  };
}

// Create mock HTTP response object
function createMockResponse() {
  let statusCode = 200;
  let headers = {};
  let body = '';

  return {
    statusCode,
    headers,
    body,
    
    writeHead(code, responseHeaders) {
      statusCode = code;
      if (responseHeaders) {
        headers = { ...headers, ...responseHeaders };
      }
    },
    
    setHeader(name, value) {
      headers[name] = value;
    },
    
    getHeader(name) {
      return headers[name];
    },
    
    write(chunk) {
      body += chunk;
    },
    
    end(chunk) {
      if (chunk) {
        body += chunk;
      }
      this.statusCode = statusCode;
      this.headers = headers;
      this.body = body;
    },
    
    finished: false,
    headersSent: false,
  };
}