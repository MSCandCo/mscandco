const { createServer } = require('@serverless-nextjs/lambda-at-edge');

// Create Next.js server instance
const server = createServer({
  handler: require('./pages/_app.js'),
  binary: [
    'application/javascript',
    'application/json',
    'application/octet-stream',
    'application/xml',
    'font/eot',
    'font/opentype',
    'font/otf',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'text/comma-separated-values',
    'text/css',
    'text/html',
    'text/javascript',
    'text/plain',
    'text/text',
    'text/xml'
  ]
});

exports.handler = async (event, context) => {
  try {
    console.log('🎵 MSC & Co Platform Request:', {
      path: event.path || event.rawPath,
      method: event.httpMethod || event.requestContext?.http?.method,
      headers: event.headers
    });

    // Handle Next.js app
    const response = await server(event, context);
    
    console.log('✅ Response status:', response.statusCode);
    return response;
  } catch (error) {
    console.error('❌ Platform Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MSC & Co Platform - Loading</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">🎵 MSC & Co Platform</h1>
            <p class="text-xl text-gray-600 mb-8">Platform is starting up...</p>
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-500 mt-4">Please refresh in a moment</p>
          </div>
        </body>
        </html>
      `
    };
  }
};