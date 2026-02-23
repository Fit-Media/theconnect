import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const query = "Rosa Negra Tulum reviews";
  console.log(`Searching for: ${query}`);
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`, { waitUntil: 'domcontentloaded' });

  await new Promise(r => setTimeout(r, 2000));

  const html = await page.content();
  fs.writeFileSync('debug-reviews.html', html);
  console.log('Saved to debug-reviews.html');

  await browser.close();
}

run();
