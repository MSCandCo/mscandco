const playwright = require('playwright');
const path = require('path');

async function captureSlides() {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Navigate to the HTML file
    const htmlPath = '/Users/htay/The Icho Group Dropbox/The !cho Media/Work Editing Folder/2025/November/EIC/MSC_Pitch_Deck_Final.html';
    await page.goto(`file://${htmlPath}`);

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Output directory
    const outputDir = '/Users/htay/The Icho Group Dropbox/The !cho Media/Work Editing Folder/2025/November/EIC/pitch_deck_slides';

    // Get all slides
    const slides = await page.locator('.slide').all();
    console.log(`Found ${slides.length} slides`);

    for (let i = 0; i < slides.length; i++) {
        const slideNumber = String(i + 1).padStart(2, '0');
        const outputPath = path.join(outputDir, `slide_${slideNumber}.png`);

        // Scroll the slide into view
        await slides[i].scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Take screenshot of the specific slide
        await slides[i].screenshot({
            path: outputPath,
            type: 'png'
        });

        console.log(`Captured slide ${slideNumber}: ${outputPath}`);
    }

    await browser.close();
    console.log('All slides captured successfully!');
}

captureSlides().catch(console.error);
