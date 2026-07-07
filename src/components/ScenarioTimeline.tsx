import React, { useState } from 'react';
import { usePlanning, YEARS, type CapExEvent, type AmortisationEvent } from '../context/PlanningContext';
import { formatCHF } from '../utils/format';

export const ScenarioTimeline: React.FC = () => {
  const { state, updateState } = usePlanning();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draggedOverYear, setDraggedOverYear] = useState<string | null>(null);

  // Form states for inline adding/editing
  const [showAddForm, setShowAddForm] = useState<string | null>(null); // holds year key
  const [showGlobalAddForm, setShowGlobalAddForm] = useState(false);
  const [newYear, setNewYear] = useState<string>(YEARS[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState(10000);
  const [newCategory, setNewCategory] = useState<'housing' | 'living' | 'health'>('housing');
  const [newDeductible, setNewDeductible] = useState(true);

  // New form state for inline amortisation adding
  const [addAmortisationMode, setAddAmortisationMode] = useState(false);
  const [newMortgageType, setNewMortgageType] = useState<'saron' | 'fest'>('saron');

  const capExEvents = state.scenarioOverrides.capExEvents || [];
  const amortisationEvents = state.scenarioOverrides.amortisationEvents || [];

  // Combine events for unified display in timeline
  const combinedEvents = [
    ...capExEvents.map(e => ({
      ...e,
      eventType: 'capex' as const,
      displayName: e.description
    })),
    ...amortisationEvents.map(e => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      year: e.year,
      category: 'housing' as const, // Align with housing color scheme (blue)
      isTaxDeductible: false,
      eventType: 'amortisation' as const,
      mortgageType: e.mortgageType,
      displayName: `[Amort. ${e.mortgageType.toUpperCase()}] ${e.description}`
    }))
  ];

  const handleUpdateCombinedEvent = (id: string, eventType: 'capex' | 'amortisation', updates: any) => {
    if (eventType === 'amortisation') {
      const updated = amortisationEvents.map(e => e.id === id ? { ...e, ...updates } : e);
      updateState('amortisationEvents', updated);
    } else {
      const updated = capExEvents.map(e => e.id === id ? { ...e, ...updates } : e);
      updateState('capExEvents', updated);
    }
  };

  const handleDeleteCombinedEvent = (id: string, eventType: 'capex' | 'amortisation') => {
    const isAmort = eventType === 'amortisation';
    const message = isAmort 
      ? 'Möchten Sie diese einmalige Amortisation wirklich löschen?' 
      : 'Möchten Sie diese geplante Investition wirklich löschen?';

    if (window.confirm(message)) {
      if (isAmort) {
        const filtered = amortisationEvents.filter(e => e.id !== id);
        updateState('amortisationEvents', filtered);
      } else {
        const filtered = capExEvents.filter(e => e.id !== id);
        updateState('capExEvents', filtered);
      }
      if (selectedEventId === id) setSelectedEventId(null);
    }
  };

  const handleAddEvent = (year: string) => {
    if (!newDesc.trim()) return;

    if (addAmortisationMode) {
      const newEvent: AmortisationEvent = {
        id: Date.now().toString(),
        description: newDesc,
        amount: newAmount,
        year,
        mortgageType: newMortgageType
      };
      updateState('amortisationEvents', [...amortisationEvents, newEvent]);
    } else {
      const newEvent: CapExEvent = {
        id: Date.now().toString(),
        description: newDesc,
        amount: newAmount,
        year,
        category: newCategory,
        isTaxDeductible: newDeductible
      };
      updateState('capExEvents', [...capExEvents, newEvent]);
    }

    setShowAddForm(null);
    setShowGlobalAddForm(false);
    setNewDesc('');
    setNewAmount(10000);
    setAddAmortisationMode(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, eventId: string, eventType: 'capex' | 'amortisation') => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.setData('eventType', eventType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, year: string) => {
    e.preventDefault();
    setDraggedOverYear(year);
  };

  const handleDrop = (e: React.DragEvent, targetYear: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    const eventType = e.dataTransfer.getData('eventType') as 'capex' | 'amortisation';
    if (eventId) {
      handleUpdateCombinedEvent(eventId, eventType, { year: targetYear });
    }
    setDraggedOverYear(null);
  };

  const getCategoryStyles = (category?: string, isAmortisation?: boolean) => {
    if (isAmortisation) {
      return {
        bg: 'bg-blue-950/60 hover:bg-blue-900/70 text-blue-300 border-blue-600/40 border-dashed',
        dot: 'bg-blue-400',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-800/40'
      };
    }

    switch (category) {
      case 'housing':
        return {
          bg: 'bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border-blue-800/60',
          dot: 'bg-blue-500',
          badge: 'bg-blue-500/10 text-blue-300 border-blue-800/40'
        };
      case 'health':
        return {
          bg: 'bg-rose-955/40 hover:bg-rose-900/50 text-rose-400 border-rose-800/60',
          dot: 'bg-rose-500',
          badge: 'bg-rose-500/10 text-rose-300 border-rose-850'
        };
      case 'living':
      default:
        return {
          bg: 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border-emerald-800/60',
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-850'
        };
    }
  };

  const selectedEvent = combinedEvents.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-md font-bold text-slate-100 font-mono">Investitions- & Amortisationstimeline</h3>
              <button
                onClick={() => {
                  setShowGlobalAddForm(!showGlobalAddForm);
                  setSelectedEventId(null);
                  setShowAddForm(null);
                  setNewYear(YEARS[0]);
                  setAddAmortisationMode(false);
                }}
                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded border border-emerald-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center font-mono"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                Eintrag hinzufügen
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Verschieben Sie Einträge per Drag-and-Drop in andere Planungsjahre.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] uppercase font-mono font-bold">
            <span className="flex items-center text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Liegenschaft (CapEx)</span>
            <span className="flex items-center text-blue-300 font-normal border-b border-dashed border-blue-500/50 pb-0.5"><span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span> Amortisation (Einmalig)</span>
            <span className="flex items-center text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Lebenshaltung (CapEx)</span>
            <span className="flex items-center text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span> Gesundheit (CapEx)</span>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div className="overflow-x-auto pb-4 pt-1 flex space-x-3 select-none min-h-[260px] scrollbar-thin">
          {YEARS.map(year => {
            const yearEvents = combinedEvents.filter(e => String(e.year) === year);
            const isDraggedOver = draggedOverYear === year;

            return (
              <div 
                key={year}
                onDragOver={(e) => handleDragOver(e, year)}
                onDragLeave={() => setDraggedOverYear(null)}
                onDrop={(e) => handleDrop(e, year)}
                className={`flex-shrink-0 w-44 rounded-lg border transition-all flex flex-col p-2.5 relative ${
                  isDraggedOver 
                    ? 'border-emerald-500 bg-emerald-950/10 shadow-lg scale-[1.01]' 
                    : 'border-slate-800 bg-slate-950/20'
                }`}
              >
                {/* Year Header */}
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-850">
                  <span className="font-mono font-bold text-sm text-slate-200">{year}</span>
                  <button 
                    onClick={() => {
                      setShowAddForm(showAddForm === year ? null : year);
                      setSelectedEventId(null);
                      setShowGlobalAddForm(false);
                      setAddAmortisationMode(false);
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-400 transition-colors px-1"
                    title="Eintrag hinzufügen"
                  >
                    +
                  </button>
                </div>

                {/* Event Cards inside column */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] pr-0.5">
                  {yearEvents.map(event => {
                    const style = getCategoryStyles(event.category, event.eventType === 'amortisation');
                    const isSelected = selectedEventId === event.id;

                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event.id, event.eventType)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventId(isSelected ? null : event.id);
                          setShowAddForm(null);
                          setShowGlobalAddForm(false);
                        }}
                        className={`p-2 rounded border cursor-grab active:cursor-grabbing text-left transition-all ${style.bg} ${
                          isSelected ? 'ring-2 ring-emerald-500 scale-[0.98] border-transparent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between space-x-1">
                          <span className="font-sans font-medium text-[11px] leading-tight block break-words text-slate-100 flex-grow">
                            {event.displayName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 font-mono">
                          <span className="text-[10px] font-bold">
                            {formatCHF(event.amount)}
                          </span>
                          {event.eventType === 'capex' && event.isTaxDeductible && (
                            <span className="text-[8px] px-1 py-0.5 border border-emerald-800/45 text-emerald-400 font-semibold rounded bg-emerald-950/30">
                              Abzug
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {yearEvents.length === 0 && (
                    <div className="h-full flex items-center justify-center py-8">
                      <span className="text-[10px] text-slate-600 font-mono italic">Keine Einträge</span>
                    </div>
                  )}
                </div>

                {/* Inline Add Form */}
                {showAddForm === year && (
                  <div className="absolute top-8 left-0 right-0 bg-slate-900 border border-emerald-850 p-3 rounded-lg shadow-2xl z-30 space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                      <span className="font-bold text-slate-200 font-mono">Hinzufügen ({year})</span>
                      <button onClick={() => setShowAddForm(null)} className="text-slate-400 text-xs">✕</button>
                    </div>
                    
                    {/* Add Mode Selector */}
                    <div className="flex gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
                      <button
                        onClick={() => setAddAmortisationMode(false)}
                        className={`flex-1 text-center py-0.5 rounded font-mono text-[9px] font-bold transition-colors ${!addAmortisationMode ? 'bg-emerald-955 text-emerald-400 border border-emerald-800/40' : 'bg-slate-950 text-slate-500'}`}
                      >
                        CapEx
                      </button>
                      <button
                        onClick={() => setAddAmortisationMode(true)}
                        className={`flex-1 text-center py-0.5 rounded font-mono text-[9px] font-bold transition-colors ${addAmortisationMode ? 'bg-blue-955 text-blue-400 border border-blue-800/40' : 'bg-slate-955 text-slate-500'}`}
                      >
                        Amortisation
                      </button>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Beschreibung</span>
                      <input 
                        type="text" 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder={addAmortisationMode ? "z.B. Teilrückzahlung SARON" : "z.B. Renovation Dach"}
                        className="w-full bg-slate-955 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Betrag (CHF)</span>
                      <input 
                        type="number" 
                        value={newAmount}
                        onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-955 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-100 font-mono text-right"
                      />
                    </div>

                    {!addAmortisationMode ? (
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-[9px] text-slate-400 block mb-0.5">Kategorie</span>
                          <select 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100 font-mono"
                          >
                            <option value="housing">Haus</option>
                            <option value="living">Leben</option>
                            <option value="health">Medizin</option>
                          </select>
                        </div>
                        <div className="flex items-end pb-1.5 pl-1.5">
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newDeductible} 
                              onChange={(e) => setNewDeductible(e.target.checked)}
                              className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-955 rounded"
                            />
                            <span className="text-[9px] text-slate-350">Abziehbar</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] text-slate-400 block mb-0.5">Produkt</span>
                        <select 
                          value={newMortgageType} 
                          onChange={(e) => setNewMortgageType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100 font-mono"
                        >
                          <option value="saron">SARON</option>
                          <option value="fest">FEST</option>
                        </select>
                      </div>
                    )}

                    <button 
                      onClick={() => handleAddEvent(year)}
                      className={`w-full py-1 text-white font-semibold rounded text-xs mt-1 transition-colors ${addAmortisationMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                      Speichern
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Event Details & Editor panel below timeline */}
        {selectedEvent && (
          <div className="mt-4 bg-slate-955/60 p-4 border border-slate-800 rounded-lg animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-grow text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Beschreibung</span>
                <input 
                  type="text" 
                  value={selectedEvent.description}
                  onChange={(e) => handleUpdateCombinedEvent(selectedEvent.id, selectedEvent.eventType, { description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Betrag (CHF)</span>
                <input 
                  type="number" 
                  value={selectedEvent.amount}
                  onChange={(e) => handleUpdateCombinedEvent(selectedEvent.id, selectedEvent.eventType, { amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono text-right"
                />
              </div>

              {selectedEvent.eventType === 'capex' ? (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Kategorie</span>
                    <select 
                      value={selectedEvent.category || 'living'}
                      onChange={(e) => handleUpdateCombinedEvent(selectedEvent.id, selectedEvent.eventType, { category: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    >
                      <option value="housing">Haus (Liegenschafts-Unterhalt/Investition)</option>
                      <option value="living">Konsum (Lebenshaltung/Fahrzeug)</option>
                      <option value="health">Gesundheit (Medizinische Reserven)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-4 pl-2">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedEvent.isTaxDeductible || false}
                        onChange={(e) => handleUpdateCombinedEvent(selectedEvent.id, selectedEvent.eventType, { isTaxDeductible: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-955 rounded"
                      />
                      <span className="text-slate-200 font-mono">Steuerlich abziehbar?</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono font-bold">Amortisationsprodukt</span>
                    <select 
                      value={selectedEvent.mortgageType || 'saron'}
                      onChange={(e) => handleUpdateCombinedEvent(selectedEvent.id, selectedEvent.eventType, { mortgageType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    >
                      <option value="saron">SARON Hypothek</option>
                      <option value="fest">Festhypothek</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-4 pl-2 font-mono text-slate-400 italic">
                    Amortisationen sind steuerlich nicht abziehbar.
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-2 md:self-end">
              <button 
                onClick={() => handleDeleteCombinedEvent(selectedEvent.id, selectedEvent.eventType)}
                className="px-3 py-1.5 border border-rose-800 bg-rose-955/20 text-rose-455 hover:bg-rose-900/30 text-xs font-semibold rounded transition-colors font-mono"
              >
                Löschen
              </button>
              <button 
                onClick={() => setSelectedEventId(null)}
                className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors font-mono"
              >
                Schliessen
              </button>
            </div>
          </div>
        )}

        {/* Global Add Form panel below timeline */}
        {showGlobalAddForm && (
          <div className="mt-4 bg-slate-950/60 p-4 border border-emerald-900/40 rounded-lg animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-grow text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Planungsjahr</span>
                <select 
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Entry type (Amortisation / CapEx) */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Eintragstyp</span>
                <select
                  value={addAmortisationMode ? 'amortisation' : 'capex'}
                  onChange={(e) => setAddAmortisationMode(e.target.value === 'amortisation')}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                >
                  <option value="capex">CapEx Investition</option>
                  <option value="amortisation">Mortgage Amortisation</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Beschreibung</span>
                <input 
                  type="text" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={addAmortisationMode ? "z.B. Teilrückzahlung SARON" : "z.B. Renovation Dach"}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Betrag (CHF)</span>
                <input 
                  type="number" 
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono text-right"
                />
              </div>

              {!addAmortisationMode ? (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Kategorie</span>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    >
                      <option value="housing">Haus (Liegenschafts-Unterhalt/Investition)</option>
                      <option value="living">Konsum (Lebenshaltung/Fahrzeug)</option>
                      <option value="health">Gesundheit (Medizinische Reserven)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-4 pl-2 col-span-1 sm:col-span-2 md:col-span-1">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newDeductible}
                        onChange={(e) => setNewDeductible(e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-955 rounded"
                      />
                      <span className="text-slate-200 font-mono">Steuerlich abziehbar?</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Produkt</span>
                    <select 
                      value={newMortgageType}
                      onChange={(e) => setNewMortgageType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    >
                      <option value="saron">SARON Hypothek</option>
                      <option value="fest">Festhypothek</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-4 pl-2 text-slate-400 italic font-mono text-[10px]">
                    Nicht steuerbar
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-2 md:self-end">
              <button 
                onClick={() => handleAddEvent(newYear)}
                disabled={!newDesc.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded text-xs transition-colors font-mono"
              >
                Hinzufügen
              </button>
              <button 
                onClick={() => {
                  setShowGlobalAddForm(false);
                  setAddAmortisationMode(false);
                }}
                className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors font-mono"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
