import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CheatSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scripts = [
    { title: 'Taxi', text: '¿Cuánto al [Hotel]? ¿Es el precio total?' },
    { title: 'Connect', text: 'Soy amigo de [Your Name]. ¿Nos puedes echar la mano?' },
    { title: 'Bill', text: 'La cuenta, por favor. ¿La propina ya viene incluida?' }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 glass-panel p-3 rounded-full text-gold hover:text-sand transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
      >
        <BookOpen size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-charcoal border-l border-white/10 z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gold tracking-wide">Cheat Sheet</h2>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-white/50 italic mb-4">Essential Spanish phrases for The Connect.</p>
                {scripts.map((script, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-xl border-l-2 border-gold text-left">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-2">{script.title}</h3>
                    <p className="text-sand text-lg font-serif">"{script.text}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
