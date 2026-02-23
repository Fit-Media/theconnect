import React from 'react';
import { DayColumn } from './DayColumn';
import { useItineraryStore } from '../store/useItineraryStore';

export const Grid8Day: React.FC = () => {
  const { days, moveEvent, reorderEvent } = useItineraryStore();

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

  return (
    <div className="flex gap-6 overflow-x-auto h-[calc(100vh-140px)] px-6 pb-6 pt-4 snap-x snap-mandatory">
      {days.map((day: any) => (
        <div key={day.id} className="snap-center h-full">
          <DayColumn 
            day={day} 
            onDragStart={handleDragStart}
            onDropOnEvent={handleDropOnEvent}
            onDropOnColumn={handleDropOnColumn}
          />
        </div>
      ))}
    </div>
  );
};
