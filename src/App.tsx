import { useState, useEffect } from 'react';
import { Grid8Day } from './components/Grid8Day';
import { useItineraryStore } from './store/useItineraryStore';
import { TimeSyncedBackground } from './components/TimeSyncedBackground';
import { WelcomeModal } from './components/WelcomeModal';
import { BottomSheet } from './components/BottomSheet';
import { Plus, UserCircle2 } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { LibraryView } from './components/LibraryView';
import { RightInspector } from './components/RightInspector';
import { ConnectionsView } from './components/ConnectionsView';
import { supabase } from './lib/supabase';

const dummyEvents = [
  {
    id: '1',
    title: 'Arrival & Check-in',
    description: 'Arrive at Tulum Airport (TQO), transfer to hotel.',
    time: '2:00 PM',
    location: 'TQO Airport / Hotel Zone',
    tags: ['Travel', 'Logistics'],
    contactInfo: {
      phone: '+529841234567',
      whatsapp: '529841234567'
    },
    hiddenDetails: {
      confirmationNumber: 'FLT-84729-AA',
      address: 'Carretera Tulum-Boca Paila Km 7.5',
      notes: 'Driver will be waiting at Arrivals Exit 3 with a sign.'
    },
  },
  {
    id: '2',
    title: 'Taqueria Honorio',
    description: 'The best cochinita pibil tacos in town. Go early before they sell out!',
    time: '8:30 AM',
    location: 'Tulum Centro',
    tags: ['Food', 'Authentic', 'Must Do'],
    isGoldKey: true,
    websiteUrl: 'https://www.facebook.com/taqueriahonorio/',
    googleMapsUrl: 'https://maps.app.goo.gl/TaqueriaHonorio',
    contactInfo: { whatsapp: '529847654321' },
  },
  {
    id: '3',
    title: 'Rosa Negra',
    description: 'Upscale Latin American restaurant with a vibrant atmosphere.',
    time: '9:00 PM',
    location: 'Tulum Hotel Zone',
    tags: ['Dinner', 'Party', 'Vibe'],
    googleMapsUrl: 'https://maps.google.com/?q=Rosa+Negra+Tulum',
    websiteUrl: 'https://rosanegra.com.mx/en',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1544605937-23edacfa2bc0?auto=format&fit=crop&q=80&w=600' }],
    hiddenDetails: { notes: 'Reservations highly recommended.' }
  }
];

