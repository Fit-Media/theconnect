const fs = require('fs');

const html = fs.readFileSync('debug.html', 'utf8');

// The original URL is usually somewhere around an array like `["https://url.com/img.jpg", 1000, 1000]`
// Let's find all high res image URLs that end with jpg/jpeg/png
const urlRegex = /"(https:\/\/[^"]+\.(?:jpg|jpeg|png)(?:\?[^"]*)?)"/gi;
const matches = [];
let match;
while ((match = urlRegex.exec(html)) !== null) {
    if (!match[1].includes('encrypted-tbn0') && !match[1].includes('favicon')) {
        matches.push(match[1]);
    }
}

console.log(`Found ${matches.length} matches.`);
console.log('Sample matches:', Array.from(new Set(matches)).slice(0, 10));

