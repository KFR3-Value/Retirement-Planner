import React, { useState } from 'react';
import { usePlanning, YEARS } from '../context/PlanningContext';
import { formatCHF } from '../utils/format';

export const CapitalTimeline: React.FC = () => {
  const { state, updateState } = usePlanning();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draggedOverYear, setDraggedOverYear] = useState<string | null>(null);

  const pkMarkus = state.scenarioOverrides.pensionskasseMarkus;
  const pkMonique = state.scenarioOverrides.pensionskasseMonique;
  const saeule3a = state.clientBaseline.assets.saeule3a;
  const fzk = state.clientBaseline.assets.freizuegigkeitskonto;

  // Compute actual capital withdrawal amounts
  const pkMarkusWithdrawal = pkMarkus.totalCapital * (1 - pkMarkus.renteSplit / 100);
  const pkMoniqueWithdrawal = pkMonique.totalCapital * (1 - pkMonique.renteSplit / 100);

  const capitalEvents = [
    {
      id: 'pk_markus',
      name: 'PK Bezug Markus (Kapital)',
      year: String(pkMarkus.startYear),
      amount: pkMarkusWithdrawal,
      type: 'pk_markus' as const,
      style: {
        bg: 'bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-400 border-indigo-800/60',
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-300'
      }
    },
    {
      id: 'pk_monique',
      name: 'PK Bezug Monique (Kapital)',
      year: String(pkMonique.startYear),
      amount: pkMoniqueWithdrawal,
      type: 'pk_monique' as const,
      style: {
        bg: 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-400 border-purple-800/60',
        dot: 'bg-purple-500',
        badge: 'bg-purple-500/10 text-purple-300'
      }
    },
    {
      id: 'saeule_3a',
      name: 'Bezug Säule 3a',
      year: String(saeule3a.withdrawalYear),
      amount: saeule3a.balance,
      type: 'saeule_3a' as const,
      style: {
        bg: 'bg-violet-950/40 hover:bg-violet-900/50 text-violet-400 border-violet-800/60',
        dot: 'bg-violet-500',
        badge: 'bg-violet-500/10 text-violet-300'
      }
    },
    {
      id: 'freizuegigkeit',
      name: 'Bezug Freizügigkeitskonto',
      year: String(fzk.withdrawalYear),
      amount: fzk.balance,
      type: 'freizuegigkeit' as const,
      style: {
        bg: 'bg-fuchsia-950/40 hover:bg-fuchsia-900/50 text-fuchsia-400 border-fuchsia-800/60',
        dot: 'bg-fuchsia-500',
        badge: 'bg-fuchsia-500/10 text-fuchsia-300'
      }
    }
  ];

  const handleUpdateYear = (type: 'pk_markus' | 'pk_monique' | 'saeule_3a' | 'freizuegigkeit', newYear: string) => {
    const yearNum = parseInt(newYear);
    if (type === 'pk_markus') {
      updateState('pensionskasseMarkus', { startYear: yearNum });
    } else if (type === 'pk_monique') {
      updateState('pensionskasseMonique', { startYear: yearNum });
    } else if (type === 'saeule_3a') {
      updateState('assets', {
        saeule3a: {
          ...saeule3a,
          withdrawalYear: newYear
        }
      });
    } else if (type === 'freizuegigkeit') {
      updateState('assets', {
        freizuegigkeitskonto: {
          ...fzk,
          withdrawalYear: newYear
        }
      });
    }
  };

  const handleUpdateAmount = (type: 'pk_markus' | 'pk_monique' | 'saeule_3a' | 'freizuegigkeit', amount: number) => {
    if (type === 'pk_markus') {
      updateState('pensionskasseMarkus', { totalCapital: amount });
    } else if (type === 'pk_monique') {
      updateState('pensionskasseMonique', { totalCapital: amount });
    } else if (type === 'saeule_3a') {
      updateState('assets', {
        saeule3a: {
          ...saeule3a,
          balance: amount
        }
      });
    } else if (type === 'freizuegigkeit') {
      updateState('assets', {
        freizuegigkeitskonto: {
          ...fzk,
          balance: amount
        }
      });
    }
  };

  const handleUpdateRenteSplit = (type: 'pk_markus' | 'pk_monique', split: number) => {
    if (type === 'pk_markus') {
      updateState('pensionskasseMarkus', { renteSplit: split });
    } else if (type === 'pk_monique') {
      updateState('pensionskasseMonique', { renteSplit: split });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, year: string) => {
    e.preventDefault();
    setDraggedOverYear(year);
  };

  const handleDrop = (e: React.DragEvent, targetYear: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') as 'pk_markus' | 'pk_monique' | 'saeule_3a' | 'freizuegigkeit';
    if (id) {
      handleUpdateYear(id, targetYear);
    }
    setDraggedOverYear(null);
  };

  const selectedEvent = capitalEvents.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-md font-bold text-slate-100 font-mono">Kapitalbezüge & Vorsorge-Timeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">Verschieben Sie Bezugszeitpunkte per Drag-and-Drop in andere Planungsjahre.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] uppercase font-mono font-bold">
            <span className="flex items-center text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span> PK Markus</span>
            <span className="flex items-center text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span> PK Monique</span>
            <span className="flex items-center text-violet-400"><span className="w-2 h-2 rounded-full bg-violet-500 mr-1.5"></span> Säule 3a</span>
            <span className="flex items-center text-fuchsia-400"><span className="w-2 h-2 rounded-full bg-fuchsia-500 mr-1.5"></span> Freizügigkeit</span>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div className="overflow-x-auto pb-4 pt-1 flex space-x-3 select-none min-h-[160px] scrollbar-thin">
          {YEARS.map(year => {
            const yearEvents = capitalEvents.filter(e => e.year === year);
            const isDraggedOver = draggedOverYear === year;

            return (
              <div 
                key={year}
                onDragOver={(e) => handleDragOver(e, year)}
                onDragLeave={() => setDraggedOverYear(null)}
                onDrop={(e) => handleDrop(e, year)}
                className={`flex-shrink-0 w-44 rounded-lg border transition-all flex flex-col p-2.5 relative ${
                  isDraggedOver 
                    ? 'border-indigo-500 bg-indigo-950/10 shadow-lg scale-[1.01]' 
                    : 'border-slate-800 bg-slate-950/20'
                }`}
              >
                {/* Year Header */}
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-850">
                  <span className="font-mono font-bold text-sm text-slate-200">{year}</span>
                </div>

                {/* Event Cards inside column */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[110px] pr-0.5">
                  {yearEvents.map(event => {
                    const isSelected = selectedEventId === event.id;

                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventId(isSelected ? null : event.id);
                        }}
                        className={`p-2 rounded border cursor-grab active:cursor-grabbing text-left transition-all ${event.style.bg} ${
                          isSelected ? 'ring-2 ring-indigo-500 scale-[0.98] border-transparent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between space-x-1">
                          <span className="font-sans font-medium text-[11px] leading-tight block break-words text-slate-100 flex-grow">
                            {event.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 font-mono">
                          <span className="text-[10px] font-bold">
                            {formatCHF(event.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {yearEvents.length === 0 && (
                    <div className="h-full flex items-center justify-center py-4">
                      <span className="text-[10px] text-slate-700 font-mono italic">Kein Bezug</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Event Details & Editor panel below timeline */}
        {selectedEvent && (
          <div className="mt-4 bg-slate-950/60 p-4 border border-slate-800 rounded-lg animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-grow text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Planungsjahr</span>
                <select
                  value={selectedEvent.year}
                  onChange={(e) => handleUpdateYear(selectedEvent.type, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {selectedEvent.type.startsWith('pk_') ? (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Vorsorgekapital (100% PK)</span>
                    <input 
                      type="number" 
                      value={selectedEvent.type === 'pk_markus' ? pkMarkus.totalCapital : pkMonique.totalCapital}
                      onChange={(e) => handleUpdateAmount(selectedEvent.type, parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono text-right"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Rentenbezug Split (%)</span>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={selectedEvent.type === 'pk_markus' ? pkMarkus.renteSplit : pkMonique.renteSplit}
                      onChange={(e) => handleUpdateRenteSplit(selectedEvent.type as 'pk_markus' | 'pk_monique', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono text-right"
                    />
                  </div>
                  <div className="flex items-center pt-4 pl-2 font-mono text-slate-400 italic">
                    Kapitalbezug: {formatCHF(selectedEvent.amount)}
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Bezugsbetrag (Guthaben)</span>
                  <input 
                    type="number" 
                    value={selectedEvent.amount}
                    onChange={(e) => handleUpdateAmount(selectedEvent.type, parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono text-right"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-2 md:self-end">
              <button 
                onClick={() => setSelectedEventId(null)}
                className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors font-mono"
              >
                Schliessen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
