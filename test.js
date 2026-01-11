const { chromium } = require('playwright');
const path = require('path');

async function testWebsite() {
    console.log('Starting browser test...');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    
    const page = await context.newPage();
    
    const consoleErrors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    page.on('pageerror', error => {
        consoleErrors.push('Page Error: ' + error.message);
    });
    
    console.log('\n=== Testing Book with Audio on Page 6 ===');
    const indexPath = path.join(__dirname, 'index.html');
    await page.goto('file://' + indexPath);
    await page.waitForTimeout(6000);
    
    // Check loading screen is hidden
    const loadingHidden = await page.$eval('#loadingScreen', el => el.classList.contains('hidden'));
    console.log('Loading screen hidden: ' + loadingHidden);
    
    // Check opening screen is visible
    const openingVisible = await page.$eval('#openingScreen', el => el.classList.contains('visible'));
    console.log('Opening screen visible: ' + openingVisible);
    
    // Click open book button
    console.log('\n=== Opening the book ===');
    const openBookBtn = await page.$('#openBookBtn');
    await openBookBtn.click({ force: true });
    await page.waitForTimeout(1500);
    
    // Check book container visible
    const bookVisible = await page.$eval('#bookContainer', el => el.classList.contains('visible'));
    console.log('Book container visible: ' + bookVisible);
    
    // Check total pages (should be 6 now, not 7)
    const totalPages = await page.$$eval('.page', pages => pages.length);
    console.log('Total pages: ' + totalPages);
    
    // Navigate to page 5 (special video page with audio)
    console.log('\n=== Navigating to page 5 (special video with audio) ===');
    for (let i = 1; i < 5; i++) {
        await page.evaluate(function() {
            const nextZone = document.getElementById('nextZone');
            if (nextZone) nextZone.click();
        });
        await page.waitForTimeout(800);
    }
    
    // Check current page
    const currentPage = await page.$eval('.indicator-dot.active', el => el.getAttribute('data-page'));
    console.log('Current page: ' + currentPage);
    
    // Check for special video page
    const specialVideoPage = await page.$('.special-video-page');
    console.log('Special video page exists: ' + !!specialVideoPage);
    
    // Check for audio element
    const audioElement = await page.$('#pageAudio');
    console.log('Audio element exists: ' + !!audioElement);
    
    // Check for video element
    const specialVideo = await page.$('#specialVideo');
    console.log('Special video element exists: ' + !!specialVideo);
    
    // Check page indicator dots
    const pageDots = await page.$$eval('.indicator-dot', dots => dots.length);
    console.log('Page indicator dots: ' + pageDots);
    
    // Check for errors
    console.log('\n=== Console Errors ===');
    if (consoleErrors.length > 0) {
        consoleErrors.forEach(err => console.log('ERROR: ' + err));
        console.log('\nTest completed with errors');
    } else {
        console.log('No console errors - Test PASSED!');
    }
    
    await browser.close();
}

testWebsite().catch(function(err) {
    console.error('Test failed:', err);
    process.exit(1);
});
