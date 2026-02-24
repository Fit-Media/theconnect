import type { EventCard } from '../types';

export const aiSearch = async (query: string): Promise<Partial<EventCard>> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is not set. Falling back to basic mock data.");
    // Simulate network delay for the fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      title: query.split('-').pop()?.trim() || query,
      tags: ['Activity', 'Explore'],
      description: `Auto-generated details for ${query}. Please set VITE_GEMINI_API_KEY in .env to enable real Google Search scraping.`,
      aiFactsAndTips: '✨ AI Fact: This is a placeholder since the API key is missing.',
    };
  }

  try {
    const geminiPromise = fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Search Google for detailed travel information about "${query}" in Tulum or the specified location. 
            Extract and return the following details as a raw JSON object. Do not wrap in markdown tags like \`\`\`json.
            
            Schema:
            {
              "title": "Exact name of the place",
              "location": "Neighborhood or specific area (e.g., 'Tulum Beach', 'Aldea Zama')",
              "time": "Best suggested time to visit (e.g., '9:00 PM', '10:00 AM')",
              "description": "A compelling 1-2 sentence description",
              "tags": ["Activity", "Dining", "Nightlife", "Nature"],
              "websiteUrl": "Official website URL or Instagram link if available",
              "googleMapsUrl": "A strict Google Maps search URL following this exact format: https://www.google.com/maps/search/?api=1&query=[ENCODED_PLACE_NAME_AND_LOCATION]",
              "imageUrl": "A direct URL to a high-quality, real image of this place from Google Images or their website (e.g. ending in .jpg or .png)",
              "aiFactsAndTips": "✨ AI Tip: One interesting fact, dress code, or tip for travelers",
              "coordinates": {
                "lat": "number (exact latitude in Tulum)",
                "lng": "number (exact longitude in Tulum)"
              },
              "contactInfo": {
                "phone": "EXTRACT THE EXACT PHONE NUMBER FROM THE GOOGLE SEARCH PANEL. DO NOT HALLUCINATE.",
                "email": "Email address, if available",
                "whatsapp": "WhatsApp number, if available"
              }
            }`
          }]
        }],
        tools: [{ googleSearch: {} }], // Re-enabled googleSearch for accurate website and contact info
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    const scraperPromise = fetch('http://localhost:3001/api/scrape-google-places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query + ' Tulum' })
    }).then(res => res.json()).catch(() => null);

    const [geminiResult, scraperResult] = await Promise.allSettled([
      geminiPromise,
      scraperPromise
    ]);

    if (geminiResult.status === 'rejected' || !geminiResult.value.ok) {
        throw new Error(`Gemini API error`);
    }

    const data = await geminiResult.value.json();
    let aiData: Partial<EventCard> = { title: query };

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/^```json/im, '').replace(/```$/im, '').trim();
      try {
        aiData = JSON.parse(text) as Partial<EventCard>;
        // Force the Maps URL to be strictly deterministic to avoid AI coordinate hallucinations
        aiData.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((aiData.title || query) + ' Tulum')}`;
        
        // Ensure WhatsApp number matches the Phone number automatically if missing
        if (aiData.contactInfo?.phone && !aiData.contactInfo?.whatsapp) {
          aiData.contactInfo.whatsapp = aiData.contactInfo.phone;
        }
      } catch (e) {
        console.error("Failed to parse Gemini JSON:", e);
      }
    }

    // Safely inject reliable image from the proxy scraper
    if (scraperResult.status === 'fulfilled' && scraperResult.value?.photos?.[0]?.url) {
      aiData.imageUrl = scraperResult.value.photos[0].url;
    }

    return aiData;
  } catch (err) {
    console.error("AI Search with Gemini failed:", err);
  }

  return {
    title: query,
    description: `Failed to fetch AI details for ${query}. Please check console for errors.`,
    tags: ['Error']
  };
};

export interface AIReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
}

export const fetchRealGoogleReviews = async (query: string): Promise<AIReview[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return [];

  const prompt = `Find and return exactly 5 real, authentic Google Reviews for "${query}".
  Format the response as a valid JSON array of objects. Do NOT use markdown code blocks (\`\`\`json). Just the raw JSON.
  Each object MUST have:
  - "author_name" (string)
  - "rating" (number between 1 and 5)
  - "text" (string, the review itself, at least 2 sentences)
  - "relative_time_description" (string, e.g. "2 months ago")
  - "profile_photo_url" (string, make up a random pravatar.cc url uniquely seeded by their name if you can't find one: 'https://i.pravatar.cc/150?u=' + author_name)`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { temperature: 0.1 }
      })
    });

    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/^```json/im, '').replace(/```$/im, '').trim();
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse Gemini Google Reviews JSON:", e);
      }
    }
  } catch (err) {
    console.error("AI Google Reviews fetch failed:", err);
  }

  return [];
};
