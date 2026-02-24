export interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface HiddenDetails {
  confirmationNumber?: string;
  pdfUrl?: string; // Could be a local path or external link
  notes?: string;
  address?: string;
}

export interface Media {
  type: 'image' | 'video' | 'youtube';
  url: string;
}

export interface EventCard {
  id: string;
  title: string;
  description?: string;
  time?: string;
  location?: string;
  contactInfo?: ContactInfo;
  media?: Media[];
  hiddenDetails?: HiddenDetails;
  isGoldKey?: boolean;
  tags?: string[];
  websiteUrl?: string;
  googleMapsUrl?: string;
  placeId?: string;
  imageUrl?: string; // AI fetched or manually added image for the card
  aiFactsAndTips?: string; // AI generated facts and tips
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Day {
  id: string;
  date: string; // e.g., 'Day 1' or 'Mon, 12th'
  events: EventCard[];
}
