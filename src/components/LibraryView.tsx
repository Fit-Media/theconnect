import React, { useState } from 'react';
import { Sparkles, Plus, X, Phone, Mail, Globe, MapPin, MessageCircle } from 'lucide-react';
import type { LibraryItem } from '../utils/libraryData';
import { useItineraryStore } from '../store/useItineraryStore';
import { v4 as uuidv4 } from 'uuid';

export const LibraryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<LibraryItem['category'] | 'All'>('All');
  const [addingItem, setAddingItem] = useState<LibraryItem | null>(null);
  const { days, addEvent, libraryItems, selectLibraryItem, selectedLibraryItemId } = useItineraryStore();

  const categories = ['All', 'Dining', 'Nightlife', 'Experiences', 'Survival'];

  const filteredData = selectedCategory === 'All' 
    ? libraryItems 
    : libraryItems.filter(item => 
        item.category === selectedCategory || 
        item.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase())
      );

  const handleAddToDay = (dayId: string) => {
    if (!addingItem) return;
    
    // Convert LibraryItem to EventCard format
    addEvent(dayId, {
      id: uuidv4(),
      title: addingItem.title,
      description: addingItem.description,
      tags: addingItem.tags,
      time: 'TBD',
      location: addingItem.title,
      isGoldKey: addingItem.isGoldKey,
      websiteUrl: addingItem.websiteUrl,
      googleMapsUrl: addingItem.googleMapsUrl,
      contactInfo: addingItem.contactInfo,
      imageUrl: addingItem.imageUrl,
      media: addingItem.imageUrl ? [{ type: 'image', url: addingItem.imageUrl }] : undefined
    });
    
    setAddingItem(null); // Close modal
  };

  return (
    <div className="w-full h-full p-8 overflow-y-auto pb-32 animate-in fade-in duration-500">
      
      {/* Header & Categories */}
      <div className="max-w-7xl mx-auto mb-12">
        <h2 className="text-3xl font-serif text-gold mb-6 font-bold tracking-wide">
          Discover Connects
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as typeof selectedCategory)}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredData.map(item => (
          <div 
            key={item.id}
            onClick={() => selectLibraryItem(item.id)}
            className={`group cursor-pointer relative rounded-2xl overflow-hidden bg-black/40 transition-all duration-500 flex flex-col h-[400px] border ${selectedLibraryItemId === item.id ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-gold/30'}`}
          >
            {/* Background Image Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-6">
              
              {/* Top: Category & Add Button */}
              <div className="flex justify-between items-start mb-auto">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white border border-white/10">
                  {item.category}
                </span>

                <button 
                  onClick={() => setAddingItem(item)}
                  className="bg-gold hover:bg-gold-light text-black p-2 md:px-4 md:py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.4)] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                >
                  <Plus size={14} /> <span className="hidden md:inline">Add to Itinerary</span>
                </button>
              </div>

              {/* Bottom: Title & Description */}
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-serif text-white">{item.title}</h3>
                  {item.isGoldKey && (
                    <Sparkles className="text-gold animate-pulse" size={18} />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-white/70 line-clamp-3 mb-4 transition-all duration-500">
                  {item.description}
                </p>

                {/* Contact Icons */}
                <div className="flex gap-6 transition-all duration-500">
                  {item.websiteUrl && (
                    <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold transition-colors" title="Website">
                      <Globe size={32} />
                    </a>
                  )}
                  {item.googleMapsUrl && (
                    <a href={item.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold transition-colors" title="Google Maps">
                      <MapPin size={32} />
                    </a>
                  )}
                  {item.contactInfo?.phone && (
                    <a href={`tel:${item.contactInfo.phone}`} className="text-white/40 hover:text-gold transition-colors" title="Call">
                      <Phone size={32} />
                    </a>
                  )}
                  {item.contactInfo?.email && (
                    <a href={`mailto:${item.contactInfo.email}`} className="text-white/40 hover:text-gold transition-colors" title="Email">
                      <Mail size={32} />
                    </a>
                  )}
                  {item.contactInfo?.whatsapp && (
                    <a href={`https://wa.me/${item.contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold transition-colors" title="WhatsApp">
                      <MessageCircle size={32} />
                    </a>
                  )}
                </div>
                
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add to Day Modal */}
      {addingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddingItem(null)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h3 className="font-serif text-xl text-gold">Select Day</h3>
              <button onClick={() => setAddingItem(null)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              <p className="text-sm text-white/70 mb-4 px-2">
                Where would you like to add <span className="text-white font-bold">{addingItem.title}</span>?
              </p>
              
              {days.map((day, index) => (
                <button
                  key={day.id}
                  onClick={() => handleAddToDay(day.id)}
                  className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-gold/30 hover:bg-white/5 transition-colors flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-serif text-lg group-hover:text-gold transition-colors">Day {index + 1}</span>
                    <span className="text-xs text-white/50 uppercase tracking-widest">{day.date}</span>
                  </div>
                  <Plus size={18} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
