import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useConnectionsStore } from '../store/useConnectionsStore';
import type { ConnectionWidget } from '../types/connections';
import { ConnectionWidgetEditor } from './ConnectionWidgetEditor';

const DynamicIcon = ({ name, size = 20, className = '' }: { name: string, size?: number, className?: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon size={size} className={className} />;
};

export function ConnectionsView() {
  const { widgets, isEditMode, setEditMode, removeWidget } = useConnectionsStore();
  const [editingWidget, setEditingWidget] = useState<ConnectionWidget | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = (widget: ConnectionWidget) => {
    setEditingWidget(widget);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingWidget(null);
    setIsEditorOpen(true);
  };

  const renderWidgetContent = (widget: ConnectionWidget) => {
    switch (widget.type) {
      case 'apps':
        return (
          <div className="flex flex-col gap-3 flex-1">
            {widget.apps?.map(app => (
              <div key={app.id} className="bg-white/5 rounded-2xl p-3 border border-white/5 group-hover:border-gold/20 transition-all flex gap-3">
                {app.imageUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <img src={app.imageUrl} alt={`${app.name} icon`} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 flex items-center justify-center border border-white/10">
                     <Icons.Smartphone size={20} className="text-white/30" />
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate mb-1">{app.name}</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 mb-2">{app.description}</p>
                  {(app.iosUrl || app.androidUrl) && (
                    <div className="flex items-center gap-2 mt-auto pt-1">
                      {app.iosUrl && (
                        <a href={app.iosUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white" aria-label="Download on App Store">
                          <Icons.Apple size={14} />
                          <span className="text-[10px] font-bold tracking-wide uppercase">App Store</span>
                        </a>
                      )}
                      {app.androidUrl && (
                        <a href={app.androidUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white" aria-label="Get it on Google Play">
                          <Icons.Play size={14} />
                          <span className="text-[10px] font-bold tracking-wide uppercase">Google Play</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'info-list':
        return (
          <div className="flex-1 flex flex-col justify-center">
            {widget.description && <p className="text-sm text-white/70 leading-relaxed mb-4">{widget.description}</p>}
            <ul className="flex flex-col gap-3">
              {widget.infoItems?.map((info) => (
                <li key={info.id} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {info.iconText && (
                    <div className="w-10 h-10 shrink-0 bg-black/50 rounded-full flex items-center justify-center border border-white/10">
                      <span className="text-gold font-bold text-[10px] uppercase">{info.iconText}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">{info.title}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{info.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'tips':
        return (
          <div className="relative z-10 h-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mt-2">
              {widget.tips?.map((tip, index) => (
                <div key={tip.id} className={`space-y-1 ${index === 4 ? 'sm:col-span-2' : ''}`}>
                   <span className="text-gold font-bold font-serif italic text-lg">0{index + 1}</span>
                   <h4 className="text-sm font-bold text-white">{tip.title}</h4>
                   <p className="text-[11px] text-white/50">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'emergency':
        return (
          <div className="space-y-3 flex-1">
             {widget.description && <p className="text-xs text-white/50 mb-4">{widget.description}</p>}
             {widget.emergencyItems?.map(item => (
               <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-sm text-white/70">{item.label}</span>
                 <a href={`tel:${item.number}`} className="text-white font-bold bg-white/10 px-3 py-1 rounded-full text-xs hover:bg-white/20 transition-all">{item.number}</a>
               </div>
             ))}
          </div>
        );
      case 'link-card':
        return (
          <>
            <p className="text-xs text-white/50 leading-relaxed flex-1">{widget.description}</p>
            <div className="mt-4 pt-4 border-t border-white/10 group-hover:border-white/20">
              <a href={widget.url || '#'} className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                {widget.linkText} &rarr;
              </a>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto px-6 pb-24 pt-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-serif text-white mb-2">The Vault</h2>
            <p className="text-white/60 text-sm">Essential tools, contacts, and insider knowledge for navigating Tulum like a pro.</p>
          </div>
          
          <button
            onClick={() => setEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2
              ${isEditMode ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {isEditMode ? <Icons.Check size={14} /> : <Icons.Settings size={14} />}
            {isEditMode ? 'Done' : 'Edit Vault'}
          </button>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`
                relative flex flex-col rounded-3xl p-6 group transition-all overflow-hidden
                border border-white/10 backdrop-blur-md
                ${widget.colSpan === 2 ? 'md:col-span-2 lg:col-span-2' : ''}
                ${widget.colSpan === 3 ? 'md:col-span-2 lg:col-span-3' : ''}
                ${widget.colSpan === 4 ? 'col-span-full' : ''}
                ${widget.rowSpan === 2 ? 'lg:row-span-2' : ''}
                ${widget.colorClass || 'bg-black/40'}
                ${isEditMode ? 'ring-1 ring-gold/50 cursor-pointer hover:ring-gold' : 'hover:bg-black/50'}
              `}
              onClick={() => isEditMode && handleEdit(widget)}
            >
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${widget.iconColorClass || 'text-white bg-white/10'}`}>
                  <DynamicIcon name={widget.icon} />
                </div>
                <h3 className="text-lg font-bold text-white relative z-10">{widget.title}</h3>
              </div>

              {widget.type === 'tips' && (
                 <div className="absolute top-0 right-0 p-8 opacity-5 text-gold transform rotate-12 scale-150 group-hover:scale-[1.65] transition-transform duration-700 ease-out pointer-events-none">
                   <DynamicIcon name={widget.icon} size={120} />
                 </div>
              )}

              {renderWidgetContent(widget)}

              {/* Edit Mode Overlay */}
              {isEditMode && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-50 rounded-3xl backdrop-blur-sm">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(widget); }}
                    className="w-12 h-12 bg-gold text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Icons.Edit2 size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                    className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Icons.Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add New Widget Placeholder (Only visible in edit mode) */}
          {isEditMode && (
            <button
              onClick={handleAddNew}
              className="bg-white/5 border-2 border-dashed border-white/20 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-white/10 hover:border-gold/50 transition-all text-white/50 hover:text-gold group min-h-[200px]"
            >
              <Icons.Plus size={40} className="mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-widest uppercase text-xs">Add Widget</span>
            </button>
          )}

        </div>
      </div>

      <ConnectionWidgetEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialWidget={editingWidget} 
      />
    </div>
  );
}
