const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3013'; // Change to your staging URL if needed
const OUTPUT_DIR = '/Users/htay/Downloads/artist_page_screenshots';

// Artist pages to capture
const ARTIST_PAGES = [
    { name: 'dashboard', url: '/artist/dashboard', waitFor: '.dashboard' },
    { name: 'releases', url: '/artist/releases', waitFor: 'main' },
    { name: 'analytics', url: '/artist/analytics', waitFor: 'main' },
    { name: 'earnings', url: '/artist/earnings', waitFor: 'main' },
    { name: 'wallet', url: '/artist/wallet', waitFor: 'main' },
    { name: 'apollo', url: '/artist/apollo', waitFor: 'main' },
    { name: 'playlist-pitching', url: '/artist/playlist-pitching', waitFor: 'main' },
    { name: 'sustainability', url: '/artist/sustainability', waitFor: 'main' },
    { name: 'profile', url: '/artist/profile', waitFor: 'main' },
    { name: 'settings', url: '/artist/settings', waitFor: 'main' },
];

async function captureArtistPages() {
    console.log('🎨 Starting artist page screenshot capture...\n');

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
    }

    // Launch browser
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
        headless: false, // Set to true for production
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2 // Retina display quality
    });

    console.log('📸 Viewport set to 1920x1080\n');

    // Capture each page
    for (let i = 0; i < ARTIST_PAGES.length; i++) {
        const pageInfo = ARTIST_PAGES[i];
        const outputPath = path.join(OUTPUT_DIR, `${pageInfo.name}.png`);

        try {
            console.log(`[${i + 1}/${ARTIST_PAGES.length}] Capturing: ${pageInfo.name}`);
            console.log(`   URL: ${BASE_URL}${pageInfo.url}`);

            // Navigate to page
            await page.goto(`${BASE_URL}${pageInfo.url}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for specific element
            try {
                await page.waitForSelector(pageInfo.waitFor, { timeout: 5000 });
            } catch (e) {
                console.log(`   ⚠️  Warning: Selector '${pageInfo.waitFor}' not found, continuing anyway...`);
            }

            // Wait a bit for any animations to complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Take screenshot
            await page.screenshot({
                path: outputPath,
                type: 'png',
                fullPage: true
            });

            console.log(`   ✅ Saved: ${outputPath}\n`);

        } catch (error) {
            console.error(`   ❌ Error capturing ${pageInfo.name}:`, error.message);
            console.log('');
        }
    }

    await browser.close();
    console.log('\n✨ All screenshots captured successfully!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

// Run the capture
captureArtistPages().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
