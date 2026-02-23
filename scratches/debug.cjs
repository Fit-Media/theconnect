const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=Rosa+Negra+Tulum+photos&tbm=isch');
    await new Promise(r => setTimeout(r, 4000));
    const content = await page.content();
    const fs = require('fs');
    fs.writeFileSync('debug.html', content);
    await browser.close();
})();
