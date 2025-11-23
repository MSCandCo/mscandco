const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const HTML_FILE = '/Users/htay/Downloads/MSC_Pitch_Deck.html';
const OUTPUT_DIR = '/Users/htay/Downloads/pitch_deck_slides';

async function captureSingleSlide(slideNumber) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to slide dimensions
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2
    });

    await page.goto(`file://${HTML_FILE}`, {
        waitUntil: 'networkidle0'
    });

    // Wait for slides to render
    await page.waitForSelector('.slide');

    // Get all slides
    const slides = await page.$$('.slide');
    console.log(`Found ${slides.length} total slides`);

    if (slideNumber > slides.length) {
        console.error(`Slide ${slideNumber} does not exist. Only ${slides.length} slides found.`);
        await browser.close();
        return;
    }

    const slideIndex = slideNumber - 1;
    const outputPath = path.join(OUTPUT_DIR, `slide_${String(slideNumber).padStart(2, '0')}.png`);

    console.log(`Capturing slide ${slideNumber}/${slides.length}...`);

    // Get the exact bounding box of the slide
    const slideElement = slides[slideIndex];
    const box = await slideElement.boundingBox();

    // Take screenshot
    await page.screenshot({
        path: outputPath,
        clip: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
        },
        type: 'png'
    });

    console.log(`✓ Saved: ${outputPath}`);

    await browser.close();
}

// Get slide number from command line or default to 10
const slideNumber = parseInt(process.argv[2]) || 10;
captureSingleSlide(slideNumber).catch(error => {
    console.error('Error capturing slide:', error);
    process.exit(1);
});
