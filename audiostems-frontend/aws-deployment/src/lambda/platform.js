exports.handler = async (event, context) => {
  try {
    console.log('🎵 MSC & Co Real Platform Request:', {
      path: event.rawPath || event.path,
      method: event.requestContext?.http?.method || event.httpMethod
    });

    const path = event.rawPath || event.path || '/';

    // Handle static assets - redirect to localhost:3002 or serve placeholders
    if (path.startsWith('/_next/') || path.includes('.css') || path.includes('.js') || path.includes('.png') || path.includes('.jpg') || path.includes('.svg')) {
      // For now, return 404 for assets - Next.js will handle inline styles
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Asset not found'
      };
    }

    // Serve the real MSC & Co homepage from localhost:3002
    const realMSCHomepage = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>MSC & Co - Multi-Brand Music Distribution & Publishing</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .hero-bg {
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), 
                  url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMUYyOTM3Ii8+CjwvcmVnPgo=');
      background-size: cover;
      background-position: center;
      min-height: 100vh;
    }
    #nprogress .bar {
      background: #0117df;
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }
  </style>
</head>
<body>
  <div id="__next">
    <!-- MSC & Co Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a class="flex items-center" href="/">
            <div class="flex items-center">
              <div class="text-2xl font-bold text-gray-900">MSC & Co</div>
            </div>
          </a>
          <div class="flex-1 flex justify-end items-center">
            <ul class="flex items-center">
              <li class="px-5 py-2">
                <a class="transition-colors duration-200 text-gray-500 hover:text-blue-600" href="/pricing">Prices</a>
              </li>
              <li class="px-5 py-2">
                <a class="transition-colors duration-200 text-gray-500 hover:text-blue-600" href="/about">About</a>
              </li>
              <li class="px-5 py-2">
                <a class="transition-colors duration-200 text-gray-500 hover:text-blue-600" href="/support">Support</a>
              </li>
            </ul>
            <div class="ml-2 flex gap-4">
              <button class="font-semibold px-4 py-2">
                <a href="/login">Login</a>
              </button>
              <a href="/register">
                <button class="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-6 py-2 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]">
                  Register
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <div class="hero-bg">
      <main class="flex items-center justify-center min-h-screen">
        <div class="text-center text-white px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto">
            <img class="h-24 w-auto mx-auto mb-8" src="https://via.placeholder.com/200x100/ffffff/000000?text=MSC%26Co" alt="MSC & Co Logo" style="filter: invert(1);"/>
            
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              Multi-Brand Music<br/>
              Distribution & Publishing
            </h1>
            
            <p class="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              YHWH MSC - Discover highly curated roster of label-quality musicians and composers across gospel, christian, and general music licensing.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button class="bg-white text-[#1f2937] px-8 py-3 rounded-xl font-bold shadow transition-all duration-300 hover:bg-gray-100 hover:shadow-lg">
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Content Sections -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12">
          <!-- Real Artists Section -->
          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Real Artists</h2>
            <p class="text-gray-600 mb-6">Connect with verified artists and music creators across multiple genres and licensing needs.</p>
          </div>
          
          <!-- Built for Section -->
          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Built for Creatives</h2>
            <p class="text-gray-600 mb-6">Professional tools for filmmakers, content creators, and media professionals.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="text-xs text-center lg:text-left bg-gray-50">
      <div class="px-3 md:px-4 lg:px-6 m-auto max-w-7xl">
        <div class="pt-12 pb-20 flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200">
          
          <!-- Need Help Section -->
          <div class="lg:pr-16 w-full sm:pb-12 lg:pb-0 lg:w-1/4">
            <h4 class="text-2xl font-semibold">Need Help Finding the Right Song?</h4>
            <p class="mt-2">Have it delivered to your account within 1 business day</p>
            <button class="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-6 py-2 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937] mt-6 mx-auto lg:ml-0">
              Find My Song
            </button>
          </div>
          
          <!-- Services Section -->
          <div class="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 class="font-bold">SERVICES</h4>
            <div class="mt-4 flex flex-col gap-3">
              <a class="transition text-gray-400 hover:text-gray-800" href="/songs">Song Search</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/pricing">Subscription</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/#">Single Use</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/#">Custom Music</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/#">Covers</a>
            </div>
          </div>
          
          <!-- YHWH MSC Section -->
          <div class="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 class="font-bold">YHWH MSC</h4>
            <div class="mt-4 flex flex-col gap-3">
              <div class="text-sm">
                <div class="font-semibold">YHWH MSC</div>
                <div class="text-gray-600">Gospel and Christian music distribution and publishing</div>
              </div>
              <div class="text-sm">
                <div class="font-semibold">Audio MSC</div>
                <div class="text-gray-600">General music distribution and licensing for film/TV/media</div>
              </div>
            </div>
          </div>
          
          <!-- Help & Support Section -->
          <div class="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 class="font-bold">HELP & SUPPORT</h4>
            <div class="mt-4 flex flex-col gap-3">
              <a class="transition text-gray-400 hover:text-gray-800" href="/pricing">Pricing</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/faq">FAQ</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/support">Contact Support</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/about">About Us</a>
            </div>
          </div>
        </div>
        
        <!-- Copyright Section -->
        <div class="border-t border-gray-200 py-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <a class="transition text-gray-400 hover:text-gray-800" href="/">© 2024 MSC & Co. All rights reserved.</a>
            <div class="flex gap-2 sm:gap-4 md:gap-6 justify-center lg:gap-12">
              <a class="transition text-gray-400 hover:text-gray-800" href="/privacy-policy">Privacy Policy</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/license-terms">License Terms</a>
              <a class="transition text-gray-400 hover:text-gray-800" href="/terms-of-use">Terms of Use</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>\`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
      body: realMSCHomepage
    };

  } catch (error) {
    console.error('❌ Platform error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};