import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useConnectionsStore } from '../store/useConnectionsStore';
import type { ConnectionWidget, WidgetType, AppItem, InfoItem, TipItem, EmergencyItem } from '../types/connections';

interface ConnectionWidgetEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidget: ConnectionWidget | null;
}

const WIDGET_TYPES: { id: WidgetType; label: string; icon: string }[] = [
  { id: 'apps', label: 'App Cards', icon: 'Smartphone' },
  { id: 'info-list', label: 'Info List', icon: 'List' },
  { id: 'tips', label: 'Numbered Tips', icon: 'Lightbulb' },
  { id: 'emergency', label: 'Emergency Contacts', icon: 'Activity' },
  { id: 'link-card', label: 'Simple Link Card', icon: 'ExternalLink' },
];

export function ConnectionWidgetEditor({ isOpen, onClose, initialWidget }: ConnectionWidgetEditorProps) {
  const { addWidget, updateWidget } = useConnectionsStore();
  const [formData, setFormData] = useState<Partial<ConnectionWidget>>({ type: 'apps' });

  useEffect(() => {
    if (initialWidget) {
      setFormData(initialWidget);
    } else {
      setFormData({
        id: `w-${Date.now()}`,
        type: 'apps',
        title: '',
        icon: 'HelpCircle',
        colSpan: 1,
        rowSpan: 1,
        colorClass: 'bg-black/40',
        iconColorClass: 'text-white bg-white/10'
      });
    }
  }, [initialWidget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.id || !formData.type) return;

    if (initialWidget) {
      updateWidget(formData as ConnectionWidget);
    } else {
      addWidget(formData as ConnectionWidget);
    }
    onClose();
  };

  // Helper just for apps array for now
  const handleAddApp = () => {
    setFormData(prev => ({
      ...prev,
      apps: [...(prev.apps || []), { id: `app-${Date.now()}`, name: '', description: '' }]
    }));
  };

  const handleUpdateApp = (id: string, updates: Partial<AppItem>) => {
    setFormData(prev => ({
      ...prev,
      apps: prev.apps?.map(app => app.id === id ? { ...app, ...updates } : app)
    }));
  };

  const handleRemoveApp = (id: string) => {
    setFormData(prev => ({
      ...prev,
      apps: prev.apps?.filter(app => app.id !== id)
    }));
  };

  // Helper for infoItems array
  const handleAddInfoItem = () => {
    setFormData(prev => ({
      ...prev,
      infoItems: [...(prev.infoItems || []), { id: `info-${Date.now()}`, title: '', description: '' }]
    }));
  };

  const handleUpdateInfoItem = (id: string, updates: Partial<InfoItem>) => {
    setFormData(prev => ({
      ...prev,
      infoItems: prev.infoItems?.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const handleRemoveInfoItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      infoItems: prev.infoItems?.filter(item => item.id !== id)
    }));
  };

  // Helper for tips array
  const handleAddTip = () => {
    setFormData(prev => ({
      ...prev,
      tips: [...(prev.tips || []), { id: `tip-${Date.now()}`, title: '', description: '' }]
    }));
  };

  const handleUpdateTip = (id: string, updates: Partial<TipItem>) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips?.map(tip => tip.id === id ? { ...tip, ...updates } : tip)
    }));
  };

  const handleRemoveTip = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips?.filter(tip => tip.id !== id)
    }));
  };

  // Helper for emergencyItems array
  const handleAddEmergencyItem = () => {
    setFormData(prev => ({
      ...prev,
      emergencyItems: [...(prev.emergencyItems || []), { id: `em-${Date.now()}`, label: '', number: '' }]
    }));
  };

  const handleUpdateEmergencyItem = (id: string, updates: Partial<EmergencyItem>) => {
    setFormData(prev => ({
      ...prev,
      emergencyItems: prev.emergencyItems?.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const handleRemoveEmergencyItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyItems: prev.emergencyItems?.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-serif text-white">{initialWidget ? 'Edit Widget' : 'New Widget'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white p-2">
            <Icons.X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto hide-scrollbar flex-1 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Widget Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                 {WIDGET_TYPES.map(type => (
                   <button
                     key={type.id}
                     type="button"
                     onClick={() => setFormData({ ...formData, type: type.id })}
                     className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all text-xs
                       ${formData.type === type.id 
                         ? 'border-gold bg-gold/10 text-gold' 
                         : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'}`}
                   >
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     {React.createElement((Icons as any)[type.icon] || Icons.HelpCircle, { size: 16 })}
                     {type.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Widget Title</label>
                  <input 
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    type="text" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold"
                    placeholder="e.g. Essential Apps"
                  />
               </div>
               <div>
                  <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Icon (Lucide Name)</label>
                  <input 
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    type="text" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold"
                    placeholder="e.g. Smartphone"
                  />
               </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Description (Optional)</label>
              <input 
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                type="text" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold"
                placeholder="Brief description underneath the title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Span Columns (1-4)</label>
                  <select 
                    value={formData.colSpan || 1}
                    onChange={(e) => setFormData({...formData, colSpan: Number(e.target.value) as 1|2|3|4})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                  >
                    <option value={1}>1 Column (Standard)</option>
                    <option value={2}>2 Columns (Wide)</option>
                    <option value={3}>3 Columns (Extra Wide)</option>
                    <option value={4}>4 Columns (Full Width)</option>
                  </select>
               </div>
            </div>

            {/* Apps specific editor */}
            {formData.type === 'apps' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs uppercase tracking-widest text-white/50 font-bold block">App Items</label>
                   <button type="button" onClick={handleAddApp} className="text-xs text-gold hover:text-white transition-colors">+ Add App</button>
                </div>
                
                <div className="space-y-4">
                   {formData.apps?.map((app) => (
                     <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 relative">
                        <button type="button" onClick={() => handleRemoveApp(app.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300">
                          <Icons.Trash2 size={14} />
                        </button>
                        
                        <div className="pr-8">
                          <input 
                            required
                            value={app.name}
                            onChange={(e) => handleUpdateApp(app.id, { name: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                            placeholder="App Name"
                          />
                          <input 
                            required
                            value={app.description}
                            onChange={(e) => handleUpdateApp(app.id, { description: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                            placeholder="Brief description"
                          />
                          <div className="relative mb-2">
                             <Icons.Image size={14} className="absolute left-3 top-2.5 text-white/50" />
                             <input 
                                value={app.imageUrl || ''}
                                onChange={(e) => handleUpdateApp(app.id, { imageUrl: e.target.value })}
                                type="url" 
                                className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                                placeholder="App Icon / Image URL (Optional)"
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                             <div className="relative">
                               <Icons.Apple size={14} className="absolute left-3 top-2.5 text-white/50" />
                               <input 
                                  value={app.iosUrl || ''}
                                  onChange={(e) => handleUpdateApp(app.id, { iosUrl: e.target.value })}
                                  type="url" 
                                  className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                                  placeholder="App Store URL (Optional)"
                                />
                             </div>
                             <div className="relative">
                               <Icons.Play size={14} className="absolute left-3 top-2.5 text-white/50" />
                               <input 
                                  value={app.androidUrl || ''}
                                  onChange={(e) => handleUpdateApp(app.id, { androidUrl: e.target.value })}
                                  type="url" 
                                  className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                                  placeholder="Play Store URL (Optional)"
                                />
                             </div>
                          </div>
                        </div>
                     </div>
                   ))}
                   {(!formData.apps || formData.apps.length === 0) && (
                     <p className="text-xs text-white/30 text-center py-4 italic">No apps added yet. Click "+ Add App" to start.</p>
                   )}
                </div>
              </div>
            )}
            
            {/* Info List specific editor */}
            {formData.type === 'info-list' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs uppercase tracking-widest text-white/50 font-bold block">Info Items</label>
                   <button type="button" onClick={handleAddInfoItem} className="text-xs text-gold hover:text-white transition-colors">+ Add Item</button>
                </div>
                
                <div className="space-y-4">
                   {formData.infoItems?.map((item) => (
                     <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 relative">
                        <button type="button" onClick={() => handleRemoveInfoItem(item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300">
                          <Icons.Trash2 size={14} />
                        </button>
                        
                        <div className="pr-8">
                          <input 
                            required
                            value={item.title}
                            onChange={(e) => handleUpdateInfoItem(item.id, { title: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                            placeholder="Item Title"
                          />
                          <input 
                            required
                            value={item.description}
                            onChange={(e) => handleUpdateInfoItem(item.id, { description: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                            placeholder="Description"
                          />
                          <input 
                            value={item.iconText || ''}
                            onChange={(e) => handleUpdateInfoItem(item.id, { iconText: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Icon Text (Optional, e.g. bullet or short text)"
                          />
                        </div>
                     </div>
                   ))}
                   {(!formData.infoItems || formData.infoItems.length === 0) && (
                     <p className="text-xs text-white/30 text-center py-4 italic">No items added yet. Click "+ Add Item" to start.</p>
                   )}
                </div>
              </div>
            )}

            {/* Tips specific editor */}
            {formData.type === 'tips' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs uppercase tracking-widest text-white/50 font-bold block">Tips</label>
                   <button type="button" onClick={handleAddTip} className="text-xs text-gold hover:text-white transition-colors">+ Add Tip</button>
                </div>
                
                <div className="space-y-4">
                   {formData.tips?.map((tip) => (
                     <div key={tip.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 relative">
                        <button type="button" onClick={() => handleRemoveTip(tip.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300">
                          <Icons.Trash2 size={14} />
                        </button>
                        
                        <div className="pr-8">
                          <input 
                            required
                            value={tip.title}
                            onChange={(e) => handleUpdateTip(tip.id, { title: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                            placeholder="Tip Title"
                          />
                          <input 
                            required
                            value={tip.description}
                            onChange={(e) => handleUpdateTip(tip.id, { description: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Tip Description/Content"
                          />
                        </div>
                     </div>
                   ))}
                   {(!formData.tips || formData.tips.length === 0) && (
                     <p className="text-xs text-white/30 text-center py-4 italic">No tips added yet. Click "+ Add Tip" to start.</p>
                   )}
                </div>
              </div>
            )}

            {/* Emergency Contacts specific editor */}
            {formData.type === 'emergency' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs uppercase tracking-widest text-white/50 font-bold block">Emergency Contacts</label>
                   <button type="button" onClick={handleAddEmergencyItem} className="text-xs text-gold hover:text-white transition-colors">+ Add Contact</button>
                </div>
                
                <div className="space-y-4">
                   {formData.emergencyItems?.map((item) => (
                     <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 relative">
                        <button type="button" onClick={() => handleRemoveEmergencyItem(item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300">
                          <Icons.Trash2 size={14} />
                        </button>
                        
                        <div className="pr-8">
                          <input 
                            required
                            value={item.label}
                            onChange={(e) => handleUpdateEmergencyItem(item.id, { label: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                            placeholder="Label (e.g. Police, Ambulance)"
                          />
                          <input 
                            required
                            value={item.number}
                            onChange={(e) => handleUpdateEmergencyItem(item.id, { number: e.target.value })}
                            type="text" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Phone Number (e.g. 911)"
                          />
                        </div>
                     </div>
                   ))}
                   {(!formData.emergencyItems || formData.emergencyItems.length === 0) && (
                     <p className="text-xs text-white/30 text-center py-4 italic">No contacts added yet. Click "+ Add Contact" to start.</p>
                   )}
                </div>
              </div>
            )}

            {/* Simple Link Card specific editor */}
            {formData.type === 'link-card' && (
              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                 <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Link Text / CTA</label>
                    <input 
                      required
                      value={formData.linkText || ''}
                      onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                      type="text" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold"
                      placeholder="e.g. Open Digital Custom Card"
                    />
                 </div>
                 <div>
                    <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2 block">Link URL</label>
                    <input 
                      required
                      value={formData.url || ''}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      type="url" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold"
                      placeholder="https://..."
                    />
                 </div>
              </div>
            )}

          </div>
        </form>

        <footer className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-white/5">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
          >
            Save Widget
          </button>
        </footer>

      </div>
    </div>
  );
}
