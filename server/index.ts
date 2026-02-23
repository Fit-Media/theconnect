import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main scraping endpoint
app.post('/api/scrape-google-places', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is missing' });
  }

  console.log(`[Scraper] Initializing stealth browser for: ${query}`);
  
  let browser;

  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] 
    });
    
    const page = await browser.newPage();
    
    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' Tulum photos')}&tbm=isch`;
    console.log(`[Scraper] Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait a brief moment for dynamic image grids to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`[Scraper] Parsing page content...`);

    // Extract high-quality image URLs from the Google Images results dynamically loaded scripts
    const html = await page.content();

    // Improved regex to handle escaped quotes and weird trailing characters from Google's dynamic scripts
    const urlRegex = /"(https?:\/\/[^"\\\s]+\.(?:jpg|jpeg|png)(?:\?[^"\\\s]*)?)"/gi;
    const matches: string[] = [];
    let match;
    
    while ((match = urlRegex.exec(html)) !== null) {
        const urlCandidate = match[1];
        if (!urlCandidate) continue;

        // Exclude low-res thumbnails, favicons, and internal assets
        if (!urlCandidate.includes('encrypted-tbn0') && 
            !urlCandidate.includes('favicon') && 
            !urlCandidate.includes('gstatic.com') &&
            !urlCandidate.includes('google.com/')) {
            // Unescape Unicode characters and handle trailing garbage
            const cleanUrl = urlCandidate
                .replace(/\\u003d/g, '=')
                .replace(/\\u0026/g, '&')
                .replace(/\\u0022/g, '')
                .split('"')[0]
                .split('\\')[0];
            
            if (cleanUrl && cleanUrl.startsWith('http')) {
                matches.push(cleanUrl);
            }
        }
    }

    const photoUrls = Array.from(new Set(matches)).slice(0, 10);

    console.log(`[Scraper] Found ${photoUrls.length} photos for ${query}`);
    
    // Format to match Google Places API style payload
    const formattedPhotos = photoUrls.map((url, i) => ({
        photo_reference: `puppeteer_scraped_${i}`,
        url: url,
        author_name: 'Google Maps Scrape',
        width: 800,
        height: 600,
    }));

    return res.json({ photos: formattedPhotos });

  } catch (error: unknown) {
    console.error(`[Scraper] Error scraping ${query}:`, error);
    return res.status(500).json({ error: 'Failed to scrape photos', details: String(error) });
  } finally {
     if (browser) {
         await browser.close().catch(console.error);
     }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Stealth Scraper proxy server running on http://localhost:${PORT}`);
});
