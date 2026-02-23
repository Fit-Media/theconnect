import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Day, EventCard } from '../types';
import { mockLibraryData, type LibraryItem } from '../utils/libraryData';

interface ItineraryState {
  days: Day[];
  selectedEventId: string | null;
  moveEvent: (eventId: string, sourceDayId: string, destDayId: string, destIndex: number) => void;
  reorderEvent: (dayId: string, startIndex: number, endIndex: number) => void;
  updateEvent: (dayId: string, updatedEvent: EventCard) => void;
  addEvent: (dayId: string, newEvent: EventCard) => void;
  removeEvent: (dayId: string, eventId: string) => void;
  selectEvent: (eventId: string | null) => void;
  
  // Library State
  libraryItems: LibraryItem[];
  selectedLibraryItemId: string | null;
  selectLibraryItem: (itemId: string | null) => void;
  addLibraryItem: (item: LibraryItem) => void;
  updateLibraryItem: (updatedItem: LibraryItem) => void;
  removeLibraryItem: (itemId: string) => void;
}

// Initial mock data to ensure we have an 8-day grid scaffolded
const initialDays: Day[] = Array.from({ length: 8 }, (_, i) => ({
  id: `day-${i + 1}`,
  date: `Day ${i + 1}`,
  events: [] as EventCard[],
}));

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set) => ({
      days: initialDays,
      selectedEventId: null as string | null,
      
      // Library Initial State
      libraryItems: mockLibraryData,
      selectedLibraryItemId: null as string | null,

      // Selections (mutually exclusive)
      selectEvent: (eventId: string | null) => set({ selectedEventId: eventId, selectedLibraryItemId: null }),
      selectLibraryItem: (itemId: string | null) => set({ selectedLibraryItemId: itemId, selectedEventId: null }),

      // Library Actions
      addLibraryItem: (item: LibraryItem) =>
        set((state: ItineraryState) => ({
          libraryItems: [...state.libraryItems, item]
        })),
        
      updateLibraryItem: (updatedItem: LibraryItem) =>
        set((state: ItineraryState) => ({
          libraryItems: state.libraryItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          )
        })),
        
      removeLibraryItem: (itemId: string) =>
        set((state: ItineraryState) => ({
          libraryItems: state.libraryItems.filter(item => item.id !== itemId),
          selectedLibraryItemId: state.selectedLibraryItemId === itemId ? null : state.selectedLibraryItemId
        })),

      // Moves an event from one day to another
      moveEvent: (eventId: string, sourceDayId: string, destDayId: string, destIndex: number) =>
        set((state: ItineraryState) => {
          const newDays = [...state.days];

          const sourceDayIndex = newDays.findIndex((d) => d.id === sourceDayId);
          const destDayIndex = newDays.findIndex((d) => d.id === destDayId);

          if (sourceDayIndex === -1 || destDayIndex === -1) return state;

          const sourceEvents = [...newDays[sourceDayIndex].events];
          const destEvents = sourceDayId === destDayId ? sourceEvents : [...newDays[destDayIndex].events];

          const eventIndex = sourceEvents.findIndex((e) => e.id === eventId);
          if (eventIndex === -1) return state;

          const [movedEvent] = sourceEvents.splice(eventIndex, 1);
          destEvents.splice(destIndex, 0, movedEvent);

          newDays[sourceDayIndex] = { ...newDays[sourceDayIndex], events: sourceEvents };
          if (sourceDayId !== destDayId) {
            newDays[destDayIndex] = { ...newDays[destDayIndex], events: destEvents };
          }

          return { days: newDays };
        }),

      // Reorders events within the same day
      reorderEvent: (dayId: string, startIndex: number, endIndex: number) =>
        set((state: ItineraryState) => {
          const newDays = [...state.days];
          const dayIndex = newDays.findIndex((d) => d.id === dayId);
          if (dayIndex === -1) return state;

          const events = [...newDays[dayIndex].events];
          const [removed] = events.splice(startIndex, 1);
          events.splice(endIndex, 0, removed);

          newDays[dayIndex] = { ...newDays[dayIndex], events };
          return { days: newDays };
        }),

      // Updates an existing event
      updateEvent: (dayId: string, updatedEvent: EventCard) =>
        set((state: ItineraryState) => {
          const newDays = [...state.days];
          const dayIndex = newDays.findIndex((d) => d.id === dayId);
          if (dayIndex === -1) return state;

          const events = newDays[dayIndex].events.map((evt) =>
            evt.id === updatedEvent.id ? updatedEvent : evt
          );

          newDays[dayIndex] = { ...newDays[dayIndex], events };
          return { days: newDays };
        }),

      // Adds a new event to a specific day
      addEvent: (dayId: string, newEvent: EventCard) =>
        set((state: ItineraryState) => {
          const newDays = [...state.days];
          const dayIndex = newDays.findIndex((d) => d.id === dayId);
          if (dayIndex === -1) return state;

          const events = [...newDays[dayIndex].events, newEvent];

          newDays[dayIndex] = { ...newDays[dayIndex], events };
          return { days: newDays };
        }),

      // Removes an event
      removeEvent: (dayId: string, eventId: string) =>
        set((state: ItineraryState) => {
          const newDays = [...state.days];
          const dayIndex = newDays.findIndex((d) => d.id === dayId);
          if (dayIndex === -1) return state;

          const events = newDays[dayIndex].events.filter(e => e.id !== eventId);
          newDays[dayIndex] = { ...newDays[dayIndex], events };
          return { days: newDays };
        }),
    }),
    {
      name: 'itinerary-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
