import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const query = "Libelula Tulum reviews";
  console.log(`Searching for: ${query}`);
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`, { waitUntil: 'domcontentloaded' });

  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));

  // Extract reviews
  const reviews = await page.evaluate(() => {
    // There are multiple places reviews can be.
    // In the knowledge panel:
    const reviewElements = document.querySelectorAll('div[data-md="312"], div[data-md="1009"], div.Jtu6Td, div.gws-localreviews__google-review');
    const results = [];
    
    // We'll just grab any text that looks like a review.
    // Let's try to grab the expanding review text.
    const textEls = document.querySelectorAll('span[data-expandable-section]');
    textEls.forEach(el => {
        results.push(el.textContent.trim());
    });

    if (results.length === 0) {
        // Fallback: Just grab typical review class names, or all review snippets
        const snippets = document.querySelectorAll('.Y2IQ15, .review-snippet, .OA1nbd');
        snippets.forEach(el => results.push(el.textContent.trim()));
    }

    return results;
  });

  console.log(`Found ${reviews.length} reviews:`);
  console.log(reviews);

  await browser.close();
}

run();
