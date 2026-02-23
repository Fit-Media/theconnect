
const queries = ["Rosa Negra Tulum", "Extreme Adventure Eco Park Tulum", "Cenote Dos Ojos"];

const testScraper = async () => {
  for (const query of queries) {
    console.log(`\nTesting scraper for: ${query}`);
    try {
      const response = await fetch('http://localhost:3001/api/scrape-google-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        console.log(`Found ${data.photos.length} photos.`);
        console.log(`First photo URL: ${data.photos[0].url}`);
      } else {
        console.log("No photos found or error returned.");
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error("Test failed:", error);
    }
  }
};

testScraper();

testScraper();
