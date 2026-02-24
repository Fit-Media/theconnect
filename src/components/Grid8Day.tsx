import React, { useRef, useEffect } from 'react';
import { DayColumn } from './DayColumn';
import { useItineraryStore } from '../store/useItineraryStore';

export const Grid8Day: React.FC = () => {
  const { days, activeDayId, setActiveDayId, moveEvent, reorderEvent } = useItineraryStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('eventId', eventId);
    // Find the source day id
    const sourceDay = days.find((d: any) => d.events.some((ev: any) => ev.id === eventId));
    if (sourceDay) {
      e.dataTransfer.setData('sourceDayId', sourceDay.id);
    }
  };

  const handleDropOnEvent = (e: React.DragEvent, destEventId: string, destDayId: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    const sourceDayId = e.dataTransfer.getData('sourceDayId');
    if (!eventId || !sourceDayId) return;

    // Find destination index
    const destDay = days.find((d: any) => d.id === destDayId);
    if (!destDay) return;
    const destIndex = destDay.events.findIndex((ev: any) => ev.id === destEventId);

    if (sourceDayId === destDayId) {
      // Reorder within the same day
      const sourceIndex = destDay.events.findIndex((ev: any) => ev.id === eventId);
      if (sourceIndex !== destIndex) {
        reorderEvent(destDayId, sourceIndex, destIndex);
      }
    } else {
      // Move to a different day
      moveEvent(eventId, sourceDayId, destDayId, Math.max(0, destIndex));
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, destDayId: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    const sourceDayId = e.dataTransfer.getData('sourceDayId');
    if (!eventId || !sourceDayId) return;

    const destDay = days.find((d: any) => d.id === destDayId);
    if (!destDay) return;

    // Drop at the end of the column
    if (sourceDayId !== destDayId) {
      moveEvent(eventId, sourceDayId, destDayId, destDay.events.length);
    }
  };

  const scrollToDay = (dayId: string) => {
    setActiveDayId(dayId);
    const element = document.getElementById(`day-col-${dayId}`);
    if (element && scrollRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Listen to scroll events to update the active day in picker
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const childWidth = scrollRef.current.scrollWidth / days.length;
      const currentIndex = Math.round(scrollLeft / childWidth);
      if (days[currentIndex] && days[currentIndex].id !== activeDayId) {
        setActiveDayId(days[currentIndex].id);
      }
    };
    
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [days, activeDayId]);

  return (
    <div className="flex flex-col h-full items-center lg:items-start w-full">
      {/* Snap-to-Day Horizontal Date Picker */}
      <div className="w-full overflow-x-auto scrollbar-hide shrink-0 pb-4 pt-2 px-6">
        <div className="flex gap-2 mx-auto lg:mx-0 min-w-max">
          {days.map((day: any, index: number) => (
            <button
              key={`picker-${day.id}`}
              onClick={() => scrollToDay(day.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all border ${activeDayId === day.id ? 'bg-gold text-deep border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-black/40 text-white/50 border-white/10 hover:border-gold/50 backdrop-blur-md'}`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Scroll */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto h-full px-6 pb-24 pt-2 snap-x snap-mandatory w-full scrollbar-hide"
      >
        {days.map((day: any) => (
          <div key={day.id} id={`day-col-${day.id}`} className="snap-center h-full shrink-0">
            <DayColumn 
              day={day} 
              onDragStart={handleDragStart}
              onDropOnEvent={handleDropOnEvent}
              onDropOnColumn={handleDropOnColumn}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
