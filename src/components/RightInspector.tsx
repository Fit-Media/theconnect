import React, { useState } from 'react';
import { useItineraryStore } from '../store/useItineraryStore';
import { X, MapPin, Clock, Phone, MessageCircle, Mail, Sparkles, Globe, Trash2, Upload } from 'lucide-react';
import type { EventCard } from '../types';
import type { LibraryItem } from '../utils/libraryData';
import { aiSearch } from '../utils/ai';
import { GoogleReviewsWidget } from './GoogleReviewsWidget';
import { GooglePhotosWidget } from './GooglePhotosWidget';
import { storage } from '../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

interface RightInspectorProps {
  onClose?: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({ onClose }) => {
  const { 
    days, selectedEventId, selectEvent, addEvent, updateEvent, removeEvent, 
    libraryItems, selectedLibraryItemId, selectLibraryItem, updateLibraryItem, removeLibraryItem, addLibraryItem 
  } = useItineraryStore();
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddTarget, setQuickAddTarget] = useState<'itinerary' | 'discovery'>('itinerary');
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const selectedEvent = days.flatMap(d => d.events).find(e => e.id === selectedEventId);
  const selectedDayId = days.find(d => d.events.some(e => e.id === selectedEventId))?.id;
  const selectedLibraryItem = libraryItems.find(i => i.id === selectedLibraryItemId);

  const activeItem = selectedEvent || selectedLibraryItem;
  const isLibraryItem = !!selectedLibraryItem;

  // Local state for editing form (can hold either type)
  const [editForm, setEditForm] = useState<Partial<EventCard & LibraryItem>>({});

  // Sync form when selected event/item changes
  React.useEffect(() => {
    if (activeItem) {
      setEditForm(JSON.parse(JSON.stringify(activeItem))); // Deep copy
      setIsEditing(false); // Reset edit state on new selection
      setTagInput(activeItem.tags?.join(', ') || '');
    }
  }, [activeItem?.id, activeItem]);

