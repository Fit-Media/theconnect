import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useItineraryStore } from '../store/useItineraryStore';
import { useConnectionsStore } from '../store/useConnectionsStore';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, session }) => {
  const { days, libraryItems } = useItineraryStore();
  const { widgets } = useConnectionsStore();
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShareLink = async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, 'itineraries'), {
        user_id: session.uid,
        data: days,
        library: libraryItems,
        essentials: widgets,
        createdAt: new Date().toISOString(),
      });
      const url = `${window.location.origin}/shared/${docRef.id}`;
      setShareLink(url);
    } catch (dbError) {
      console.error(dbError);
      setError('Could not generate link. Make sure Firestore rules allow writes!');
    }
    
    setLoading(false);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setShareLink(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel relative w-full max-w-md p-8 pt-10 rounded-2xl border-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

            <button
              onClick={handleReset}
              className="absolute top-4 right-4 text-white/50 hover:text-gold transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold/20 to-transparent flex items-center justify-center mx-auto mb-4 border border-gold/30">
                <Share2 className="text-gold" size={24} />
              </div>
              <h2 className="text-2xl font-serif text-gold tracking-widest uppercase mb-2">Share Your Connect</h2>
              <p className="text-sm text-sand/70">Generate a unique read-only link to share this itinerary with your group.</p>
            </div>

            <div className="relative z-10 space-y-4">
              {!shareLink ? (
                <button
                  onClick={generateShareLink}
                  disabled={loading}
                  className="w-full bg-gold text-deep font-bold tracking-widest uppercase py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Generate Link'}
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="bg-black/40 border border-gold/30 rounded-xl p-4 break-all text-center">
                    <p className="text-sand font-mono text-sm leading-relaxed select-all">
                      {shareLink}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest uppercase py-3 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm mt-4 text-center">
                  {error}
                </div>
              )}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
