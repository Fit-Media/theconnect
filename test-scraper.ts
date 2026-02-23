import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function test() {
    const query = 'LIBÉLULA TULUM';
    console.log(`Testing query: ${query}`);
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] 
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`, { waitUntil: 'domcontentloaded' });
        
        const data = await page.evaluate(() => {
            // Looking for the "Website" button in the Knowledge Panel
            const websiteLink = document.querySelector('a.ab_button[href^="http"]:not([href*="google.com"])') as HTMLAnchorElement;
            const mapsLink = document.querySelector('a[data-url*="maps"], a[href*="maps.google.com"], a.ab_button[href*="maps"]') as HTMLAnchorElement;
            
            // Or looking in the main search results if no knowledge panel
            const firstOrganicResult = document.querySelector('#search a[href^="http"]:not([href*="google.com"])') as HTMLAnchorElement;
            
            return {
                websiteUrl: websiteLink ? websiteLink.href : (firstOrganicResult ? firstOrganicResult.href : null),
                mapsUrl: mapsLink ? mapsLink.href : null,
                html: document.body.innerHTML.substring(0, 500) // Just to see
            };
        });
        
        console.log(data);
    } catch(e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

test();
