import React from 'react';
import type { Day } from '../types';
import { EventCard } from './EventCard';
import { Compass } from 'lucide-react';

interface DayColumnProps {
  day: Day;
  onDragStart: (e: React.DragEvent, eventId: string) => void;
  onDropOnColumn: (e: React.DragEvent, dayId: string) => void;
  onDropOnEvent: (e: React.DragEvent, destEventId: string, destDayId: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ day, onDragStart, onDropOnColumn, onDropOnEvent }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div 
      className="w-80 flex-shrink-0 bg-charcoal/50 border border-white/5 rounded-2xl p-4 flex flex-col h-full overflow-y-auto"
      onDragOver={handleDragOver}
      onDrop={(e) => {
        // Trigger column drop (stopPropagation in EventCard prevents double-firing)
        onDropOnColumn(e, day.id);
      }}
    >
      <div className="sticky top-0 bg-charcoal/90 z-10 pb-4 mb-4 border-b border-gold/20 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-sand tracking-wide uppercase">{day.date}</h2>
        <span className="text-xs text-gold/50 font-medium">{day.events.length} Events</span>
      </div>
      
      <div className="flex-1 min-h-[100px]">
        {day.events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onDragStart={onDragStart}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.stopPropagation();
              onDropOnEvent(e, event.id, day.id);
            }}
          />
        ))}
        {day.events.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/5 rounded-xl gap-3 p-4 text-center">
            <Compass size={32} className="opacity-50" />
            <span className="text-sm">Start your Tulum story—drag a connect from the library.</span>
          </div>
        )}
      </div>
    </div>
  );
};
