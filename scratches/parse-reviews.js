import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug-reviews.html', 'utf-8');
const $ = cheerio.load(html);

// We need to look for places where a 5-star or 4-star text might be.
// Often, review snippets have classes or specific attributes.
const results = [];

// Try to find elements that look like reviews (often span text containing many characters, next to star icons)
$('div').each((i, el) => {
    const text = $(el).text();
    // Look for divs that contain 'stars' and a long string
    if (text.includes('★') || text.includes('star')) {
        // This might be a container for a review
        // Extract paragraphs or spans inside it that are longer than 50 chars
        $(el).find('span').each((j, span) => {
            const spanText = $(span).text().trim();
            if (spanText.length > 50 && spanText.length < 500 && !results.includes(spanText)) {
                
                // Exclude common UI texts
                if (!spanText.includes('google.com') && !spanText.includes('Search') && !spanText.includes('Sign in')) {
                    results.push(spanText);
                }
            }
        });
    }
});

// Another common pattern: look for review snippet elements
$('.review-snippet, .Y2IQ15').each((i, el) => {
    results.push($(el).text().trim());
});

console.log(`Extracted ${results.length} potential review snippets:`);
results.slice(0, 10).forEach(r => console.log('Snippet:', r));