  const handleWhatsAppClick = (number?: string) => {
    if (!number) return;
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=Hola!%20Nos%20gustar%C3%ADa%20m%C3%A1s%20informaci%C3%B3n.`, '_blank');
  };

  const handleQuickAdd = async () => {
    if (!quickAddText.trim() || isSearching) return;
    
    setIsSearching(true);

    // Really basic parsing logic: "Day X - Title" or just "Title"
    const match = quickAddText.match(/day\s*(\d+)\s*[-:]\s*(.+)/i);
    let targetDayNum = 1;
    let title = quickAddText;

    if (match) {
      targetDayNum = parseInt(match[1], 10);
      title = match[2].trim();
    }

    // Bound check
    const dayIndex = Math.max(0, Math.min(7, targetDayNum - 1));
    const targetDayId = `day-${dayIndex + 1}`;

    const aiData = await aiSearch(title);

    const determineCategory = (tags: string[] = []): LibraryItem['category'] => {
      const tagString = tags.join(' ').toLowerCase();
      if (tagString.includes('nightlife') || tagString.includes('club') || tagString.includes('bar') || tagString.includes('party')) return 'Nightlife';
      if (tagString.includes('dining') || tagString.includes('food') || tagString.includes('restaurant') || tagString.includes('breakfast') || tagString.includes('lunch') || tagString.includes('dinner')) return 'Dining';
      if (tagString.includes('survival') || tagString.includes('safety') || tagString.includes('emergency') || tagString.includes('transport')) return 'Survival';
      return 'Experiences';
    };
    
    if (quickAddTarget === 'itinerary') {
      const newEvent: EventCard = {
        id: `qa-${Date.now()}`,
        title: title,
        isGoldKey: false,
        ...aiData
      };

      if (aiData.imageUrl && (!newEvent.media || newEvent.media.length === 0)) {
        newEvent.media = [{ type: 'image', url: aiData.imageUrl }];
      }

      addEvent(targetDayId, newEvent);
    } else {
      // Add to Library/Discovery
      addLibraryItem({
        id: `lib-qa-${Date.now()}`,
        title: title,
        category: determineCategory(aiData.tags),
        description: aiData.description || 'Quick added via Gemini',
        tags: aiData.tags || [],
        imageUrl: aiData.imageUrl || 'https://images.unsplash.com/photo-1544605937-23edacfa2bc0?auto=format&fit=crop&q=80&w=800', // Default placeholder
        googleMapsUrl: aiData.googleMapsUrl,
        websiteUrl: aiData.websiteUrl,
        contactInfo: aiData.contactInfo,
        isGoldKey: false
      });
    }

    setQuickAddText('');
    setIsSearching(false);
  };

  const handleAISearchEdit = async () => {
    if (!editForm.title || isSearching) return;
    setIsSearching(true);
    const aiData = await aiSearch(editForm.title);
    setEditForm(prev => ({ ...prev, ...aiData }));
    setIsSearching(false);
  };

  const handleSaveEdit = () => {
    if (editForm.id) {
      const finalForm = { ...editForm };
      
      // Update media array if imageUrl changed for EventCards
      if (!isLibraryItem && finalForm.imageUrl) {
        finalForm.media = [{ type: 'image', url: finalForm.imageUrl }];
      }

      if (isLibraryItem) {
        updateLibraryItem(finalForm as LibraryItem);
      } else if (selectedDayId) {
        updateEvent(selectedDayId, finalForm as EventCard);
      }
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for compression
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to 70% quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const storageRef = ref(storage, `uploads/${Date.now()}_image.jpg`);
        uploadString(storageRef, dataUrl, 'data_url').then((snapshot) => {
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            handleEditChange('imageUrl', downloadURL);
          });
        }).catch(err => {
          console.error("Firebase Storage Upload Error:", err);
          alert("Failed to upload image. Please try again.");
        });
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (activeItem) {
      if (confirm(`Are you sure you want to delete "${activeItem.title}"?`)) {
        if (isLibraryItem) {
          removeLibraryItem(activeItem.id);
        } else if (selectedDayId && selectedEventId) {
          removeEvent(selectedDayId, selectedEventId);
          selectEvent(null);
        }
        setIsEditing(false);
      }
    }
  }

  const handleEditChange = (path: string, value: unknown) => {
    setEditForm(prev => {
      const updated = { ...prev } as Record<string, unknown>;
      const keys = path.split('.');
      if (keys.length === 1) {
        updated[keys[0]] = value;
      } else if (keys.length === 2) {
        if (!updated[keys[0]]) updated[keys[0]] = {};
        (updated[keys[0]] as Record<string, unknown>)[keys[1]] = value;
      }
      return updated as Partial<EventCard & LibraryItem>;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1A1A1A]/80 border-l border-white/10 p-8 overflow-y-auto shrink-0 z-20 backdrop-blur-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      {activeItem ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-start">
            {isEditing ? (
              <input
                type="text"
                value={editForm.title || ''}
                onChange={(e) => handleEditChange('title', e.target.value)}
                className="text-3xl font-serif text-gold leading-tight tracking-tight bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all w-full mr-4 shadow-inner"
              />
            ) : (
              <h2 className="text-3xl font-serif text-gold leading-tight tracking-tight shadow-sm">{activeItem.title}</h2>
            )}
            <div className="flex gap-2 shrink-0">
               <button 
                  onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} 
                  className="bg-white/[0.05] hover:bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              <button onClick={handleDelete} className="bg-white/[0.05] hover:bg-red-500/20 text-white/50 hover:text-red-400 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0" title="Delete Item">
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => { 
                  selectEvent(null); 
                  selectLibraryItem(null);
                  setIsEditing(false); 
                  onClose?.(); 
                }} 
                className="bg-white/[0.1] hover:bg-white/20 text-white/70 hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm border border-white/5 shrink-0"
                title="Close Inspector"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {isEditing ? (
              <>
               {editForm.title && (
                 <button 
                  onClick={handleAISearchEdit}
                  disabled={isSearching}
                  className="w-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-xl py-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                 >
                   <Sparkles size={18} />
                   <span className="text-sm font-semibold">{isSearching ? 'Searching...' : 'AI Search & Fill Details'}</span>
                 </button>
               )}
               <div className="space-y-2">
                 <label className="text-xs font-medium text-white/50 mb-1.5 block">Time</label>
                 <input
                  type="text"
                  placeholder="e.g. 2:00 PM"
                  value={editForm.time || ''}
                  onChange={(e) => handleEditChange('time', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-medium text-white/50 mb-1.5 block">Tags (comma separated)</label>
                 <input
                  type="text"
                  placeholder="e.g. Dinner, Party, Must Do"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    handleEditChange('tags', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean));
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-medium text-white/50 mb-1.5 block">Location Name</label>
                 <input
                  type="text"
                  placeholder="e.g. Tulum Centro"
                  value={editForm.location || ''}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-medium text-white/50 mb-1.5 block">Google Maps Link</label>
                 <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={editForm.googleMapsUrl || ''}
                  onChange={(e) => handleEditChange('googleMapsUrl', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-medium text-white/50 mb-1.5 block">Website URL</label>
                 <input
                  type="text"
                  placeholder="https://..."
                  value={editForm.websiteUrl || ''}
                  onChange={(e) => handleEditChange('websiteUrl', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                 />
               </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Google Place ID (For Reviews)</label>
                  <input
                   type="text"
                   placeholder="e.g. ChIJ..."
                   value={editForm.placeId || ''}
                   onChange={(e) => handleEditChange('placeId', e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 mb-1.5 flex items-center gap-2">
                    Image URL
                    <label className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-colors ml-auto text-[10px] text-white/70">
                      <Upload className="w-3 h-3" />
                      Upload File
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  </label>
                  <input
                   type="text"
                   placeholder="https://images.unsplash.com/..."
                   value={editForm.imageUrl || ''}
                   onChange={(e) => handleEditChange('imageUrl', e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {(!isLibraryItem && editForm.time) && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Clock size={16} className="text-gold" />
                    <span>{editForm.time}</span>
                  </div>
                )}
                {(!isLibraryItem && 'location' in activeItem && activeItem.location) && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin size={16} className="text-gold" />
                    {activeItem.googleMapsUrl ? (
                      <a href={activeItem.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors underline decoration-gold/30 underline-offset-2">
                        {activeItem.location}
                      </a>
                    ) : (
                      <span>{activeItem.location}</span>
                    )}
                  </div>
                )}
                {((isLibraryItem || !('location' in activeItem) || !activeItem.location) && activeItem.googleMapsUrl) && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin size={16} className="text-gold" />
                    <a href={activeItem.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors underline decoration-gold/30 underline-offset-2">
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
           {isEditing ? (
             <>
               <label className="text-xs font-medium text-white/50 mb-1.5 block">Description (Optional)</label>
               <textarea
                  value={editForm.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner resize-none"
               />
               <label className="text-xs font-medium text-white/50 mb-1.5 block mt-4">AI Facts & Tips (Optional)</label>
               <textarea
                  value={editForm.aiFactsAndTips || ''}
                  onChange={(e) => handleEditChange('aiFactsAndTips', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner resize-none"
               />
             </>
           ) : (
             <>
              {activeItem.tags && activeItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeItem.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border bg-white/5 border-white/10 text-sand/90 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {activeItem.description && (
                <p className="text-[15px] text-sand/90 leading-relaxed font-light">{activeItem.description}</p>
              )}
              {editForm.aiFactsAndTips && (
                <div className="bg-gold/10 p-4 rounded-xl border border-gold/20 flex gap-3 text-sm mt-5 shadow-sm backdrop-blur-md">
                  <Sparkles className="text-gold shrink-0 mt-0.5" size={18} />
                  <p className="text-gold/90 italic leading-relaxed">{editForm.aiFactsAndTips}</p>
                </div>
              )}
             </>
           )}
          </div>

          <div className="space-y-4 mt-6 bg-white/[0.02] rounded-2xl p-5 border border-white/[0.05] shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-gold/70 font-semibold mb-3">Contact & Links</h3>
            {isEditing ? (
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/50 mb-1.5 block">Phone (e.g. +52...)</label>
                   <input
                    type="text"
                    value={editForm.contactInfo?.phone || ''}
                    onChange={(e) => handleEditChange('contactInfo.phone', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/50 mb-1.5 block">WhatsApp Number (e.g. 521...)</label>
                   <input
                    type="text"
                    value={editForm.contactInfo?.whatsapp || ''}
                    onChange={(e) => handleEditChange('contactInfo.whatsapp', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/50 mb-1.5 block">Email Address</label>
                   <input
                    type="email"
                    value={editForm.contactInfo?.email || ''}
                    onChange={(e) => handleEditChange('contactInfo.email', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                   />
                 </div>
              </div>
            ) : (
               (activeItem.contactInfo || activeItem.websiteUrl) && (
                <div className="space-y-3">
                  {activeItem.contactInfo && (activeItem.contactInfo.phone || activeItem.contactInfo.whatsapp || activeItem.contactInfo.email) && (
                    <div className="flex gap-3">
                      {activeItem.contactInfo?.phone && (
                        <a href={`tel:${activeItem.contactInfo.phone}`} className="glass-button p-4 rounded-xl flex-1 flex justify-center items-center hover:scale-[1.02] active:scale-[0.98] transition-all bg-white/[0.04]">
                          <Phone size={20} className="text-white/80" />
                        </a>
                      )}
                      {activeItem.contactInfo?.whatsapp && (
                        <button onClick={() => handleWhatsAppClick(activeItem.contactInfo?.whatsapp)} className="glass-button p-4 rounded-xl flex-1 flex justify-center items-center hover:scale-[1.02] active:scale-[0.98] transition-all bg-white/[0.04]">
                          <MessageCircle size={20} className="text-green-400" />
                        </button>
                      )}
                      {activeItem.contactInfo?.email && (
                        <a href={`mailto:${activeItem.contactInfo.email}`} className="glass-button p-4 rounded-xl flex-1 flex justify-center items-center hover:scale-[1.02] active:scale-[0.98] transition-all bg-white/[0.04]">
                          <Mail size={20} className="text-white/80" />
                        </a>
                      )}
                    </div>
                  )}
                  {activeItem.websiteUrl && (
                    <a href={activeItem.websiteUrl} target="_blank" rel="noreferrer" className="glass-button p-4 rounded-xl w-full flex justify-center items-center gap-2 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all bg-white/[0.04] mt-3">
                      <Globe size={18} className="text-blue-300" />
                      <span className="text-sm font-semibold">Visit Website</span>
                    </a>
                  )}
                </div>
              )
            )}
          </div>

          {/* Hidden Details */}
          <div className="space-y-3 mt-6 bg-[#1A1A1A]/80 rounded-2xl p-5 border border-white/[0.05] shadow-inner backdrop-blur-md">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-3">Booking Info</h3>
            {isEditing ? (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/50 mb-1.5 block">Confirmation #</label>
                   <input
                    type="text"
                    value={editForm.hiddenDetails?.confirmationNumber || ''}
                    onChange={(e) => handleEditChange('hiddenDetails.confirmationNumber', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/50 mb-1.5 block">Address Notes</label>
                   <input
                    type="text"
                    value={editForm.hiddenDetails?.address || ''}
                    onChange={(e) => handleEditChange('hiddenDetails.address', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/50 mb-1.5 block">Private Notes</label>
                   <textarea
                    value={editForm.hiddenDetails?.notes || ''}
                    onChange={(e) => handleEditChange('hiddenDetails.notes', e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all shadow-inner resize-none"
                   />
                 </div>
              </div>
            ) : (
                editForm.hiddenDetails ? (
                  <div className="space-y-2">
                    {editForm.hiddenDetails.confirmationNumber && (
                      <p className="text-[15px]"><span className="text-white/50 text-sm">Conf:</span> <span className="text-sand font-medium ml-1">{editForm.hiddenDetails.confirmationNumber}</span></p>
                    )}
                    {editForm.hiddenDetails.address && (
                      <p className="text-[15px]"><span className="text-white/50 text-sm">Address:</span> <span className="text-sand font-medium ml-1">{editForm.hiddenDetails.address}</span></p>
                    )}
                    {editForm.hiddenDetails.notes && (
                      <div className="bg-black/40 p-4 rounded-xl text-sm text-white/80 border border-white/5 mt-3 leading-relaxed shadow-inner">
                        {editForm.hiddenDetails.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 italic font-light">No sensitive details saved.</p>
                )
            )}
          </div>

          {!isEditing && (
            <>
              <GoogleReviewsWidget placeId={activeItem.placeId} locationName={activeItem.title} />
              <GooglePhotosWidget placeId={activeItem.placeId} locationName={activeItem.title} />
            </>
          )}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center relative px-6">
          {onClose && (
            <button onClick={onClose} className="absolute top-0 right-0 p-2 bg-white/[0.05] hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all active:scale-95">
              <X size={16} />
            </button>
          )}
          
          <div className="w-20 h-20 bg-gradient-to-br from-gold/20 to-gold/5 rounded-full flex items-center justify-center mb-6 border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative">
            <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl mix-blend-screen"></div>
            <Sparkles size={32} className={`text-gold relative z-10 ${isSearching ? "animate-pulse" : ""}`} />
          </div>
          
          <h3 className="text-2xl font-serif text-gold tracking-tight mb-2">Gemini Quick-Add</h3>
          <p className="text-sm text-sand/80 font-light mb-8 max-w-[280px]">
            Describe an activity or place, and AI will generate a complete card.
          </p>

          <div className="w-full bg-white/[0.03] backdrop-blur-md rounded-2xl p-5 border border-white/[0.05] shadow-inner">
            <div className="flex bg-black/40 rounded-xl p-1 mb-5 w-full border border-white/5 shadow-inner">
              <button 
                onClick={() => setQuickAddTarget('itinerary')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${quickAddTarget === 'itinerary' ? 'bg-gold text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
              >
                Itinerary
              </button>
              <button 
                onClick={() => setQuickAddTarget('discovery')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${quickAddTarget === 'discovery' ? 'bg-gold text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
              >
                Discovery
              </button>
            </div>

            <div className="relative w-full">
              <input
                type="text"
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                placeholder={isSearching ? "Thinking..." : "e.g. Dinner at Rosa Negra"}
                disabled={isSearching}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-5 pr-14 py-4 text-[15px] text-sand focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all disabled:opacity-50 shadow-inner placeholder:text-white/30"
              />
              <button 
                onClick={handleQuickAdd}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold hover:bg-gold-light text-black rounded-xl p-2.5 transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-50 shadow-md"
              >
                <Sparkles size={18} />
              </button>
            </div>
          </div>
          
          <p className="text-xs font-medium text-white/30 text-center mt-8">
            Select an existing card to view details
          </p>
        </div>
      )}
    </div>
  );
};
