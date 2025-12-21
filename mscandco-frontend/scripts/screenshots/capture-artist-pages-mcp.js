// Artist pages to capture using MCP Playwright
const ARTIST_PAGES = [
    { name: 'dashboard', url: 'http://localhost:3013/artist/dashboard' },
    { name: 'releases', url: 'http://localhost:3013/artist/releases' },
    { name: 'analytics', url: 'http://localhost:3013/artist/analytics' },
    { name: 'earnings', url: 'http://localhost:3013/artist/earnings' },
    { name: 'wallet', url: 'http://localhost:3013/artist/wallet' },
    { name: 'apollo', url: 'http://localhost:3013/artist/apollo' },
    { name: 'playlist-pitching', url: 'http://localhost:3013/artist/playlist-pitching' },
    { name: 'sustainability', url: 'http://localhost:3013/artist/sustainability' },
    { name: 'profile', url: 'http://localhost:3013/artist/profile' },
    { name: 'settings', url: 'http://localhost:3013/artist/settings' },
];

console.log('🎨 Artist pages to capture:', ARTIST_PAGES.map(p => p.name).join(', '));
console.log('\nReady for MCP Playwright capture!');
