const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); errors.push({ type: 'console', text: msg.text() }); });
    page.on('pageerror', err => { console.log('PAGE ERROR:', err.message); errors.push({ type: 'pageerror', text: err.message }); });

    await page.goto('http://localhost:5173/store', { waitUntil: 'networkidle', timeout: 30000 });
    const bodyText = await page.textContent('body');
    console.log('BODY LEN:', bodyText?.length);
    console.log('HEADER:', await page.locator('header').count() > 0 ? 'YES' : 'NO');
    console.log('FOOTER:', await page.locator('footer').count() > 0 ? 'YES' : 'NO');
    console.log('Has "My STEM Box":', bodyText.includes('My STEM Box'));
    console.log('Has "₹2,999":', bodyText.includes('2,999'));
    console.log('Has "₹4,999":', bodyText.includes('4,999'));
    console.log('Has "₹₹":', bodyText.includes('₹₹'));
    console.log('Has "Most Popular":', bodyText.includes('Most Popular'));
    console.log('Has "Reload page":', bodyText.includes('Reload page'));
    console.log('Has "Something went wrong":', bodyText.includes('Something went wrong'));
    console.log('ERRORS:', errors.length === 0 ? 'NONE' : JSON.stringify(errors));
    await browser.close();
})();