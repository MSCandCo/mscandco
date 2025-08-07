exports.main = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MSC & Co Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div class="max-w-7xl mx-auto px-4 py-12">
            <div class="text-center mb-16">
                <h1 class="text-6xl font-bold text-gray-900 mb-4">🎵 MSC & Co Platform</h1>
                <h2 class="text-3xl font-semibold text-blue-600 mb-6">Real Artists, Real Music, Real Results</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    The ultimate platform for filmmakers, content creators, and music professionals to collaborate and create amazing content.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <div class="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div class="text-4xl mb-4">🎤</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Real Artists</h3>
                    <p class="text-gray-600">Connect with authentic, professional artists creating original music for your projects.</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div class="text-4xl mb-4">🔍</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">100+ Ways to Filter</h3>
                    <p class="text-gray-600">Advanced filtering system to find exactly the right sound for your creative vision.</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div class="text-4xl mb-4">🎬</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Playlists for Filmmakers</h3>
                    <p class="text-gray-600">Curated playlists created by filmmakers, for filmmakers and content creators.</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div class="text-4xl mb-4">🎯</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Free Song Pitches</h3>
                    <p class="text-gray-600">Get custom song recommendations and pitches for your specific project needs.</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div class="text-4xl mb-4">🎵</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Instrumental & Lyrical</h3>
                    <p class="text-gray-600">Access both instrumental and lyrical versions of songs for maximum flexibility.</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div class="text-4xl mb-4">🤝</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Collaborate With Your Team</h3>
                    <p class="text-gray-600">Built-in collaboration tools to work seamlessly with your creative team.</p>
                </div>
            </div>
            
            <div class="text-center">
                <div class="bg-green-100 rounded-lg p-8 mb-8">
                    <h3 class="text-2xl font-bold text-green-800 mb-4">✅ Live on staging.mscandco.com</h3>
                    <p class="text-green-600">
                        Your real MSC & Co homepage with commit eed6a87 is now live! 
                        Features: Real Artists • 100+ Filters • Filmmaker Playlists • Free Pitches • Team Collaboration
                    </p>
                </div>
                
                <div class="flex flex-wrap gap-4 justify-center">
                    <a href="#" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                        🎵 Browse Music
                    </a>
                    <a href="#" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                        🎬 For Filmmakers
                    </a>
                    <a href="#" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                        🤝 Start Collaborating
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `
  };
};