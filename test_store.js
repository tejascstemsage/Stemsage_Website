const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
            errors.push({ type: 'console', text: msg.text() });
        }
    });
    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.message);
        errors.push({ type: 'pageerror', text: err.message, stack: err.stack });
    });

    try {
        await page.goto('http://localhost:5173/store', { waitUntil: 'networkidle', timeout: 30000 });
        console.log('PAGE LOADED');
        const bodyText = await page.textContent('body');
        console.log('BODY TEXT LENGTH:', bodyText?.length);
        console.log('BODY SNIPPET:', bodyText?.substring(0, 500));
    } catch (e) {
        console.log('NAVIGATION ERROR:', e.message);
    }

    await browser.close();
    console.log('=== ERRORS SUMMARY ===');
    errors.forEach(e => console.log(JSON.stringify(e, null, 2)));
})();
