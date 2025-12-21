const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const HTML_FILE = '/Users/htay/Downloads/MSC_Pitch_Deck.html';
const OUTPUT_DIR = '/Users/htay/Downloads/pitch_deck_slides';

async function captureSlides() {
    console.log('Starting slide capture process...');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }

    // Launch browser
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to match slide dimensions
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2 // High resolution for better quality
    });

    console.log(`Loading HTML file: ${HTML_FILE}`);
    await page.goto(`file://${HTML_FILE}`, {
        waitUntil: 'networkidle0'
    });

    // Wait for slides to render
    await page.waitForSelector('.slide');

    // Get all slides
    const slides = await page.$$('.slide');
    console.log(`Found ${slides.length} slides to capture`);

    // Capture each slide
    for (let i = 0; i < slides.length; i++) {
        const slideNumber = i + 1;
        const outputPath = path.join(OUTPUT_DIR, `slide_${String(slideNumber).padStart(2, '0')}.png`);

        console.log(`Capturing slide ${slideNumber}/${slides.length}...`);

        // Scroll to the slide
        await page.evaluate((index) => {
            const slide = document.querySelectorAll('.slide')[index];
            slide.scrollIntoView();
        }, i);

        // Wait a moment for any animations
        await new Promise(resolve => setTimeout(resolve, 500));

        // Take screenshot of the specific slide
        const boundingBox = await slides[i].boundingBox();
        await page.screenshot({
            path: outputPath,
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: 1920,
                height: 1080
            },
            type: 'png'
        });

        console.log(`  ✓ Saved: ${outputPath}`);
    }

    await browser.close();
    console.log('\n✅ All slides captured successfully!');
    console.log(`Output directory: ${OUTPUT_DIR}`);
}

// Run the capture
captureSlides().catch(error => {
    console.error('Error capturing slides:', error);
    process.exit(1);
});
