import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { useItineraryStore } from '../store/useItineraryStore';
import { extractCoordinatesFromUrl, DEFAULT_TULUM_COORDS } from '../utils/geoUtils';

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapPane: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: apiKey });
  const { days, activeDayId, selectEvent, selectedEventId } = useItineraryStore();
  const mapRef = useRef<google.maps.Map | null>(null);

  const activeDay = days.find(d => d.id === activeDayId);
  const events = activeDay?.events || [];

  const markers = useMemo(() => {
    return events.map((event, index) => {
      let position = DEFAULT_TULUM_COORDS;
      if (event.coordinates?.lat && event.coordinates?.lng) {
        position = { lat: event.coordinates.lat, lng: event.coordinates.lng };
      } else {
        const extracted = extractCoordinatesFromUrl(event.googleMapsUrl);
        if (extracted) position = extracted;
      }
      return { event, position, index };
    });
  }, [events]);

  const path = markers.map(m => m.position);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidBounds = false;
      markers.forEach((marker) => {
        // avoid extending to null/NaN bounds
        if (marker.position && !isNaN(marker.position.lat) && !isNaN(marker.position.lng)) {
          bounds.extend(marker.position);
          hasValidBounds = true;
        }
      });
      
      if (hasValidBounds) {
        mapRef.current.fitBounds(bounds, { top: 75, right: 75, bottom: 75, left: 75 });
        
        // Prevent over-zooming for a single marker or closely clustered markers
        if (markers.length === 1) {
          setTimeout(() => {
            if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 15) {
              mapRef.current.setZoom(15);
            }
          }, 100);
        }
      }
    }
  }, [markers, isLoaded]);

  if (loadError) {
    return (
      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-red-500 bg-black/50">
        <p className="font-serif">Map Initialization Error</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-white/50 tracking-widest uppercase bg-black/20">
        <p>Initializing Map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_TULUM_COORDS}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: true, // cleaner look
          zoomControl: true,
        }}
      >
        {path.length > 1 && (
          <PolylineF
            path={path}
            options={{
              strokeColor: '#D4AF37', // Gold
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
        
        {markers.map((marker) => (
          <MarkerF
            key={marker.event.id}
            position={marker.position}
            onClick={() => selectEvent(marker.event.id)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: marker.event.id === selectedEventId ? 10 : 8,
              fillColor: marker.event.id === selectedEventId ? '#FFF' : '#D4AF37', 
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: marker.event.id === selectedEventId ? '#D4AF37' : '#FFFFFF',
            }}
            label={{
              text: (marker.index + 1).toString(),
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '10px'
            }}
          />
        ))}
      </GoogleMap>
      
      {/* Decorative inner shadow styling */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10" />
    </div>
  );
};

export default MapPane;
