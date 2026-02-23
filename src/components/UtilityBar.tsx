import React, { useState } from 'react';
import { ShieldAlert, CreditCard, Car, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UtilityBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'taxis' | 'atms' | 'emergency' | null>(null);

  const toggleTab = (tab: 'taxis' | 'atms' | 'emergency') => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="fixed bottom-0 w-full z-50">
      <AnimatePresence>
        {activeTab && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-[72px] left-0 w-full px-4"
          >
            <div className="glass-panel mx-auto max-w-md rounded-2xl p-4 shadow-2xl border-gold/30">
              {activeTab === 'taxis' && (
                <div>
                  <h3 className="text-gold font-bold mb-3 flex items-center gap-2"><Car size={18}/> Trusted Taxis</h3>
                  <div className="space-y-3">
                    <a href="https://wa.me/529842030383" target="_blank" rel="noreferrer" className="block glass-button p-3 rounded-xl flex justify-between items-center text-sm">
                      <span>WhatsApp Dispatch</span>
                      <span className="text-green-400 font-mono">+52 984 203 0383</span>
                    </a>
                    <a href="tel:+529981954408" className="block glass-button p-3 rounded-xl flex justify-between items-center text-sm">
                      <span>Private Black Car</span>
                      <span className="text-sand font-mono">+52 998 195 4408</span>
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'atms' && (
                <div>
                  <h3 className="text-gold font-bold mb-3 flex items-center gap-2"><CreditCard size={18}/> Safe ATMs</h3>
                  <div className="space-y-3">
                    <div className="glass-button p-3 rounded-xl flex flex-col items-start text-sm">
                      <span className="font-semibold text-sand">HSBC Centro</span>
                      <span className="text-white/60 text-xs">Safe / Low foreign exchange fee</span>
                    </div>
                    <div className="glass-button p-3 rounded-xl flex flex-col items-start text-sm">
                      <span className="font-semibold text-sand">Santander Centro</span>
                      <span className="text-white/60 text-xs">Inside bank lobby / reliable</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emergency' && (
                <div>
                  <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2"><ShieldAlert size={18}/> Emergency Contacts</h3>
                  <div className="space-y-3">
                    <a href="tel:911" className="block glass-button border-red-500/30 p-3 rounded-xl flex justify-between items-center text-sm">
                      <span>General Emergency</span>
                      <span className="text-red-400 font-bold tracking-widest">911</span>
                    </a>
                    <a href="tel:+529841240830" className="block glass-button border-red-500/30 p-3 rounded-xl flex justify-between items-center text-sm">
                      <span>Costamed Hospital</span>
                      <span className="text-red-400 font-mono">+52 984 124 0830</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#121212]/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-between items-center pb-safe">
        <button onClick={() => toggleTab('taxis')} className={`flex flex-col items-center gap-1 ${activeTab === 'taxis' ? 'text-gold' : 'text-white/60'}`}>
          <Car size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest">Transport</span>
        </button>
        <button onClick={() => toggleTab('atms')} className={`flex flex-col items-center gap-1 ${activeTab === 'atms' ? 'text-gold' : 'text-white/60'}`}>
          <CreditCard size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest">Cash</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-gold transition-colors">
          <Music size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest">The Audis</span>
        </button>
        <button onClick={() => toggleTab('emergency')} className={`flex flex-col items-center gap-1 ${activeTab === 'emergency' ? 'text-red-400' : 'text-white/60 hover:text-red-400'} transition-colors`}>
          <ShieldAlert size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest">SOS</span>
        </button>
      </div>
    </div>
  );
};
