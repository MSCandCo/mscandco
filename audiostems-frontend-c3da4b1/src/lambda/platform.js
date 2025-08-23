exports.handler = async (event, context) => {
  console.log('MSC & Co Real Platform Request:', event.path || '/');

  const mscPlatform = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MSC & Co - Multi-Brand Music Distribution & Publishing</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <a class="flex items-center" href="/">
          <div class="flex items-center">
            <div class="text-2xl font-bold text-gray-900 mr-2">🎵</div>
            <div class="text-xl font-bold text-gray-900">MSC & Co</div>
          </div>
        </a>
        <div class="flex-1 flex justify-end items-center">
          <ul class="flex items-center space-x-8">
            <li><a class="transition-colors duration-200 text-gray-500 hover:text-blue-600" href="/pricing">Prices</a></li>
            <li><a class="transition-colors duration-200 text-gray-500 hover:text-blue-600" href="/about">About</a></li>
            <li><a class="transition-colors duration-200 text-gray-500 hover:text-blue-600" href="/support">Support</a></li>
          </ul>
          <div class="ml-8 flex gap-4">
            <button class="font-semibold px-4 py-2 text-gray-700 hover:text-gray-900">
              <a href="/login">Login</a>
            </button>
            <a href="/register">
              <button class="bg-transparent text-gray-900 border border-gray-900 rounded-xl px-6 py-2 font-bold shadow transition-all duration-300 hover:bg-gray-900 hover:text-white hover:shadow-lg">
                Register
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen flex items-center justify-center">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <div class="mb-8">
          <div class="text-5xl font-bold mb-4">🎵 MSC & Co</div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            Multi-Brand Music<br>
            Distribution & Publishing
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-200">
            YHWH MSC - Discover highly curated roster of label-quality musicians and composers across gospel, christian, and general music licensing.
          </p>
          <button class="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  </main>

  <footer class="text-xs text-center lg:text-left bg-white border-t">
    <div class="px-3 md:px-4 lg:px-6 m-auto max-w-7xl">
      <div class="pt-12 pb-20 flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200">
        <div class="lg:pr-16 w-full sm:pb-12 lg:pb-0 lg:w-1/4">
          <h4 class="text-2xl font-semibold text-gray-900">Need Help Finding the Right Song?</h4>
          <p class="mt-2 text-gray-600">Have it delivered to your account within 1 business day</p>
          <button class="bg-transparent text-gray-900 border border-gray-900 rounded-xl px-6 py-2 font-bold shadow transition-all duration-300 hover:bg-gray-900 hover:text-white hover:shadow-lg mt-6">
            Find My Song
          </button>
        </div>
        <div class="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
          <h4 class="font-bold text-gray-900">SERVICES</h4>
          <div class="mt-4 flex flex-col gap-3">
            <a class="transition text-gray-400 hover:text-gray-800" href="/songs">Song Search</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="/pricing">Subscription</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="#">Single Use</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="#">Custom Music</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="#">Covers</a>
          </div>
        </div>
        <div class="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
          <h4 class="font-bold text-gray-900">YHWH MSC</h4>
          <div class="mt-4 flex flex-col gap-3">
            <div class="text-sm">
              <div class="font-semibold text-gray-900">YHWH MSC</div>
              <div class="text-gray-600">Gospel and Christian music distribution and publishing</div>
            </div>
            <div class="text-sm">
              <div class="font-semibold text-gray-900">Audio MSC</div>
              <div class="text-gray-600">General music distribution and licensing for film/TV/media</div>
            </div>
          </div>
        </div>
        <div class="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
          <h4 class="font-bold text-gray-900">HELP & SUPPORT</h4>
          <div class="mt-4 flex flex-col gap-3">
            <a class="transition text-gray-400 hover:text-gray-800" href="/pricing">Pricing</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="/faq">FAQ</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="/support">Contact Support</a>
            <a class="transition text-gray-400 hover:text-gray-800" href="/about">About Us</a>
          </div>
        </div>
      </div>
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
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
    },
    body: mscPlatform
  };
};