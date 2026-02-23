import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const query = "Rosa Negra Tulum";
  console.log(`Searching Maps for: ${query}`);
  await page.goto(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });

  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));

  // Extract from Maps
  const data = await page.evaluate(() => {
    const reviews = [];
    // The reviews are usually in elements with class 'jJc83c' or 'MyEned' or 'wiI7pd'
    // Let's just find elements with text that look like reviews
    const textEls = document.querySelectorAll('.wiI7pd');
    textEls.forEach(el => reviews.push(el.textContent.trim()));

    // Also let's try to get image URLs from Maps
    const imgs = document.querySelectorAll('img');
    const imgUrls = [];
    imgs.forEach(el => {
      const src = el.src;
      if (src && src.includes('ggpht.com')) {
        imgUrls.push(src);
      }
    });

    return { reviews, images: imgUrls.slice(0, 10) };
  });

  console.log(`Found ${data.reviews.length} reviews and ${data.images.length} images.`);
  console.log('Reviews:', data.reviews);
  console.log('Images:', data.images);

  await browser.close();
}

run();