function App() {
  const { days, selectedEventId, selectEvent, selectedLibraryItemId, selectLibraryItem } = useItineraryStore();
  const [activeView, setActiveView] = useState<'itinerary' | 'discover' | 'connections'>('itinerary');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [session, setSession] = useState<unknown | null>(null);

  // Monitor Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When an event is selected on mobile, auto-open the inspector
  useEffect(() => {
    if (selectedEventId || selectedLibraryItemId) {
      // setTimeout avoids the cascading render React warning
      setTimeout(() => setIsInspectorOpen(true), 0);
    }
  }, [selectedEventId, selectedLibraryItemId]);

  // Handle closing inspector on mobile without losing selection (or losing it, let's lose it)
  const handleCloseInspector = () => {
    setIsInspectorOpen(false);
    selectEvent(null);
    selectLibraryItem(null);
  };

  useEffect(() => {
    // Inject dummy data once on initial load if empty
    const isFirstTime = days.every((d: { events: unknown[] }) => d.events.length === 0);
    if (isFirstTime) {
      const stateString = localStorage.getItem('itinerary-storage');
      if (stateString) {
        const parsed = JSON.parse(stateString);
        if (parsed?.state?.days?.every((d: { events: unknown[] }) => d.events.length === 0)) {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           useItineraryStore.setState((state: any) => {
             const newDays = [...state.days];
             newDays[0] = { ...newDays[0], events: [dummyEvents[0], dummyEvents[1]] };
             newDays[1] = { ...newDays[1], events: [dummyEvents[2]] };
             return { days: newDays };
           });
        }
      }
    }
  }, [days]);

  return (
    <TimeSyncedBackground>
      {/* Background ambient glow overrides original flat background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-black/40 blur-[100px] rounded-full"></div>
      </div>

      <WelcomeModal />

      <div className="flex h-screen w-full overflow-auto">
        
        {/* Center Pane */}
        <div className="flex-1 flex flex-col relative z-10 w-full">
          <header className="pt-8 pb-4 px-6 relative z-10 text-center shrink-0 flex flex-col items-center">
            
            <div className="absolute right-6 top-8 flex items-center gap-3">
               {session ? (
                 <>
                   <button 
                     onClick={() => supabase.auth.signOut()}
                     className="text-white/50 hover:text-white transition-colors text-xs hidden sm:block"
                   >
                     Sign Out
                   </button>
                   <button 
                     onClick={() => setIsShareModalOpen(true)}
                     className="text-xs uppercase tracking-widest text-gold border border-gold/30 px-4 py-2 rounded-full hover:bg-gold/10 transition-colors hidden sm:block"
                   >
                     Share Trip
                   </button>
                   <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/50 text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                     <UserCircle2 size={20} />
                   </div>
                 </>
               ) : (
                 <button 
                   onClick={() => setIsAuthModalOpen(true)}
                   className="text-xs uppercase tracking-widest text-gold border border-gold/30 px-4 py-2 rounded-full hover:bg-gold/10 transition-colors hidden sm:block"
                 >
                   Sign In
                 </button>
               )}
            </div>
            
            <h1 className="text-4xl font-serif text-gold tracking-widest font-bold uppercase">The Connect</h1>
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase mt-2 mb-8">Curated Tulum Itinerary</p>

            {/* View Toggle */}
            <div className="inline-flex bg-black/40 p-1 rounded-full border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => setActiveView('connections')}
                className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${activeView === 'connections' ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-white/50 hover:text-white'}`}
              >
                Essentials
              </button>
              <button 
                onClick={() => setActiveView('discover')}
                className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${activeView === 'discover' ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-white/50 hover:text-white'}`}
              >
                Discover
              </button>
              <button 
                onClick={() => setActiveView('itinerary')}
                className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${activeView === 'itinerary' ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-white/50 hover:text-white'}`}
              >
                Itinerary
              </button>
            </div>

          </header>

          <main className="flex-1 w-full overflow-auto relative">
            {activeView === 'itinerary' && <Grid8Day />}
            {activeView === 'discover' && <LibraryView />}
            {activeView === 'connections' && <ConnectionsView />}
          </main>
        </div>

        {/* Right Pane (Desktop) */}
        {isInspectorOpen && (
          <div className="hidden lg:block h-full relative z-20 animate-in slide-in-from-right duration-300 shadow-2xl border-l border-white/5 w-[640px] shrink-0">
            <RightInspector onClose={handleCloseInspector} />
          </div>
        )}

      </div>

      {/* Floating Buttons (Universal) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-30">
        {/* SOS Button */}
        <a href="tel:911" className="w-14 h-14 bg-red-600/90 text-white rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse border-2 border-red-400/50">
          <span className="font-bold text-xs tracking-wider">SOS</span>
        </a>

        {/* Quick Add Button */}
        <button 
          onClick={() => setIsInspectorOpen(true)}
          className="w-14 h-14 bg-gold text-deep rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] text-2xl font-bold transition-transform active:scale-95"
        >
          <Plus size={28} />
        </button>
      </div>

      <BottomSheet isOpen={isInspectorOpen} onClose={handleCloseInspector} title="Inspector">
        <div className="h-full overflow-y-auto">
          <div className="[&>div]:!flex [&>div]:!w-full [&>div]:!border-none [&>div]:!bg-transparent [&>div]:!p-0 [&>div>div:first-child>button]:!hidden">
            <RightInspector />
          </div>
        </div>
      </BottomSheet>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} session={session} />

    </TimeSyncedBackground>
  );
}

export default App;
