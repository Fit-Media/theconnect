import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const query = "Rosa Negra Tulum reviews";
  console.log(`Searching for: ${query}`);
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`, { waitUntil: 'networkidle2' });

  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'reviews-screenshot.png', fullPage: true });
  console.log('Saved screenshot to reviews-screenshot.png');

  await browser.close();
}

run();
