import React, { useState } from 'react';
import type { EventCard as EventCardType } from '../types';
import { Phone, Mail, MessageCircle, FileText, ChevronDown, ChevronUp, GripVertical, Key, MapPin, Globe, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItineraryStore, getTravelConflicts } from '../store/useItineraryStore';

interface EventCardProps {
  event: EventCardType;
  onDragStart: (e: React.DragEvent, eventId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, destEventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDragStart, onDragOver, onDrop }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { selectedEventId, selectEvent, days } = useItineraryStore();
  const isSelected = selectedEventId === event.id;

  const conflicts = getTravelConflicts(days);
  const hasConflict = conflicts.has(event.id);

  const handleWhatsAppClick = (e: React.MouseEvent, number?: string) => {
    e.stopPropagation();
    if (!number) return;
    const greeting = encodeURIComponent("Hola! Soy amigo de [Your Name]. ¿Nos puedes echar la mano con ");
    window.open(`https://wa.me/${number}?text=${greeting}`, '_blank');
  };

  const allMedia = React.useMemo(() => {
    const list = [];
    if (event.imageUrl) list.push({ type: 'image', url: event.imageUrl });
    if (event.media) list.push(...event.media);
    return list;
  }, [event.imageUrl, event.media]);

  const [mediaIdx, setMediaIdx] = useState(0);

  React.useEffect(() => {
    if (allMedia.length <= 1) return;
    const interval = setInterval(() => {
      setMediaIdx(prev => (prev + 1) % allMedia.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allMedia.length]);

  return (
    <motion.div
      draggable
      onDragStart={(e: any) => onDragStart(e, event.id)}
      onDragOver={onDragOver}
      onDrop={(e: any) => onDrop(e, event.id)}
      onClick={() => selectEvent(event.id)}
      whileTap={{ scale: 1.05 }}
      className={`glass-panel p-4 rounded-xl mb-4 text-sand relative group cursor-grab active:cursor-grabbing transition-all ${event.isGoldKey ? 'border border-gold/50 shadow-[0_0_25px_rgba(212,175,55,0.3)]' : ''} ${isSelected ? 'ring-2 ring-gold' : ''}`}
    >
      {/* Top Right Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {hasConflict && (
          <div className="text-amber-500 animate-pulse" title="Scheduling Conflict Detected">
            <AlertTriangle size={18} />
          </div>
        )}
        {event.isGoldKey && (
          <div className="text-gold" title="Insider Connect">
            <Key size={18} />
          </div>
        )}
        <div className="text-white/30 group-hover:text-gold transition-colors">
          <GripVertical size={20} />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gold mb-1 pr-6">{event.title}</h3>
      {(event.time || event.location) && (
        <div className="text-sm text-sand/90 font-medium mb-2 flex items-center flex-wrap gap-1">
          {event.time && <span>{event.time}</span>}
          {event.time && event.location && <span>•</span>}
          {event.location && (
            event.googleMapsUrl ? (
              <a href={event.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {event.location} <MapPin size={12} />
              </a>
            ) : (
              <span>{event.location}</span>
            )
          )}
          {!event.location && event.googleMapsUrl && (
              <a href={event.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                View on Map <MapPin size={12} />
              </a>
          )}
        </div>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {event.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border bg-white/5 border-white/10 text-sand/80">
              {tag}
            </span>
          ))}
        </div>
      )}

      {event.description && <p className="text-sm mb-4 leading-relaxed">{event.description}</p>}
      
      {event.aiFactsAndTips && (
        <div className="bg-gold/10 p-3 rounded-lg border border-gold/20 flex gap-3 text-sm mb-4 mt-2">
          <Sparkles className="text-gold shrink-0 mt-0.5" size={16} />
          <p className="text-gold/90 italic leading-relaxed">{event.aiFactsAndTips}</p>
        </div>
      )}

      {/* Media Rendering */}
      {allMedia.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 relative h-40 bg-black/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={mediaIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full"
            >
              {allMedia[mediaIdx].type === 'image' && (
                <img src={allMedia[mediaIdx].url} alt="Event Media" className="w-full h-full object-cover" />
              )}
              {allMedia[mediaIdx].type === 'youtube' && (
                <iframe 
                  className="w-full h-full" 
                  src={allMedia[mediaIdx].url} 
                  title="YouTube video" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                />
              )}
              {allMedia[mediaIdx].type === 'video' && (
                <video src={allMedia[mediaIdx].url} controls className="w-full h-full object-cover" playsInline />
              )}
            </motion.div>
          </AnimatePresence>
          {allMedia.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {allMedia.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === mediaIdx ? 'w-4 bg-gold' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Actions & Links */}
      {(event.contactInfo || event.websiteUrl) && (
        <div className="flex gap-2 mt-4">
          {event.contactInfo?.phone && (
            <a href={`tel:${event.contactInfo.phone}`} onClick={(e) => e.stopPropagation()} className="glass-button p-2 rounded-full flex-1 flex justify-center items-center">
              <Phone size={18} />
            </a>
          )}
          {event.contactInfo?.whatsapp && (
            <button onClick={(e) => handleWhatsAppClick(e, event.contactInfo?.whatsapp)} className="glass-button p-2 rounded-full flex-1 flex justify-center items-center text-green-400">
              <MessageCircle size={18} />
            </button>
          )}
          {event.contactInfo?.email && (
            <a href={`mailto:${event.contactInfo.email}`} onClick={(e) => e.stopPropagation()} className="glass-button p-2 rounded-full flex-1 flex justify-center items-center">
              <Mail size={18} />
            </a>
          )}
          {event.googleMapsUrl && (
            <a href={event.googleMapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="glass-button p-2 rounded-full flex-1 flex justify-center items-center text-red-400">
              <MapPin size={18} />
            </a>
          )}
          {event.websiteUrl && (
            <a href={event.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="glass-button p-2 rounded-full flex-1 flex justify-center items-center text-blue-300">
              <Globe size={18} />
            </a>
          )}
        </div>
      )}

      {/* Hidden Drawer Toggle */}
      {event.hiddenDetails && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-gold/70 hover:text-gold transition-colors py-2 border-t border-white/10"
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {isOpen ? 'Hide Details' : 'View Booking Details'}
        </button>
      )}

      {/* Hidden Details Drawer */}
      {event.hiddenDetails && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="pt-3 pb-1 space-y-2 text-sm text-white/80">
            {event.hiddenDetails.confirmationNumber && (
              <p><span className="text-gold font-medium">Confirmation:</span> {event.hiddenDetails.confirmationNumber}</p>
            )}
            {event.hiddenDetails.address && (
              <p><span className="text-gold font-medium">Address:</span> {event.hiddenDetails.address}</p>
            )}
            {event.hiddenDetails.pdfUrl && (
              <a href={event.hiddenDetails.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gold hover:underline mt-2">
                <FileText size={16} /> View Booking PDF
              </a>
            )}
            {event.hiddenDetails.notes && (
              <div className="mt-2 bg-black/30 p-3 rounded text-xs border border-white/5">
                {event.hiddenDetails.notes}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
