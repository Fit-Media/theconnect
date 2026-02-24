import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TimeSyncedBackground } from '../components/TimeSyncedBackground';
import { Loader2, AlertCircle, Calendar, ArrowLeft, MapPin, Globe, Sparkles } from 'lucide-react';
import type { Day } from '../types';

export const SharedTrip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState<Day[] | null>(null);
  const [library, setLibrary] = useState<any[] | null>(null);
  const [essentials, setEssentials] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'discover' | 'essentials'>('itinerary');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'itineraries', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const docData = docSnap.data();
          setDays(docData.data as Day[]);
          setLibrary(docData.library || []);
          setEssentials(docData.essentials || []);
        } else {
          setError('Trip not found or you do not have permission to view it.');
        }
      } catch (err) {
        console.error(err);
        setError('Trip not found or you do not have permission to view it.');
      }
      setLoading(false);
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <TimeSyncedBackground>
        <div className="flex h-screen items-center justify-center">
          <Loader2 size={48} className="text-gold animate-spin" />
        </div>
      </TimeSyncedBackground>
    );
  }

  if (error || !days) {
    return (
      <TimeSyncedBackground>
        <div className="flex h-screen items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl border-red-500/30 text-center max-w-md">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-sand mb-2">Trip Unavailable</h2>
            <p className="text-white/60 mb-6">{error}</p>
            <Link to="/" className="inline-block bg-gold text-deep font-bold px-6 py-3 rounded-full hover:bg-gold/90 transition-colors">
              Create Your Own Itinerary
            </Link>
          </div>
        </div>
      </TimeSyncedBackground>
    );
  }

  return (
    <TimeSyncedBackground>
      <div className="flex h-screen w-full overflow-hidden flex-col relative z-10">
        <header className="pt-8 pb-4 px-6 relative z-10 text-center shrink-0">
          <Link to="/" className="absolute left-6 top-8 text-white/50 hover:text-gold transition-colors flex items-center gap-2 text-sm uppercase tracking-widest">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Build Your Own</span>
          </Link>
          <h1 className="text-4xl font-serif text-gold tracking-widest font-bold uppercase">The Connect</h1>
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase mt-2">Shared Tulum Itinerary</p>

          <div className="flex justify-center gap-4 mt-8">
            {(['itinerary', 'discover', 'essentials'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all border ${
                  activeTab === tab 
                    ? 'bg-gold text-deep border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 w-full overflow-y-auto relative p-6">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {activeTab === 'itinerary' && (
              days.filter(d => d.events.length > 0).length === 0 ? (
                <div className="text-center text-white/50 mt-20">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>This itinerary is empty.</p>
                </div>
              ) : (
                days.map(day => (
                  day.events.length > 0 && (
                    <div key={day.id} className="relative">
                      <div className="sticky top-0 bg-black/40 backdrop-blur-md z-20 py-4 mb-4 border-b border-gold/20">
                        <h2 className="text-2xl text-gold font-serif">{day.date}</h2>
                      </div>
                      
                      <div className="space-y-4 pl-4 border-l border-white/10">
                        {day.events.map(event => (
                          <div key={event.id} className={`glass-panel p-4 rounded-xl text-sand relative ${event.isGoldKey ? 'border border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : ''}`}>
                            <h3 className="text-xl font-semibold text-gold mb-1">{event.title}</h3>
                            {/* ... Rest of event card code ... */}
                            {(event.time || event.location) && (
                              <div className="text-sm text-white/60 mb-2 flex items-center flex-wrap gap-1">
                                {event.time && <span>{event.time}</span>}
                                {event.time && event.location && <span>•</span>}
                                {event.location && (
                                  event.googleMapsUrl ? (
                                    <a href={event.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
                                      {event.location} <MapPin size={12} />
                                    </a>
                                  ) : (
                                    <span>{event.location}</span>
                                  )
                                )}
                              </div>
                            )}

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
                            
                            {event.media && event.media.length > 0 && (
                              <div className="mb-4 rounded-lg overflow-hidden border border-white/10">
                                {event.media[0].type === 'image' && (
                                  <img src={event.media[0].url} alt="Event Media" className="w-full h-40 object-cover" />
                                )}
                              </div>
                            )}
                            
                            <div className="flex gap-2 mt-4">
                              {event.googleMapsUrl && (
                                <a href={event.googleMapsUrl} target="_blank" rel="noreferrer" className="glass-button p-2 rounded-full px-4 flex justify-center items-center gap-2 text-red-400 text-sm">
                                  <MapPin size={16} /> View Map
                                </a>
                              )}
                              {event.websiteUrl && (
                                <a href={event.websiteUrl} target="_blank" rel="noreferrer" className="glass-button p-2 rounded-full px-4 flex justify-center items-center gap-2 text-blue-300 text-sm">
                                  <Globe size={16} /> Visit Website
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))
              )
            )}

            {activeTab === 'discover' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {library?.map((item: any) => (
                  <div key={item.id} className="glass-panel p-4 rounded-xl">
                    <img src={item.imageUrl} className="w-full h-32 object-cover rounded-lg mb-4" />
                    <h3 className="text-gold font-bold">{item.title}</h3>
                    <p className="text-xs text-white/50">{item.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'essentials' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {essentials?.map((widget: any) => (
                  <div key={widget.id} className="glass-panel p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-2">{widget.title}</h3>
                    <p className="text-xs text-white/50">{widget.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </TimeSyncedBackground>
  );
};
