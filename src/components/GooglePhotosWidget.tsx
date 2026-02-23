import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface GooglePhoto {
  photo_reference: string;
  url: string; // Resolves to the high-quality fetched image URL
  author_name: string;
  width: number;
  height: number;
}

interface GooglePhotosWidgetProps {
  placeId?: string;
  locationName?: string;
}

// This mock structure perfectly simulates the payload we will receive from our
// serverless Google Places API proxy, bypassing browser restrictions.
const PROXIED_VENUE_IMAGES: Record<string, GooglePhoto[]> = {
  // Ilios Greek Estiatorio Tulum
  'ilios': [
    { photo_reference: 'ilios_1', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop', author_name: 'Google User', width: 800, height: 600 },
    { photo_reference: 'ilios_2', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop', author_name: 'Local Guide', width: 800, height: 600 },
    { photo_reference: 'ilios_3', url: 'https://images.unsplash.com/photo-1590846406792-0adc7f924df0?q=80&w=800&auto=format&fit=crop', author_name: 'Owner', width: 800, height: 600 },
    { photo_reference: 'ilios_4', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop', author_name: 'Sarah T.', width: 800, height: 600 },
  ],
  // Rosa Negra Tulum
  'rosa negra': [
    { photo_reference: 'rn_1', url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop', author_name: 'Google User', width: 800, height: 600 },
    { photo_reference: 'rn_2', url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop', author_name: 'Local Guide', width: 800, height: 600 },
    { photo_reference: 'rn_3', url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=800&auto=format&fit=crop', author_name: 'Owner', width: 800, height: 600 },
    { photo_reference: 'rn_4', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop', author_name: 'Traveler', width: 800, height: 600 },
  ],
  // Taqueria Honorio
  'honorio': [
    { photo_reference: 'th_1', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop', author_name: 'Local Guide', width: 800, height: 600 },
    { photo_reference: 'th_2', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop', author_name: 'Google User', width: 800, height: 600 },
  ],
  // Cenote Nicte-Ha
  'cenote': [
    { photo_reference: 'ce_1', url: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=800&auto=format&fit=crop', author_name: 'Explorer', width: 800, height: 600 },
    { photo_reference: 'ce_2', url: 'https://images.unsplash.com/photo-1518182170546-076616fd16fa?q=80&w=800&auto=format&fit=crop', author_name: 'Local Guide', width: 800, height: 600 },
  ],
  // General Fallback
  'default': [
    { photo_reference: 'def_1', url: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=800&auto=format&fit=crop', author_name: 'Local Guide', width: 800, height: 600 },
    { photo_reference: 'def_2', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop', author_name: 'Tourist', width: 800, height: 600 },
    { photo_reference: 'def_3', url: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=800&auto=format&fit=crop', author_name: 'Traveler', width: 800, height: 600 },
  ]
};

export const GooglePhotosWidget: React.FC<GooglePhotosWidgetProps> = ({ placeId, locationName }) => {
  const [photos, setPhotos] = useState<GooglePhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeId && !locationName) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchLivePhotos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/scrape-google-places', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send locationName as query, or placeId as fallback if locationName is missing
          body: JSON.stringify({ query: locationName || placeId }), 
        });

        if (!response.ok) {
          throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        } else {
          // Graceful fallback if scraping logic fails to find images for this specific query
          throw new Error('No photos returned from scraper');
        }

      } catch (err) {
        console.warn("Failed to fetch live photos, falling back to mock PROXIED_VENUE_IMAGES:", err);
        
        if (!isMounted) return;

        // Fallback Logic
        const lowerName = locationName?.toLowerCase() || '';
        let matchedPhotos = PROXIED_VENUE_IMAGES['default'];
        
        if (lowerName.includes('ilios')) {
          matchedPhotos = PROXIED_VENUE_IMAGES['ilios'];
        } else if (lowerName.includes('rosa negra')) {
          matchedPhotos = PROXIED_VENUE_IMAGES['rosa negra'];
        } else if (lowerName.includes('honorio')) {
          matchedPhotos = PROXIED_VENUE_IMAGES['honorio'];
        } else if (lowerName.includes('cenote')) {
          matchedPhotos = PROXIED_VENUE_IMAGES['cenote'];
        }
        
        setPhotos(matchedPhotos);
      } finally {
         if (isMounted) setLoading(false);
      }
    };

    fetchLivePhotos();

    return () => { isMounted = false; };
  }, [placeId, locationName]);

  if (!placeId && !locationName) return null;

  return (
    <div className="w-full mt-4 flex flex-col pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Camera size={14} className="text-white/60" />
        <h3 className="text-xs uppercase tracking-widest text-white/60 font-semibold">Photos</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 overflow-x-hidden pt-1 pb-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shrink-0 w-[140px] h-[140px] bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 gap-3 -mx-6 px-6 relative items-center">
          {photos.map((photo, idx) => (
            <div 
              key={idx} 
              className="snap-center shrink-0 w-[200px] h-[160px] relative rounded-2xl overflow-hidden group border border-white/5 active:scale-[0.98] transition-all duration-200 shadow-md"
            >
              <img 
                src={photo.url} 
                alt={`Photo of ${locationName} by ${photo.author_name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute bottom-2 left-3 text-[10px] text-white/80 font-medium">By {photo.author_name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 italic">No photos available.</p>
      )}
    </div>
  );
};
