const fs = require('fs');

async function test() {
    const env = fs.readFileSync('.env', 'utf8');
    const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (!keyMatch) {
        console.error("No API key found in .env");
        return;
    }
    const key = keyMatch[1].trim();
    
    const query = "LIBÉLULA TULUM";
    const textPrompt = `Search Google for detailed travel information about "${query}" in Tulum or the specified location. 
            Extract and return the following details as a raw JSON object. Do not wrap in markdown tags like \`\`\`json.
            
            Schema:
            {
              "title": "Exact name of the place",
              "imageUrl": "A direct URL to a high-quality, real image of this place from Google Images or their website (e.g. ending in .jpg or .png)"
            }`;

    const body = JSON.stringify({
        contents: [{
          parts: [{ text: textPrompt }]
        }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.1
        }
    });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        
        const data = await response.json();
        console.dir(data, { depth: null });
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            console.log("\n--- TEXT OUTPUT ---");
            console.log(data.candidates[0].content.parts[0].text);
        }
    } catch (err) {
        console.error(err);
    }
}

test();
