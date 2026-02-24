import React, { useState, useEffect } from 'react';
import { Grid8Day } from './components/Grid8Day';
import { useItineraryStore } from './store/useItineraryStore';
import { useConnectionsStore } from './store/useConnectionsStore';
import { TimeSyncedBackground } from './components/TimeSyncedBackground';
import { WelcomeModal } from './components/WelcomeModal';
import { BottomSheet } from './components/BottomSheet';
import { Plus, UserCircle2, Map as MapIcon, PanelLeftClose } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { LibraryView } from './components/LibraryView';
import { RightInspector } from './components/RightInspector';
import { ConnectionsView } from './components/ConnectionsView';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, CloudCheck } from 'lucide-react'; // Error: CloudCheck doesn't exist in lucide. Using Check instead. 
// Actually I'll use Cloud, CloudOff, and a custom colored Cloud for success.
import { Check } from 'lucide-react';

const MapPane = React.lazy(() => import('./components/MapPane'));

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
  const { days, libraryItems, selectedEventId, selectEvent, selectedLibraryItemId, selectLibraryItem } = useItineraryStore();
  const { widgets } = useConnectionsStore();
  const [activeView, setActiveView] = useState<'itinerary' | 'discover' | 'connections' | 'map'>('itinerary');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Auto-Sync
  useEffect(() => {
    if (!session?.uid || days.length === 0) return;

    const syncData = async () => {
      setSyncStatus('syncing');
      try {
        // Firestore doesn't like 'undefined' values. 
        // We'll deep-copy and strip them using JSON serialization.
        const sanitizedDays = JSON.parse(JSON.stringify(days));
        const sanitizedLibrary = JSON.parse(JSON.stringify(libraryItems));
        const sanitizedWidgets = JSON.parse(JSON.stringify(widgets));

        const userDocRef = doc(db, 'itineraries', session.uid);
        await setDoc(userDocRef, {
          user_id: session.uid,
          data: sanitizedDays,
          library: sanitizedLibrary,
          essentials: sanitizedWidgets,
          updatedAt: serverTimestamp(),
          is_primary: true
        }, { merge: true });
        
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error: any) {
        console.error("Auto-sync error details:", error);
        
        // If it's a specific Firestore error, we want to know
        if (error.code === 'permission-denied') {
          console.error("FIREBASE ERROR: Permission Denied. Check your Firestore Rules.");
        }
        
        setSyncStatus('error');
      }
    };

    // Simple debounce to prevent hitting Firestore on every single keystroke if editing fast
    const timeoutId = setTimeout(syncData, 2000);
    return () => clearTimeout(timeoutId);
  }, [days, libraryItems, widgets, session]);

  // Force manual sync function
  const forceSync = async () => {
    if (!session?.uid) return;
    setSyncStatus('syncing');
    try {
      const sanitizedDays = JSON.parse(JSON.stringify(days));
      const sanitizedLibrary = JSON.parse(JSON.stringify(libraryItems));
      const sanitizedWidgets = JSON.parse(JSON.stringify(widgets));

      const userDocRef = doc(db, 'itineraries', session.uid);
      await setDoc(userDocRef, {
        user_id: session.uid,
        data: sanitizedDays,
        library: sanitizedLibrary,
        essentials: sanitizedWidgets,
        updatedAt: serverTimestamp(),
        is_primary: true
      }, { merge: true });
      
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Manual sync error:", error);
      setSyncStatus('error');
    }
  };

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

      {/* Floating Map Toggle Tab (When map is closed) */}
      <AnimatePresence>
        {!isMapOpen && activeView !== 'map' && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed top-1/2 left-0 -translate-y-1/2 z-40 hidden lg:block"
          >
            <button 
              onClick={() => setIsMapOpen(true)}
              className="bg-black/60 backdrop-blur-xl border border-white/10 border-l-0 text-white hover:text-gold p-4 py-6 rounded-r-2xl shadow-[10px_0_20px_rgba(0,0,0,0.3)] transition-all hover:pr-6 cursor-pointer group flex items-center gap-2 relative overflow-hidden"
            >
               <MapIcon size={24} className="group-hover:scale-110 transition-transform relative z-10" />
               <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-[0.2em] text-xs font-bold leading-none opacity-0 group-hover:opacity-100 mt-2 transition-opacity duration-300 relative z-10">Map</span>
               <div className="absolute inset-0 bg-gradient-to-r from-gold/0 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen w-full overflow-hidden">
        
        {/* Left Pane (Desktop 30%, Mobile Full if map view) lazy-loaded Map */}
        <AnimatePresence initial={false}>
          {(isMapOpen || activeView === 'map') && (
            <motion.div 
              initial={{ width: activeView === 'map' ? '100%' : '0%', opacity: 0 }}
              animate={{ width: activeView === 'map' ? '100%' : '30%', opacity: 1 }}
              exit={{ width: '0%', opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className={`${activeView === 'map' ? 'flex w-full' : 'hidden lg:flex'} h-full shrink-0 border-r border-white/5 bg-black/20 relative z-10 flex-col overflow-hidden`}
            >
              {/* Map Close Button */}
              {activeView !== 'map' && (
                <button 
                  onClick={() => setIsMapOpen(false)}
                  className="absolute top-6 right-6 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white p-2 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group"
                  title="Close Map"
                >
                  <PanelLeftClose size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}
              <React.Suspense fallback={<div className="flex h-full items-center justify-center text-white/50 text-sm tracking-widest uppercase">Loading Map Info...</div>}>
                <MapPane />
              </React.Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Pane (Fluid width on Desktop, 100% on Mobile unless map view) */}
        <motion.div 
          layout
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className={`${activeView === 'map' ? 'hidden lg:flex' : 'flex'} flex-1 flex-col relative z-10 w-full min-w-0 h-full overflow-hidden`}
        >
          <header className="pt-8 pb-4 px-6 relative z-10 text-center shrink-0 flex flex-col items-center">
            
            <div className="absolute right-6 top-8 flex items-center gap-3">
               {session ? (
                 <>
                   <button 
                     onClick={() => auth.signOut()}
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
            
            {/* Sync Status Indicator */}
            <div className="flex items-center gap-2 mb-2">
              {session && (
                <div 
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border transition-all duration-500 ${
                    syncStatus === 'syncing' ? 'bg-gold/10 border-gold/30 text-gold animate-pulse' :
                    syncStatus === 'synced' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                    syncStatus === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-white/5 border-white/10 text-white/30'
                  }`}
                >
                  {syncStatus === 'syncing' && <><Cloud size={10} className="animate-bounce" /> Syncing...</>}
                  {syncStatus === 'synced' && <><Check size={10} /> Cloud Saved</>}
                  {syncStatus === 'error' && <><CloudOff size={10} /> Sync Failed</>}
                  {syncStatus === 'idle' && <><Cloud size={10} /> Cloud Active</>}
                </div>
              )}
              {session && syncStatus === 'idle' && (
                <button 
                  onClick={forceSync}
                  className="text-[10px] text-white/30 hover:text-gold transition-colors uppercase tracking-widest font-bold"
                >
                  Sync Now
                </button>
              )}
            </div>

            <h1 className="text-4xl font-serif text-gold tracking-widest font-bold uppercase transition-all hover:scale-[1.02] drop-shadow-md">The Connect</h1>
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase mt-2 mb-8 font-medium">Curated Tulum Itinerary</p>

            {/* View Toggle (Desktop/Tablet Only) - Glassmorphism 2.0 style */}
            <div className="hidden sm:inline-flex bg-[#1A1A1A]/60 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg relative">
              <button 
                onClick={() => setActiveView('connections')}
                className={`relative px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 ${activeView === 'connections' ? 'text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-white/60 hover:text-white'}`}
              >
                {activeView === 'connections' && <div className="absolute inset-0 bg-gold rounded-full -z-10 shadow-[inner_0_0_10px_rgba(255,255,255,0.3)]"></div>}
                Essentials
              </button>
              <button 
                onClick={() => setActiveView('discover')}
                className={`relative px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 ${activeView === 'discover' ? 'text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-white/60 hover:text-white'}`}
              >
                {activeView === 'discover' && <div className="absolute inset-0 bg-gold rounded-full -z-10 shadow-[inner_0_0_10px_rgba(255,255,255,0.3)]"></div>}
                Discover
              </button>
              <button 
                onClick={() => setActiveView('itinerary')}
                className={`relative px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 ${activeView === 'itinerary' ? 'text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-white/60 hover:text-white'}`}
              >
                {activeView === 'itinerary' && <div className="absolute inset-0 bg-gold rounded-full -z-10 shadow-[inner_0_0_10px_rgba(255,255,255,0.3)]"></div>}
                Itinerary
              </button>
            </div>

          </header>

          <main className="flex-1 w-full min-h-0 relative">
            {activeView === 'itinerary' && <Grid8Day />}
            {activeView === 'discover' && <LibraryView />}
            {activeView === 'connections' && <ConnectionsView />}
          </main>
        </motion.div>

        {/* Right Pane (Desktop fixed 400px width) */}
        <AnimatePresence initial={false}>
          {isInspectorOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="hidden lg:block h-full relative z-20 shadow-2xl border-l border-white/10 shrink-0 transform-gpu overflow-hidden bg-[#1A1A1A]/80 backdrop-blur-3xl"
            >
              <div className="w-[400px] h-full"> {/* Inner fixed width container to prevent flex squish during animation */}
                <RightInspector onClose={handleCloseInspector} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Floating Buttons (Universal) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
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

      {/* Bottom Dock (Mobile Only) */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[45]">
        <div className="flex items-center bg-black/70 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <button 
            onClick={() => setActiveView('connections')}
            className={`px-4 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeView === 'connections' ? 'bg-gold text-deep' : 'text-white/70 hover:text-white'}`}
          >
            Essentials
          </button>
          <button 
            onClick={() => setActiveView('discover')}
            className={`px-4 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeView === 'discover' ? 'bg-gold text-deep' : 'text-white/70 hover:text-white'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setActiveView('itinerary')}
            className={`px-4 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeView === 'itinerary' ? 'bg-gold text-deep' : 'text-white/70 hover:text-white'}`}
          >
            Itinerary
          </button>
          <button 
            onClick={() => setActiveView('map')}
            className={`px-4 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeView === 'map' ? 'bg-gold text-deep' : 'text-white/70 hover:text-white'}`}
          >
            Map
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} session={session} />

    </TimeSyncedBackground>
  );
}

export default App;
