import fs from 'fs';

let apiKey = '';
try {
  const env = fs.readFileSync('.env', 'utf-8');
  const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim();
} catch (e) {}

async function run() {
  if (!apiKey) {
      console.log("No API key found."); return;
  }
  const query = "Rosa Negra Tulum";
  const prompt = `Find and return exactly 5 real, authentic Google Reviews for "${query}".
  Format the response as a valid JSON array of objects. Do NOT use markdown code blocks (\`\`\`json). Just the raw JSON.
  Each object MUST have:
  - "author_name" (string)
  - "rating" (number between 1 and 5)
  - "text" (string, the review itself, at least 2 sentences)
  - "relative_time_description" (string, e.g. "2 months ago")
  - "profile_photo_url" (string, make up a random pravatar.cc url if you can't find one: 'https://i.pravatar.cc/150?u=' + Math.random())`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.1,
        }
      })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/^```json/im, '').replace(/```$/im, '').trim();
        console.log("EXTRACTED TEXT:\n", text);
        try {
            const parsed = JSON.parse(text);
            console.log("SUCCESSFULLY PARSED JSON:", parsed.length, "reviews found.");
        } catch(e) {
            console.error("Parse error:", e);
        }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
