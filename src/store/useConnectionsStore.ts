import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ConnectionWidget } from '../types/connections';

interface ConnectionsState {
  widgets: ConnectionWidget[];
  isEditMode: boolean;
  setEditMode: (isEdit: boolean) => void;
  addWidget: (widget: ConnectionWidget) => void;
  updateWidget: (widget: ConnectionWidget) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
}

const defaultWidgets: ConnectionWidget[] = [
  {
    id: 'w1',
    type: 'apps',
    title: 'Essential Apps',
    icon: 'Smartphone',
    colSpan: 2,
    rowSpan: 2,
    iconColorClass: 'text-gold bg-gold/20',
    colorClass: 'bg-black/40',
    apps: [
      {
        id: 'a1',
        name: 'WhatsApp',
        description: 'The primary mode of communication in Mexico. Used for reservations, taxis, and contacting businesses.',
        imageUrl: 'https://img.icons8.com/color/512/whatsapp--v1.png',
        iosUrl: 'https://apps.apple.com/us/app/whatsapp-messenger/id310633997',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.whatsapp'
      },
      {
        id: 'a2',
        name: 'iDrive Tulum',
        description: 'A reliable local ride app for navigating the hotel zone and town when taxis are scarce.',
        imageUrl: 'https://img.icons8.com/color/512/taxi.png',
        iosUrl: 'https://apps.apple.com',
        androidUrl: 'https://play.google.com'
      },
      {
        id: 'a3',
        name: 'Google Maps',
        description: 'Download the offline map for Tulum before arriving. Cell service is notoriously spotty on the beach road.',
        imageUrl: 'https://img.icons8.com/color/512/google-maps-new.png',
        iosUrl: 'https://apps.apple.com/us/app/google-maps/id585027354',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps'
      },
      {
        id: 'a4',
        name: 'XE Currency',
        description: 'Quickly calculate exchange rates on the fly to ensure you aren\'t overpaying.',
        imageUrl: 'https://img.icons8.com/color/512/economic-improvement.png',
        iosUrl: 'https://apps.apple.com/us/app/xe-currency-converter-money/id315220034',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.xe.currency'
      }
    ]
  },
  {
    id: 'w2',
    type: 'info-list',
    title: 'Currency',
    description: 'Bring pesos. While USD is widely accepted, you will almost always get a poorer exchange rate.',
    icon: 'Banknote',
    iconColorClass: 'text-green-400 bg-green-500/20',
    colorClass: 'bg-gradient-to-br from-black/40 to-black/60',
    infoItems: [
      { id: 'i1', title: 'Use Bank ATMs', description: 'Always use actual bank ATMs (Santander, CI Banco), avoid random street ATMs.' },
      { id: 'i2', title: 'Decline Conversion', description: 'Decline the ATM\'s conversion rate to get your bank\'s better rate.' }
    ]
  },
  {
    id: 'w3',
    type: 'link-card',
    title: 'Airport Transfers',
    description: 'Pre-book your transfer from TQO or CUN. Prices range from $80-$150 USD one way depending on the vehicle.',
    icon: 'Plane',
    iconColorClass: 'text-blue-400 bg-blue-500/20',
    colorClass: 'bg-black/40',
    linkText: 'View Top Providers',
    url: '#'
  },
  {
    id: 'w4',
    type: 'tips',
    title: '5 Essential Tips',
    icon: 'Lightbulb',
    colSpan: 2,
    iconColorClass: 'text-yellow-400 bg-yellow-500/20',
    colorClass: 'bg-gradient-to-r from-black/60 to-black/40',
    tips: [
      { id: 't1', title: 'The "Tulum Time" Reality', description: 'Everything runs about 30 minutes slower here. Plan accordingly and embrace the relaxed pace.' },
      { id: 't2', title: 'Traffic on Beach Road', description: 'From 5 PM to 9 PM, the single road in the hotel zone gridlocks. Rent a bike or walk for short distances.' },
      { id: 't3', title: 'Bug Spray is Mandatory', description: 'The jungle is real. Bring high-quality, eco-friendly repellent everywhere after 5 PM.' },
      { id: 't4', title: 'Dress Code', description: '"Jungle Chic". Leave the high heels at home—roads are unpaved. Opt for breathable fabrics.' },
      { id: 't5', title: 'Don\'t Flush the Paper', description: 'Tulum\'s plumbing system is delicate. Even in luxury resorts, you are often asked to bin the toilet paper.' }
    ]
  },
  {
    id: 'w5',
    type: 'info-list',
    title: 'Local Taxis & Drivers',
    icon: 'Car',
    colSpan: 2,
    iconColorClass: 'text-orange-400 bg-orange-500/20',
    colorClass: 'bg-black/40',
    infoItems: [
      { id: 'i3', title: 'Negotiate First', description: 'Never get in a taxi without agreeing on the price first. Prices are heavily inflated for tourists.' },
      { id: 'i4', title: 'Private Drivers', description: 'Highly recommended for reliable transport to cenotes or the airport.', iconText: 'VIP' }
    ]
  },
  {
    id: 'w6',
    type: 'emergency',
    title: 'Emergency',
    description: 'Costamed Hospital is the highest-rated medical facility in town.',
    icon: 'Activity',
    iconColorClass: 'text-red-500 bg-red-500/20',
    colorClass: 'bg-red-950/20 border-red-500/20',
    emergencyItems: [
      { id: 'e1', label: 'Police / Fire / Paramedic', number: '911' },
      { id: 'e2', label: 'Tourist Police', number: '078' }
    ]
  }
];

export const useConnectionsStore = create<ConnectionsState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      isEditMode: false,
      setEditMode: (isEditMode: boolean) => set({ isEditMode }),
      addWidget: (widget: ConnectionWidget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),
      updateWidget: (updatedWidget: ConnectionWidget) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === updatedWidget.id ? updatedWidget : w
          ),
        })),
      removeWidget: (widgetId: string) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== widgetId),
        })),
      reorderWidgets: (startIndex: number, endIndex: number) =>
        set((state) => {
          const newWidgets = [...state.widgets];
          const [removed] = newWidgets.splice(startIndex, 1);
          newWidgets.splice(endIndex, 0, removed);
          return { widgets: newWidgets };
        }),
    }),
    {
      name: 'connections-storage-v5',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
