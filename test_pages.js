const { chromium } = require('playwright');

const PAGES = ['/', '/store', '/services', '/gallery', '/news'];

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let allErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
            allErrors.push({ type: 'console', text: msg.text() });
        }
    });
    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.message);
        allErrors.push({ type: 'pageerror', text: err.message });
    });

    for (const path of PAGES) {
        console.log(`\n===== Testing ${path} =====`);
        allErrors = [];
        try {
            await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (e) {
            console.log('NAV ERROR:', e.message);
            continue;
        }
        const bodyText = await page.textContent('body');
        const hasHeader = await page.locator('header').count();
        const hasFooter = await page.locator('footer').count();
        console.log('BODY LEN:', bodyText?.length);
        console.log('HEADER:', hasHeader > 0 ? 'YES' : 'NO');
        console.log('FOOTER:', hasFooter > 0 ? 'YES' : 'NO');
        console.log('ERRORS:', allErrors.length === 0 ? 'NONE' : JSON.stringify(allErrors));
    }

    // Check /store shows product cards
    const storeCards = await page.locator('[class*="rounded-xl bg-white border border-slate-200"]').count();
    console.log(`\n===== /store product cards =====`);
    console.log('CARD COUNT:', storeCards);

    await browser.close();
})();