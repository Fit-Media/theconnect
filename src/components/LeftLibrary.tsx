import React from 'react';
import { Search, Map, PhoneCall, Music, FileText, X } from 'lucide-react';

interface LeftLibraryProps {
  onClose?: () => void;
}

export const LeftLibrary: React.FC<LeftLibraryProps> = ({ onClose }) => {
  return (
    <div className="w-full lg:w-80 h-full flex flex-col bg-[#121212]/90 border-r border-white/10 p-4 shrink-0 z-20 backdrop-blur-md">
      <div className="mb-6 pl-2 pt-4 flex justify-between items-center">
        <h2 className="text-xl font-serif text-gold uppercase tracking-widest font-bold">The Library</h2>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
        <input 
          type="text" 
          placeholder="Search Connects..." 
          className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-sand focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      <div className="space-y-8 overflow-y-auto scrollbar-hide flex-1 pb-10">
        <div>
          <h3 className="text-[10px] uppercase text-gold/60 tracking-[0.2em] font-bold mb-3 pl-2">Survival</h3>
          <ul className="space-y-1">
            <li className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3 text-sm text-sand">
                <PhoneCall size={16} className="text-gold opacity-70 group-hover:opacity-100"/> Verified Taxis
              </div>
            </li>
            <li className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3 text-sm text-sand">
                <Map size={16} className="text-gold opacity-70 group-hover:opacity-100"/> Local ATMs Map
              </div>
            </li>
            <li className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3 text-sm text-sand">
                <FileText size={16} className="text-gold opacity-70 group-hover:opacity-100"/> Spanish Cheat Sheet
              </div>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-[10px] uppercase text-gold/60 tracking-[0.2em] font-bold mb-3 pl-2">Experiences</h3>
          <ul className="space-y-1">
            <li className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3 text-sm text-sand">
                <Music size={16} className="text-gold opacity-70 group-hover:opacity-100"/> The Audis (Weekly Venues)
              </div>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-[10px] uppercase text-gold/60 tracking-[0.2em] font-bold mb-3 pl-2">Your Connects</h3>
          {/* Example draggable elements could go here */}
          <div className="border border-white/5 bg-white/5 p-3 rounded-xl mb-3 cursor-grab text-sand">
            <p className="text-sm font-semibold text-gold mb-1">Cenote Azul</p>
            <p className="text-xs text-white/50">Swimming & Snorkeling</p>
          </div>
          <div className="border border-white/5 bg-white/5 p-3 rounded-xl cursor-grab text-sand">
            <p className="text-sm font-semibold text-gold mb-1">Ilios Greek Estiatorio</p>
            <p className="text-xs text-white/50">Dinner / Fire Show</p>
          </div>
        </div>
      </div>
    </div>
  );
};
