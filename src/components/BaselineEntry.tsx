import React, { useState, useEffect } from 'react';
import { usePlanning, YEARS, type SalaryStream, type OtherIncomeEvent } from '../context/PlanningContext';
import { useUI } from '../context/UIContext';

const MonthSelect: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return (
    <select 
      value={value} 
      onChange={e => onChange(Number(e.target.value))} 
      className="border border-slate-800 rounded px-2.5 py-1.5 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 text-xs font-mono"
    >
      {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
    </select>
  );
};

export const BaselineEntry: React.FC = () => {
  const { state, updateState } = usePlanning();
  const { activeModalTab } = useUI();
  const [activeAccordion, setActiveAccordion] = useState<'income' | 'assets' | 'expenses' | null>('income');
  const [incomeTab, setIncomeTab] = useState<'salary' | 'ahv' | 'pk' | 'other'>('salary');
  const [expenseTab, setExpenseTab] = useState<'living' | 'health' | 'housing'>('living');

  useEffect(() => {
    if (activeModalTab === 1) {
      setActiveAccordion('income');
      setIncomeTab('salary');
    } else if (activeModalTab === 2) {
      setActiveAccordion('expenses');
      setExpenseTab('living');
    } else if (activeModalTab === 3) {
      setActiveAccordion('expenses');
      setExpenseTab('health');
    } else if (activeModalTab === 4) {
      setActiveAccordion('expenses');
      setExpenseTab('housing');
    } else if (activeModalTab === 5) {
      setActiveAccordion('assets');
    }
  }, [activeModalTab]);

  const baseline = state.clientBaseline;
  const overrides = state.scenarioOverrides;

  const toggleAccordion = (accordion: 'income' | 'assets' | 'expenses') => {
    setActiveAccordion(activeAccordion === accordion ? null : accordion);
  };

  // --- CapEx helpers mapped via updateState ---
  const handleUpdate = (section: string, updates: any) => {
    updateState(section, updates);
  };

  // --- Salary Stream helpers ---
  const handleAddSalaryStream = () => {
    const newStream: SalaryStream = {
      id: Date.now().toString(),
      description: 'Neuer Lohn',
      inputType: 'brutto',
      amount: 0,
      deductions: { ahv: 5.3, alv: 1.1, nbuv: 1.5, ktg: 0.5, bvg: 5.0, other: 1.6 },
      startYear: 2026,
      startMonth: 0,
      endYear: 2026,
      endMonth: 11,
      owner: 'Markus'
    };
    updateState('salaryStreams', [...(baseline.salaryStreams || []), newStream]);
  };

  const handleUpdateSalaryStream = (id: string, updates: any) => {
    updateState('salaryStreams', (baseline.salaryStreams || []).map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteSalaryStream = (id: string) => {
    updateState('salaryStreams', (baseline.salaryStreams || []).filter(s => s.id !== id));
  };

  // --- AHV helpers ---
  const handleUpdateAHVStream = (streamId: string, updates: any) => {
    updateState('ahv', {
      ...baseline.ahv,
      scenarios: baseline.ahv.scenarios.map(scen => 
        scen.id === baseline.ahv.selectedScenarioId 
          ? { ...scen, streams: scen.streams.map(st => st.id === streamId ? { ...st, ...updates } : st) } 
          : scen
      )
    });
  };

  const handleAddAHVStream = () => {
    updateState('ahv', {
      ...baseline.ahv,
      scenarios: baseline.ahv.scenarios.map(scen => 
        scen.id === baseline.ahv.selectedScenarioId 
          ? { ...scen, streams: [...scen.streams, { id: Date.now().toString(), startYear: 2026, startMonth: 0, endYear: 2099, endMonth: 11, markusAmount: 0, moniqueAmount: 0 }] } 
          : scen
      )
    });
  };

  const handleDeleteAHVStream = (streamId: string) => {
    updateState('ahv', {
      ...baseline.ahv,
      scenarios: baseline.ahv.scenarios.map(scen => 
        scen.id === baseline.ahv.selectedScenarioId 
          ? { ...scen, streams: scen.streams.filter(st => st.id !== streamId) } 
          : scen
      )
    });
  };

  // --- Other Income helpers ---
  const handleAddOtherIncome = () => {
    const newEvent: OtherIncomeEvent = {
      id: Date.now().toString(),
      description: 'Zusatzeinkommen',
      monthlyAmount: 0,
      startYear: 2026,
      startMonth: 0,
      endYear: 2030,
      endMonth: 11,
      owner: 'Gemeinsam'
    };
    updateState('otherIncomeEvents', [...(baseline.otherIncomeEvents || []), newEvent]);
  };

  const handleUpdateOtherIncome = (id: string, updates: any) => {
    updateState('otherIncomeEvents', (baseline.otherIncomeEvents || []).map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteOtherIncome = (id: string) => {
    updateState('otherIncomeEvents', (baseline.otherIncomeEvents || []).filter(e => e.id !== id));
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Einkünfte & Vorsorge Accordion */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden transition-all shadow-md">
        <button 
          onClick={() => toggleAccordion('income')}
          className="w-full px-5 py-4 flex items-center justify-between text-left font-mono font-bold text-slate-100 bg-slate-950/40 hover:bg-slate-950/60 transition-colors"
        >
          <span className="flex items-center text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5"></span>
            1. EINKÜNFTE & VORSORGE (INCOME)
          </span>
          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${activeAccordion === 'income' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {activeAccordion === 'income' && (
          <div className="p-5 border-t border-slate-800 space-y-6">
            {/* Sub-tab selector */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-px">
              {(['salary', 'ahv', 'pk', 'other'] as const).map(tab => {
                const labels = { salary: 'Lohnströme', ahv: 'AHV Szenarien', pk: 'Pensionskasse', other: 'Sonstiges' };
                return (
                  <button
                    key={tab}
                    onClick={() => setIncomeTab(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-t transition-all ${
                      incomeTab === tab
                        ? 'bg-slate-950 border border-slate-800 border-b-transparent text-emerald-400 -mb-px z-10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Salary Streams Panel */}
            {incomeTab === 'salary' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Aktive Lohnströme</h4>
                  <button 
                    onClick={handleAddSalaryStream}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-colors"
                  >
                    + Lohnstrom hinzufügen
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(baseline.salaryStreams || []).map(stream => (
                    <div key={stream.id} className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3 relative">
                      <button 
                        onClick={() => handleDeleteSalaryStream(stream.id)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 text-sm font-bold"
                        title="Löschen"
                      >
                        ✕
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Beschreibung</span>
                          <input 
                            type="text" 
                            value={stream.description} 
                            onChange={(e) => handleUpdateSalaryStream(stream.id, { description: e.target.value })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Eigentümer</span>
                          <select 
                            value={stream.owner || 'Markus'} 
                            onChange={(e) => handleUpdateSalaryStream(stream.id, { owner: e.target.value })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                          >
                            <option value="Markus">Markus</option>
                            <option value="Monique">Monique</option>
                            <option value="Gemeinsam">Gemeinsam</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Eingabe-Typ</span>
                          <select 
                            value={stream.inputType} 
                            onChange={(e) => handleUpdateSalaryStream(stream.id, { inputType: e.target.value })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                          >
                            <option value="brutto">Brutto</option>
                            <option value="netto">Netto (Auszahlung)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Monatlicher Betrag (CHF)</span>
                          <input 
                            type="number" 
                            value={stream.amount} 
                            onChange={(e) => handleUpdateSalaryStream(stream.id, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Start-Zeitraum</span>
                          <div className="flex space-x-1">
                            <input 
                              type="number" 
                              value={stream.startYear} 
                              onChange={(e) => handleUpdateSalaryStream(stream.id, { startYear: parseInt(e.target.value) || 2026 })}
                              className="w-16 text-xs border border-slate-800 rounded px-2 py-1.5 bg-slate-950 text-slate-100 font-mono"
                            />
                            <MonthSelect value={stream.startMonth} onChange={(val) => handleUpdateSalaryStream(stream.id, { startMonth: val })} />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Ende-Zeitraum</span>
                          <div className="flex space-x-1">
                            <input 
                              type="number" 
                              value={stream.endYear} 
                              onChange={(e) => handleUpdateSalaryStream(stream.id, { endYear: parseInt(e.target.value) || 2099 })}
                              className="w-16 text-xs border border-slate-800 rounded px-2 py-1.5 bg-slate-950 text-slate-100 font-mono"
                            />
                            <MonthSelect value={stream.endMonth} onChange={(val) => handleUpdateSalaryStream(stream.id, { endMonth: val })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!baseline.salaryStreams || baseline.salaryStreams.length === 0) && (
                    <p className="text-slate-500 text-xs text-center py-4">Keine Lohnströme erfasst.</p>
                  )}
                </div>
              </div>
            )}

            {/* AHV Panel */}
            {incomeTab === 'ahv' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Aktives AHV Szenario</label>
                    <select 
                      value={baseline.ahv.selectedScenarioId} 
                      onChange={(e) => handleUpdate('ahv', { ...baseline.ahv, selectedScenarioId: e.target.value })}
                      className="w-full text-xs border border-slate-800 rounded px-3 py-2 bg-slate-950 text-slate-200 font-mono"
                    >
                      {baseline.ahv.scenarios.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end pt-5">
                    <button 
                      onClick={handleAddAHVStream}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-colors"
                    >
                      + Zahlungsstrom hinzufügen
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const activeScenario = baseline.ahv.scenarios.find(s => s.id === baseline.ahv.selectedScenarioId);
                    return activeScenario?.streams.map(stream => (
                      <div key={stream.id} className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3 relative">
                        <button 
                          onClick={() => handleDeleteAHVStream(stream.id)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 text-sm font-bold"
                          title="Löschen"
                        >
                          ✕
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Start-Zeitraum</span>
                            <div className="flex space-x-2">
                              <input 
                                type="number" 
                                value={stream.startYear} 
                                onChange={(e) => handleUpdateAHVStream(stream.id, { startYear: parseInt(e.target.value) || 2026 })}
                                className="w-20 text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                              />
                              <MonthSelect value={stream.startMonth} onChange={(val) => handleUpdateAHVStream(stream.id, { startMonth: val })} />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Ende-Zeitraum</span>
                            <div className="flex space-x-2">
                              <input 
                                type="number" 
                                value={stream.endYear} 
                                onChange={(e) => handleUpdateAHVStream(stream.id, { endYear: parseInt(e.target.value) || 2099 })}
                                className="w-20 text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                              />
                              <MonthSelect value={stream.endMonth} onChange={(val) => handleUpdateAHVStream(stream.id, { endMonth: val })} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Rente Markus (CHF/Mt)</span>
                            <input 
                              type="number" 
                              value={stream.markusAmount} 
                              onChange={(e) => handleUpdateAHVStream(stream.id, { markusAmount: parseFloat(e.target.value) || 0 })}
                              className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Rente Monique (CHF/Mt)</span>
                            <input 
                              type="number" 
                              value={stream.moniqueAmount} 
                              onChange={(e) => handleUpdateAHVStream(stream.id, { moniqueAmount: parseFloat(e.target.value) || 0 })}
                              className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                            />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Pensionskasse Settings */}
            {incomeTab === 'pk' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* PK Markus */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 border-b border-slate-800 pb-1">Markus Pensionskasse</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Start-Jahr</span>
                      <input 
                        type="number" 
                        value={overrides.pensionskasseMarkus.startYear} 
                        onChange={(e) => handleUpdate('pensionskasseMarkus', { startYear: parseInt(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Start-Monat</span>
                      <MonthSelect value={overrides.pensionskasseMarkus.startMonth} onChange={(val) => handleUpdate('pensionskasseMarkus', { startMonth: val })} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">PK-Kapital bei Pensionierung (CHF)</span>
                    <input 
                      type="number" 
                      value={overrides.pensionskasseMarkus.totalCapital} 
                      onChange={(e) => handleUpdate('pensionskasseMarkus', { totalCapital: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Rentensplit (%)</span>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={overrides.pensionskasseMarkus.renteSplit} 
                        onChange={(e) => handleUpdate('pensionskasseMarkus', { renteSplit: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Umwandlungssatz (%)</span>
                      <input 
                        type="number" 
                        step="0.001"
                        value={overrides.pensionskasseMarkus.umwandlungssatz} 
                        onChange={(e) => handleUpdate('pensionskasseMarkus', { umwandlungssatz: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* PK Monique */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-rose-400 border-b border-slate-800 pb-1">Monique Pensionskasse</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Start-Jahr</span>
                      <input 
                        type="number" 
                        value={overrides.pensionskasseMonique.startYear} 
                        onChange={(e) => handleUpdate('pensionskasseMonique', { startYear: parseInt(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Start-Monat</span>
                      <MonthSelect value={overrides.pensionskasseMonique.startMonth} onChange={(val) => handleUpdate('pensionskasseMonique', { startMonth: val })} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">PK-Kapital bei Pensionierung (CHF)</span>
                    <input 
                      type="number" 
                      value={overrides.pensionskasseMonique.totalCapital} 
                      onChange={(e) => handleUpdate('pensionskasseMonique', { totalCapital: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Rentensplit (%)</span>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={overrides.pensionskasseMonique.renteSplit} 
                        onChange={(e) => handleUpdate('pensionskasseMonique', { renteSplit: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Umwandlungssatz (%)</span>
                      <input 
                        type="number" 
                        step="0.001"
                        value={overrides.pensionskasseMonique.umwandlungssatz} 
                        onChange={(e) => handleUpdate('pensionskasseMonique', { umwandlungssatz: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Incomes Panel */}
            {incomeTab === 'other' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Zusätzliche Einkünfte</h4>
                  <button 
                    onClick={handleAddOtherIncome}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-colors"
                  >
                    + Zufluss erfassen
                  </button>
                </div>

                <div className="space-y-4">
                  {(baseline.otherIncomeEvents || []).map(event => (
                    <div key={event.id} className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3 relative">
                      <button 
                        onClick={() => handleDeleteOtherIncome(event.id)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 text-sm font-bold"
                        title="Löschen"
                      >
                        ✕
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <span className="text-[10px] text-slate-400 block mb-1">Beschreibung</span>
                          <input 
                            type="text" 
                            value={event.description} 
                            onChange={(e) => handleUpdateOtherIncome(event.id, { description: e.target.value })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Eigentümer</span>
                          <select 
                            value={event.owner || 'Gemeinsam'} 
                            onChange={(e) => handleUpdateOtherIncome(event.id, { owner: e.target.value })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                          >
                            <option value="Markus">Markus</option>
                            <option value="Monique">Monique</option>
                            <option value="Gemeinsam">Gemeinsam</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Monatlicher Betrag (CHF)</span>
                          <input 
                            type="number" 
                            value={event.monthlyAmount} 
                            onChange={(e) => handleUpdateOtherIncome(event.id, { monthlyAmount: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Start-Zeitraum</span>
                          <div className="flex space-x-1">
                            <input 
                              type="number" 
                              value={event.startYear} 
                              onChange={(e) => handleUpdateOtherIncome(event.id, { startYear: parseInt(e.target.value) || 2026 })}
                              className="w-16 text-xs border border-slate-800 rounded px-2 py-1.5 bg-slate-950 text-slate-100 font-mono"
                            />
                            <MonthSelect value={event.startMonth} onChange={(val) => handleUpdateOtherIncome(event.id, { startMonth: val })} />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Ende-Zeitraum</span>
                          <div className="flex space-x-1">
                            <input 
                              type="number" 
                              value={event.endYear} 
                              onChange={(e) => handleUpdateOtherIncome(event.id, { endYear: parseInt(e.target.value) || 2099 })}
                              className="w-16 text-xs border border-slate-800 rounded px-2 py-1.5 bg-slate-950 text-slate-100 font-mono"
                            />
                            <MonthSelect value={event.endMonth} onChange={(val) => handleUpdateOtherIncome(event.id, { endMonth: val })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!baseline.otherIncomeEvents || baseline.otherIncomeEvents.length === 0) && (
                    <p className="text-slate-500 text-xs text-center py-4">Keine zusätzlichen Einkünfte erfasst.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Vermögen & Säule 3a Accordion */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden transition-all shadow-md">
        <button 
          onClick={() => toggleAccordion('assets')}
          className="w-full px-5 py-4 flex items-center justify-between text-left font-mono font-bold text-slate-100 bg-slate-950/40 hover:bg-slate-950/60 transition-colors"
        >
          <span className="flex items-center text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2.5"></span>
            2. VERMÖGEN & SÄULE 3A (ASSETS)
          </span>
          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${activeAccordion === 'assets' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {activeAccordion === 'assets' && (
          <div className="p-5 border-t border-slate-800 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-blue-400 border-b border-slate-800 pb-1">Liquide Mittel</h4>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Startguthaben Liquides Vermögen (CHF)</label>
                  <input 
                    type="number" 
                    value={baseline.assets.startingLiquidWealth} 
                    onChange={(e) => handleUpdate('assets', { ...baseline.assets, startingLiquidWealth: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right focus:ring-emerald-500"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">Freie liquide Geldmittel, Sparkonten, Depots per Anfang 2026.</p>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-blue-400 border-b border-slate-800 pb-1">Vorsorgekonten</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Säule 3a Guthaben</label>
                    <input 
                      type="number" 
                      value={baseline.assets.saeule3a.balance} 
                      onChange={(e) => handleUpdate('assets', { ...baseline.assets, saeule3a: { ...baseline.assets.saeule3a, balance: parseFloat(e.target.value) || 0 }})}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Bezugsjahr 3a</label>
                    <select
                      value={baseline.assets.saeule3a.withdrawalYear}
                      onChange={(e) => handleUpdate('assets', { ...baseline.assets, saeule3a: { ...baseline.assets.saeule3a, withdrawalYear: e.target.value }})}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Freizügigkeitsguthaben</label>
                    <input 
                      type="number" 
                      value={baseline.assets.freizuegigkeitskonto.balance} 
                      onChange={(e) => handleUpdate('assets', { ...baseline.assets, freizuegigkeitskonto: { ...baseline.assets.freizuegigkeitskonto, balance: parseFloat(e.target.value) || 0 }})}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Bezugsjahr FZK</label>
                    <select
                      value={baseline.assets.freizuegigkeitskonto.withdrawalYear}
                      onChange={(e) => handleUpdate('assets', { ...baseline.assets, freizuegigkeitskonto: { ...baseline.assets.freizuegigkeitskonto, withdrawalYear: e.target.value }})}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Ausgaben Accordion */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden transition-all shadow-md">
        <button 
          onClick={() => toggleAccordion('expenses')}
          className="w-full px-5 py-4 flex items-center justify-between text-left font-mono font-bold text-slate-100 bg-slate-950/40 hover:bg-slate-950/60 transition-colors"
        >
          <span className="flex items-center text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2.5"></span>
            3. BUDGET & AUSGABEN (EXPENSES)
          </span>
          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${activeAccordion === 'expenses' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {activeAccordion === 'expenses' && (
          <div className="p-5 border-t border-slate-800 space-y-6">
            {/* Sub-tab selector */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-px">
              {(['living', 'health', 'housing'] as const).map(tab => {
                const labels = { living: 'Lebenshaltung & Konsum', health: 'Gesundheit & Vorsorge', housing: 'Wohnen & Liegenschaft' };
                return (
                  <button
                    key={tab}
                    onClick={() => setExpenseTab(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-t transition-all ${
                      expenseTab === tab
                        ? 'bg-slate-950 border border-slate-800 border-b-transparent text-emerald-400 -mb-px z-10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Living Expenses tab */}
            {expenseTab === 'living' && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-4">
                <h4 className="text-xs font-mono font-bold text-rose-400 border-b border-slate-800 pb-1">JÄHRLICHE AUSGABEN FÜR LEBENSHALTUNG</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'haushaltEssen', label: 'Haushalt & Essen (CHF/Jahr)', desc: 'Lebensmittel, Reinigung, Haushaltswaren' },
                    { key: 'mobilitaet', label: 'Mobilität (CHF/Jahr)', desc: 'Autounterhalt, Versicherung, ÖV, Benzin' },
                    { key: 'telefonHandyMedien', label: 'Medien & Kommunikation (CHF/Jahr)', desc: 'Telefon, Handy, Internet, Abos' },
                    { key: 'kleiderFreizeit', label: 'Kleider & Freizeit (CHF/Jahr)', desc: 'Shopping, Hobbys, Sport, Kultur' },
                    { key: 'ferienReisen', label: 'Ferien & Reisen (CHF/Jahr)', desc: 'Urlaubsaufenthalte, Ausflüge' },
                    { key: 'versicherungenSonstige', label: 'Übrige Versicherungen (CHF/Jahr)', desc: 'Haftpflicht, Hausrat, Rechtsschutz' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-slate-300">{field.label}</label>
                        <span className="text-[10px] text-slate-500 font-mono">Mt: {Math.round((baseline.living[field.key as keyof typeof baseline.living] || 0) / 12).toLocaleString('de-CH')} CHF</span>
                      </div>
                      <input 
                        type="number" 
                        value={baseline.living[field.key as keyof typeof baseline.living]}
                        onChange={(e) => handleUpdate('living', { [field.key]: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                      />
                      <p className="text-[9px] text-slate-500">{field.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Expenses tab */}
            {expenseTab === 'health' && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-4">
                <h4 className="text-xs font-mono font-bold text-rose-400 border-b border-slate-800 pb-1">JÄHRLICHE AUSGABEN FÜR GESUNDHEIT</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-300">Krankenkassenprämie (CHF/Jahr)</label>
                      <span className="text-[10px] text-slate-500 font-mono">Mt: {Math.round(baseline.health.krankenkasseBase / 12).toLocaleString('de-CH')} CHF</span>
                    </div>
                    <input 
                      type="number" 
                      value={baseline.health.krankenkasseBase}
                      onChange={(e) => handleUpdate('health', { krankenkasseBase: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Grundprämie & Zusatzversicherungen für beide Personen.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Zahnarzt & Optiker (CHF/Jahr)</label>
                    <input 
                      type="number" 
                      value={baseline.health.zahnarztOptiker}
                      onChange={(e) => handleUpdate('health', { zahnarztOptiker: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Regelmässige Kosten für Zähne, Brillen, Linsen.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Diverses & Reserve (CHF/Jahr)</label>
                    <input 
                      type="number" 
                      value={baseline.health.diversesReserve}
                      onChange={(e) => handleUpdate('health', { diversesReserve: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Franchisen, Selbstbehalte, sonstige ungedeckte Medizinkosten.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="health-age-increase" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                        Altersbedingte KK-Prämiensteigerung
                      </label>
                      <input 
                        id="health-age-increase"
                        type="checkbox"
                        checked={baseline.health.applyAgeIncrease}
                        onChange={(e) => handleUpdate('health', { applyAgeIncrease: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950 rounded"
                      />
                    </div>
                    {baseline.health.applyAgeIncrease && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <label>Jährliche Erhöhungsrate (%)</label>
                          <span className="font-mono">{baseline.health.ageIncreaseRate}%</span>
                        </div>
                        <input 
                          type="number" 
                          step="0.1"
                          value={baseline.health.ageIncreaseRate}
                          onChange={(e) => handleUpdate('health', { ageIncreaseRate: parseFloat(e.target.value) || 0 })}
                          className="w-full text-xs border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Housing & Mortgage tab */}
            {expenseTab === 'housing' && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 space-y-4">
                <h4 className="text-xs font-mono font-bold text-rose-400 border-b border-slate-800 pb-1">LIEGENSCHAFT & HYPOTHEKE</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Steuerwert EFH Bettwil (CHF)</label>
                    <input 
                      type="number" 
                      value={baseline.housing.efhTaxValue}
                      onChange={(e) => handleUpdate('housing', { efhTaxValue: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Basis für Vermögenssteuer & Eigenmietwert-Schätzung.</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Marktwert / Bankbelehnung (CHF)</label>
                    <input 
                      type="number" 
                      value={baseline.housing.bankLendingValue}
                      onChange={(e) => handleUpdate('housing', { bankLendingValue: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Für Tragbarkeits-Audit (Kalkulatorische Zinsen).</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-350">Eigenmietwert (CHF/Jahr)</label>
                    <input 
                      type="number" 
                      value={baseline.housing.eigenmietwert}
                      onChange={(e) => handleUpdate('housing', { eigenmietwert: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Steueraufrechnung (Ziffer 11.0, fällt ab 2029 weg).</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Strom, Wasser, Heizung (Nebenkosten/Jahr)</label>
                    <input 
                      type="number" 
                      value={baseline.housing.stromHeizung}
                      onChange={(e) => handleUpdate('housing', { stromHeizung: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Unterhalts-Rückstellung (% EFH-Wert/Jahr)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={baseline.housing.unterhaltRate}
                      onChange={(e) => handleUpdate('housing', { unterhaltRate: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                    <p className="text-[9px] text-slate-500">Normalerweise 1.0% bis 1.5% des Liegenschaftswerts.</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Geplante jährliche Amortisation (CHF)</label>
                    <input 
                      type="number" 
                      value={baseline.housing.amortisation || 0}
                      onChange={(e) => handleUpdate('housing', { amortisation: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs border border-slate-800 rounded px-2.5 py-1.5 bg-slate-950 text-slate-100 font-mono text-right"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <h5 className="text-xs font-bold text-slate-350 font-mono">HYPOTHEKARTRANCHEN</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* SARON */}
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-2">
                      <h6 className="text-xs font-bold text-emerald-450 font-mono">Tranche 1: SARON Flex</h6>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Betrag (CHF)</label>
                          <input 
                            type="number" 
                            value={baseline.housing.saronAmount}
                            onChange={(e) => handleUpdate('housing', { saronAmount: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-right"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Zinssatz (%)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={baseline.housing.saronRate}
                            onChange={(e) => handleUpdate('housing', { saronRate: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-right"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Feste Hypothek */}
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-2">
                      <h6 className="text-xs font-bold text-blue-400 font-mono">Tranche 2: Festhypothek</h6>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Betrag (CHF)</label>
                          <input 
                            type="number" 
                            value={baseline.housing.festAmount}
                            onChange={(e) => handleUpdate('housing', { festAmount: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-right"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Zinssatz (%)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={baseline.housing.festRate}
                            onChange={(e) => handleUpdate('housing', { festRate: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-right"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
