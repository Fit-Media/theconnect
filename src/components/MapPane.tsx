import React from 'react';
import { MapPin } from 'lucide-react';

const MapPane: React.FC = () => {
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center gap-4 text-white/30 text-center p-6 border-dashed">
        <MapPin size={48} className="opacity-50 text-gold" />
        <div>
          <h3 className="text-xl font-serif text-sand tracking-wider mb-2">Map View</h3>
          <p className="text-sm">Interactive map visualization will be rendered here.</p>
        </div>
      </div>
    </div>
  );
};

export default MapPane;
