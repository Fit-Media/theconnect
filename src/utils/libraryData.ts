import type { HiddenDetails } from '../types';

export interface LibraryItem {
  id: string;
  category: 'Dining' | 'Nightlife' | 'Experiences' | 'Survival';
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  isGoldKey?: boolean;
  websiteUrl?: string;
  googleMapsUrl?: string;
  placeId?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  hiddenDetails?: HiddenDetails;
}

export const mockLibraryData: LibraryItem[] = [
  // Dining
  {
    id: 'lib_rosa_negra',
    category: 'Dining',
    title: 'Rosa Negra',
    description: 'High-energy dining experience with Latin American cuisine, sparklers, and live bongo drums.',
    tags: ['Dinner', 'Party', 'Upscale'],
    imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=800',
    websiteUrl: 'https://rosanegra.com.mx/en',
    googleMapsUrl: 'https://maps.google.com/?q=Rosa+Negra+Tulum',
    contactInfo: { phone: '+529841234567', email: 'hola@rosanegra.com.mx', whatsapp: '529841234567' }
  },
  {
    id: 'lib_ilios',
    category: 'Dining',
    title: 'Ilios Greek Estiatorio',
    description: 'Stunning architecture, plate smashing, and fire shows. Mediterranean fine dining.',
    tags: ['Dinner', 'Show', 'Greek'],
    imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=800',
    websiteUrl: 'https://iliosrestaurante.com.mx/',
    googleMapsUrl: 'https://maps.google.com/?q=Ilios+Greek+Estiatorio+Tulum',
    contactInfo: { phone: '+529848765432', whatsapp: '529848765432' }
  },
  {
    id: 'lib_honorio',
    category: 'Dining',
    title: 'Taqueria Honorio',
    description: 'The absolute best cochinita pibil tacos in Tulum. Go for an early cheap and authentic breakfast.',
    tags: ['Breakfast', 'Authentic', 'Must Do'],
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
    isGoldKey: true,
    googleMapsUrl: 'https://maps.app.goo.gl/TaqueriaHonorio',
    websiteUrl: 'https://www.facebook.com/taqueriahonorio/'
  },
  
  // Nightlife
  {
    id: 'lib_audis',
    category: 'Nightlife',
    title: 'The Audis',
    description: 'The shifting weekly underground parties spanning various beach clubs. A Tulum staple.',
    tags: ['Late Night', 'House Music', 'Beach'],
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    isGoldKey: true,
    websiteUrl: 'https://theaudis.com'
  },
  {
    id: 'lib_vagalume',
    category: 'Nightlife',
    title: 'Vagalume',
    description: 'Famous bohemian beach club with the iconic hand bridge and resident international DJs.',
    tags: ['Beach Club', 'Sunset', 'Electronic'],
    imageUrl: 'https://images.unsplash.com/photo-1540151812223-c30b3fab58e6?auto=format&fit=crop&q=80&w=800',
    websiteUrl: 'https://vagalume-tulum.com/',
    googleMapsUrl: 'https://maps.google.com/?q=Vagalume+Tulum',
    contactInfo: { phone: '+529841122334', whatsapp: '529841122334' }
  },

  // Experiences
  {
    id: 'lib_cenote_dos_ojos',
    category: 'Experiences',
    title: 'Cenote Dos Ojos',
    description: 'Incredible underwater cave system perfect for both diving and snorkeling. Crystal clear water.',
    tags: ['Nature', 'Active', 'Morning'],
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=800',
    isGoldKey: true,
    googleMapsUrl: 'https://maps.google.com/?q=Cenote+Dos+Ojos'
  },
  {
    id: 'lib_ruins',
    category: 'Experiences',
    title: 'Tulum Ruins',
    description: 'Ancient Mayan port city perched on a cliff above the Caribbean Sea.',
    tags: ['History', 'Culture', 'Views'],
    imageUrl: 'https://images.unsplash.com/photo-1504150558569-07860b404d5f?auto=format&fit=crop&q=80&w=800',
    googleMapsUrl: 'https://maps.google.com/?q=Tulum+Ruins'
  },

  // Survival
  {
    id: 'lib_verified_taxis',
    category: 'Survival',
    title: 'Verified Taxis',
    description: 'List of safe, verified WhatsApp taxi numbers with standard negotiated rates from the Hotel Zone.',
    tags: ['Logistics', 'Safety', 'Transport'],
    imageUrl: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&q=80&w=800',
    isGoldKey: true,
    contactInfo: { whatsapp: '529841112222' }
  },
  {
    id: 'lib_atms',
    category: 'Survival',
    title: 'Safe ATMs',
    description: 'Map of reliable, low-fee ATMs that dispense both Pesos and USD securely.',
    tags: ['Money', 'Safety', 'Essentials'],
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800',
    googleMapsUrl: 'https://maps.google.com/?q=Tulum+ATM'
  }
];
