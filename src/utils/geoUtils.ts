export const DEFAULT_TULUM_COORDS = { lat: 20.2114, lng: -87.4653 };

/**
 * Extracts latitude and longitude from a Google Maps URL if present.
 * Looks for patterns like @20.2114,-87.4653 or similar parameters.
 * @param url Google Maps URL
 * @returns { lat: number, lng: number } | null
 */
export const extractCoordinatesFromUrl = (url?: string): { lat: number, lng: number } | null => {
  if (!url) return null;

  // Pattern 1: @lat,lng
  const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const atMatch = url.match(atRegex);
  if (atMatch && atMatch.length >= 3) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2])
    };
  }

  // Pattern 2: query parameter q=lat,lng or query=lat,lng
  const qRegex = /[?&](?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const qMatch = url.match(qRegex);
  if (qMatch && qMatch.length >= 3) {
    return {
      lat: parseFloat(qMatch[1]),
      lng: parseFloat(qMatch[2])
    };
  }

  return null;
};
