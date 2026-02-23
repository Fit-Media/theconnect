import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#1A1A1A]/90 border border-gold/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Decorative Gold Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[50px] rounded-full pointer-events-none" />

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gold/10 rounded-lg text-gold">
              <Key size={24} />
            </div>
            <h2 className="text-xl font-serif text-white tracking-wide">
              Welcome to the Jungle, <span className="text-gold">Friend</span>.
            </h2>
          </div>

          <p className="text-sm text-white/80 leading-relaxed mb-6">
            I've built this so you don't get "gringo-priced" or stuck in Beach Road traffic. Follow the <span className="text-gold font-semibold">Gold Key</span> spots—those are my personal connects.
          </p>

          <div className="space-y-4 mb-8">
            <h3 className="text-xs tracking-[0.2em] text-gold uppercase font-bold">The 3 Rules</h3>
            <ul className="text-sm text-white/70 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">1.</span>
                <span>Only use the verified Taxis in the Survival Bar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">2.</span>
                <span>Tap the <strong>Gold Key</strong> for my secret spots.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">3.</span>
                <span>The WhatsApp buttons are pre-filled with my name; use them for the hookup.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="w-full py-3 bg-gold text-deep font-bold tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            Enter The Connect
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
