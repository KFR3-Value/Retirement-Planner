import { useState } from 'react';
import { usePlanning, YEARS, type YearlyDeductions } from '../context/PlanningContext';
import { useUI } from '../context/UIContext';
import { formatCHF } from '../utils/format';

const MonthSelect = ({ value, onChange, className = "border border-slate-800 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200" }: { value: number, onChange: (val: number) => void, className?: string }) => {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return (
    <select value={value} onChange={e => onChange(Number(e.target.value))} className={className}>
      {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
    </select>
  );
};

export const SettingsModal = () => {
  const { state, updateState } = usePlanning();
  const { activeModalTab, closeSettingsModal } = useUI();
  const [incomeTab, setIncomeTab] = useState<'ahv'|'lohn'|'pk'|'sonstige'>('ahv');

  if (!activeModalTab) return null;

  const handleAddCapEx = (category: 'housing' | 'living' | 'health') => {
    const newEvent = { id: Date.now().toString(), description: 'Neue Investition', amount: 0, year: '2026', isTaxDeductible: false, category };
    updateState('capExEvents', [...state.capExEvents, newEvent]);
  };

  const handleUpdateCapEx = (id: string, updates: any) => {
    updateState('capExEvents', state.capExEvents.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteCapEx = (id: string) => {
    updateState('capExEvents', state.capExEvents.filter(e => e.id !== id));
  };

  const CapExManager = ({ category, label }: { category: 'housing' | 'living' | 'health', label: string }) => {
    const filtered = state.capExEvents.filter(event => {
      if (event.category === category) return true;
      if (!event.category) {
        const isHousing = event.description.toLowerCase().includes('renovation') || event.description.toLowerCase().includes('garten');
        if (category === 'housing' && isHousing) return true;
        if (category === 'living' && !isHousing) return true;
      }
      return false;
    });

    return (
      <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 mt-6">
        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
          <h4 className="font-semibold text-slate-200 text-sm font-mono">{label}</h4>
          <button 
            onClick={() => handleAddCapEx(category)}
            className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-500 transition-colors"
          >
            + Einmalige Investition (CapEx)
          </button>
        </div>
        <div className="space-y-3">
          {filtered.map(event => (
            <div key={event.id} className="flex space-x-3 items-center bg-slate-900 p-2 border border-slate-800 rounded shadow-md text-xs">
              <div className="flex-grow">
                <span className="text-[10px] text-slate-400 block mb-0.5">Beschreibung</span>
                <input 
                  type="text" 
                  value={event.description} 
                  onChange={(e) => handleUpdateCapEx(event.id, { description: e.target.value })} 
                  className="w-full border border-slate-800 bg-slate-950 text-slate-100 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>
              <div className="w-28">
                <span className="text-[10px] text-slate-400 block mb-0.5">Betrag (CHF)</span>
                <input 
                  type="number" 
                  value={event.amount} 
                  onChange={(e) => handleUpdateCapEx(event.id, { amount: Number(e.target.value) })} 
                  className="w-full border border-slate-800 bg-slate-950 text-slate-100 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-right" 
                />
              </div>
              <div className="w-20">
                <span className="text-[10px] text-slate-400 block mb-0.5">Jahr</span>
                <select 
                  value={event.year} 
                  onChange={(e) => handleUpdateCapEx(event.id, { year: e.target.value })}
                  className="w-full border border-slate-800 bg-slate-950 text-slate-100 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="w-20 flex items-end pb-1.5 pl-2">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 animate-pulse-subtle" title="Steuerlich abziehbar?">
                  <input 
                    type="checkbox" 
                    checked={event.isTaxDeductible || false}
                    onChange={(e) => handleUpdateCapEx(event.id, { isTaxDeductible: e.target.checked })}
                    className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-950 rounded"
                  />
                  <span>Abzug</span>
                </label>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => handleDeleteCapEx(event.id)}
                  className="text-rose-500 hover:text-rose-400 px-1 py-1 text-sm font-bold"
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-500 text-xs text-center py-2">Keine einmaligen Investitionen in dieser Kategorie geplant.</p>
          )}
        </div>
      </div>
    );
  };

  const handleAddOtherIncome = () => {
    const newEvent = { id: Date.now().toString(), description: 'Zusatzeinkommen', monthlyAmount: 0, startYear: 2026, startMonth: 0, endYear: 2030, endMonth: 11 };
    updateState('otherIncomeEvents', [...(state.otherIncomeEvents || []), newEvent]);
  };

  const handleUpdateOtherIncome = (id: string, updates: any) => {
    updateState('otherIncomeEvents', (state.otherIncomeEvents || []).map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteOtherIncome = (id: string) => {
    updateState('otherIncomeEvents', (state.otherIncomeEvents || []).filter(e => e.id !== id));
  };

  const handleAddSalaryStream = () => {
    const newStream = { 
      id: Date.now().toString(), 
      description: 'Neuer Lohn', 
      inputType: 'brutto', 
      amount: 0, 
      deductions: { ahv: 5.3, alv: 1.1, nbuv: 1.5, ktg: 0.5, bvg: 5.0, other: 1.6 },
      startYear: 2026, 
      startMonth: 0, 
      endYear: 2026, 
      endMonth: 11 
    };
    updateState('salaryStreams', [...(state.salaryStreams || []), newStream]);
  };

  const handleUpdateSalaryStream = (id: string, updates: any) => {
    updateState('salaryStreams', (state.salaryStreams || []).map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteSalaryStream = (id: string) => {
    updateState('salaryStreams', (state.salaryStreams || []).filter(e => e.id !== id));
  };

  const handleUpdateAHVStream = (streamId: string, updates: any) => {
    updateState('ahv', {
      ...state.ahv,
      scenarios: state.ahv.scenarios.map(scen => 
        scen.id === state.ahv.selectedScenarioId 
          ? { ...scen, streams: scen.streams.map(st => st.id === streamId ? { ...st, ...updates } : st) } 
          : scen
      )
    });
  };

  const handleAddAHVStream = () => {
    updateState('ahv', {
      ...state.ahv,
      scenarios: state.ahv.scenarios.map(scen => 
        scen.id === state.ahv.selectedScenarioId 
          ? { ...scen, streams: [...scen.streams, { id: Date.now().toString(), startYear: 2026, startMonth: 0, endYear: 2099, endMonth: 11, markusAmount: 0, moniqueAmount: 0 }] } 
          : scen
      )
    });
  };

  const handleDeleteAHVStream = (streamId: string) => {
    updateState('ahv', {
      ...state.ahv,
      scenarios: state.ahv.scenarios.map(scen => 
        scen.id === state.ahv.selectedScenarioId 
          ? { ...scen, streams: scen.streams.filter(st => st.id !== streamId) } 
          : scen
      )
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 font-mono">Globale Annahmen & Parameter</h2>
          <button onClick={closeSettingsModal} className="text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-10">
          
          {/* SECTION 1: Einkommen & Vorsorge */}
          {(activeModalTab === 'all' || activeModalTab === 1) && (
            <section>
              <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2 font-mono">1. Einkommen & Vorsorge</h3>

              {/* Sub-tab bar */}
              <div className="flex space-x-1 mb-6 border-b border-slate-800">
                {(['ahv','lohn','pk','sonstige'] as const).map(tab => {
                  const labels: Record<string,string> = { ahv:'AHV', lohn:'Lohn / Gehalt', pk:'Pensionskasse', sonstige:'Sonstige Einkünfte' };
                  return (
                    <button
                      key={tab}
                      onClick={() => setIncomeTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                        incomeTab === tab
                          ? 'bg-slate-950 border border-slate-850 border-b-transparent text-emerald-400 -mb-px z-10'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* AHV Panel */}
              {incomeTab === 'ahv' && (
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h4 className="text-md font-bold text-slate-200 font-mono">AHV Szenarien</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-slate-300 block mb-1">Aktuelles Szenario</span>
                    <select 
                      value={state.ahv.selectedScenarioId} 
                      onChange={(e) => updateState('ahv', { selectedScenarioId: e.target.value })}
                      className="w-full md:w-1/2 border border-slate-850 rounded px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono"
                    >
                      {state.ahv.scenarios.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-slate-300 text-sm">Zahlungsströme (Aktuelles Szenario)</h5>
                      <button onClick={handleAddAHVStream} className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-500 transition-colors">
                        + Neuer Strom
                      </button>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col space-y-4">
                      {(() => {
                        const activeScenario = state.ahv.scenarios.find(s => s.id === state.ahv.selectedScenarioId);
                        const sortedStreams = activeScenario 
                          ? [...activeScenario.streams].sort((a, b) => {
                              if (a.startYear !== b.startYear) return a.startYear - b.startYear;
                              return a.startMonth - b.startMonth;
                            })
                          : [];
                        
                        return sortedStreams.map(stream => (
                          <div key={stream.id} className="flex flex-col space-y-3 bg-slate-900 p-4 border border-slate-800 rounded shadow-lg relative">
                            <div className="absolute top-2 right-2">
                              <button onClick={() => handleDeleteAHVStream(stream.id)} className="text-rose-400 hover:text-rose-300 text-xs">✕</button>
                            </div>
                            
                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <span className="text-xs text-slate-400 block mb-1">Start (J/M)</span>
                                <div className="flex space-x-1">
                                  <input type="number" value={stream.startYear} onChange={(e) => handleUpdateAHVStream(stream.id, { startYear: Number(e.target.value) })} className="w-20 border border-slate-800 rounded px-2 py-1 text-xs bg-slate-950 text-slate-200 font-mono" />
                                  <MonthSelect value={stream.startMonth} onChange={(val) => handleUpdateAHVStream(stream.id, { startMonth: val })} className="flex-1 border border-slate-800 rounded px-2 py-1 text-xs bg-slate-950 text-slate-200" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <span className="text-xs text-slate-400 block mb-1">Ende (J/M)</span>
                                <div className="flex space-x-1">
                                  <input type="number" value={stream.endYear} onChange={(e) => handleUpdateAHVStream(stream.id, { endYear: Number(e.target.value) })} className="w-20 border border-slate-800 rounded px-2 py-1 text-xs bg-slate-950 text-slate-200 font-mono" />
                                  <MonthSelect value={stream.endMonth} onChange={(val) => handleUpdateAHVStream(stream.id, { endMonth: val })} className="flex-1 border border-slate-800 rounded px-2 py-1 text-xs bg-slate-950 text-slate-200" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <span className="text-xs text-slate-400 block mb-1">Markus (CHF/Mt)</span>
                                <input type="number" value={stream.markusAmount} onChange={(e) => handleUpdateAHVStream(stream.id, { markusAmount: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono" />
                              </div>
                              <div className="flex-1">
                                <span className="text-xs text-slate-400 block mb-1">Monique (CHF/Mt)</span>
                                <input type="number" value={stream.moniqueAmount} onChange={(e) => handleUpdateAHVStream(stream.id, { moniqueAmount: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono" />
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Pensionskasse Panel */}
              {incomeTab === 'pk' && (
              <div className="mb-10 bg-slate-950/40 p-6 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h4 className="text-md font-bold text-slate-200 font-mono">Pensionskasse</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Start (Jahr / Monat)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.pensionskasse.startYear} onChange={(e) => updateState('pensionskasse', { startYear: Number(e.target.value) })} className="w-20 border border-slate-800 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono" />
                        <MonthSelect value={state.pensionskasse.startMonth} onChange={(val) => updateState('pensionskasse', { startMonth: val })} className="w-20 border border-slate-800 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Total Kapital</span>
                      <input type="number" value={state.pensionskasse.totalCapital} onChange={(e) => updateState('pensionskasse', { totalCapital: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Rente %</span>
                      <input type="number" value={state.pensionskasse.renteSplit} onChange={(e) => updateState('pensionskasse', { renteSplit: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono" min={0} max={100} />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">UWS %</span>
                      <input type="number" step="0.1" value={state.pensionskasse.umwandlungssatz} onChange={(e) => updateState('pensionskasse', { umwandlungssatz: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono" />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Lohn Panel */}
              {incomeTab === 'lohn' && (
              <div className="mb-10 bg-slate-950/40 p-6 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h4 className="text-md font-bold text-slate-200 font-mono">Lohn / Gehalt</h4>
                  <button onClick={handleAddSalaryStream} className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-500 transition-colors">
                    + Neuer Lohnstrom
                  </button>
                </div>
                <div className="space-y-6">
                  {(state.salaryStreams || []).map(stream => {
                    const d = stream.deductions || { ahv:0, alv:0, nbuv:0, ktg:0, bvg:0, other:0 };
                    const totalDeductionAmt =
                      ((d.ahvBasis??stream.amount)*(d.ahv||0)/100) +
                      ((d.alvBasis??stream.amount)*(d.alv||0)/100) +
                      ((d.nubvBasis??stream.amount)*(d.nbuv||0)/100) +
                      ((d.ktgBasis??stream.amount)*(d.ktg||0)/100) +
                      ((d.bvgBasis??stream.amount)*(d.bvg||0)/100) +
                      ((d.otherBasis??stream.amount)*(d.other||0)/100);
                    const net = stream.inputType === 'brutto' ? stream.amount - totalDeductionAmt : stream.amount;
                    const ausbezahlt = net;
                    return (
                    <div key={stream.id} className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden">
                      {/* Card header */}
                      <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800">
                        <input type="text" value={stream.description} onChange={(e) => handleUpdateSalaryStream(stream.id, { description: e.target.value })} className="font-semibold text-sm bg-transparent border-none text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 w-56 font-mono" />
                        <div className="flex items-center space-x-2">
                          <select value={stream.inputType} onChange={(e) => handleUpdateSalaryStream(stream.id, { inputType: e.target.value })} className="text-xs border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200">
                            <option value="brutto">Brutto-Eingabe</option>
                            <option value="netto">Netto-Eingabe</option>
                          </select>
                          <button onClick={() => handleDeleteSalaryStream(stream.id)} className="text-rose-400 hover:text-rose-300 text-xs px-1">✕</button>
                        </div>
                      </div>

                      <div className="px-4 py-3 space-y-1 text-sm">
                        {/* Monatslohn row */}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400 text-xs w-40">Monatslohn (Brutto)</span>
                          <input type="number" value={stream.amount} onChange={(e) => handleUpdateSalaryStream(stream.id, { amount: Number(e.target.value) })} className="w-28 border border-slate-800 rounded px-2 py-0.5 text-xs text-right bg-slate-950 text-slate-200 focus:ring-emerald-500 focus:border-emerald-500 font-mono" />
                        </div>

                        {/* Bruttolohn total */}
                        <div className="flex justify-between items-center py-1.5 border-t border-b border-slate-800 font-bold">
                          <span className="text-slate-300">5000 Bruttolohn</span>
                          <span className="text-right w-28 pr-2 font-mono text-slate-100">{stream.amount.toLocaleString('de-CH', {minimumFractionDigits:2})} CHF</span>
                        </div>

                        {/* Deductions — only for brutto */}
                        {stream.inputType === 'brutto' && (
                          <div className="space-y-1 pt-1">
                            {/* header row */}
                            <div className="grid grid-cols-[1fr_6rem_4rem_6rem] gap-2 text-[10px] text-slate-500 uppercase pb-0.5 font-mono">
                              <span>Position</span><span className="text-right">Basis</span><span className="text-right">Satz</span><span className="text-right">Betrag</span>
                            </div>
                            {[
                              { key:'ahv',   basisKey:'ahvBasis',   label:'6100 AHV/IV/EO' },
                              { key:'alv',   basisKey:'alvBasis',   label:'6200 ALV' },
                              { key:'nbuv',  basisKey:'nubvBasis',  label:'6300 NBUV' },
                              { key:'ktg',   basisKey:'ktgBasis',   label:'6350 KTG' },
                              { key:'bvg',   basisKey:'bvgBasis',   label:'6400 BVG Risiko/Spar' },
                              { key:'other', basisKey:'otherBasis', label:'Sonstige' },
                            ].map(row => {
                              const pct: number = (d as any)[row.key] || 0;
                              const basis: number = (d as any)[row.basisKey] ?? stream.amount;
                              const amt = basis * pct / 100;
                              return (
                                <div key={row.key} className="grid grid-cols-[1fr_6rem_4rem_6rem] gap-2 items-center text-xs py-0.5 font-mono text-slate-300">
                                  <span className="text-slate-400">{row.label}</span>
                                  <input
                                    type="number"
                                    value={basis}
                                    onChange={(e) => handleUpdateSalaryStream(stream.id, { deductions: { ...d, [row.basisKey]: Number(e.target.value) }})}
                                    className="w-full border border-slate-800 rounded px-1 py-0.5 text-xs text-right bg-slate-950 text-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                  <div className="flex items-center">
                                    <input type="number" step="0.01" value={pct} onChange={(e) => handleUpdateSalaryStream(stream.id, { deductions: { ...d, [row.key]: Number(e.target.value) }})} className="w-full border border-slate-800 rounded px-1 py-0.5 text-xs text-right bg-slate-950 text-slate-200" />
                                    <span className="ml-0.5 text-slate-500">%</span>
                                  </div>
                                  <span className={`text-right font-medium ${amt < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{amt === 0 ? '—' : `${amt < 0 ? '+' : '-'}${Math.abs(amt).toLocaleString('de-CH',{minimumFractionDigits:2})}`}</span>
                                </div>
                              );
                            })}
                            {/* Total deductions */}
                            <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-xs font-semibold text-rose-400 font-mono">
                              <span>7950 Total Abzüge</span>
                              <span>-{(
                                ((d.ahvBasis??stream.amount)*(d.ahv||0)/100) +
                                ((d.alvBasis??stream.amount)*(d.alv||0)/100) +
                                ((d.nubvBasis??stream.amount)*(d.nbuv||0)/100) +
                                ((d.ktgBasis??stream.amount)*(d.ktg||0)/100) +
                                ((d.bvgBasis??stream.amount)*(d.bvg||0)/100) +
                                ((d.otherBasis??stream.amount)*(d.other||0)/100)
                              ).toLocaleString('de-CH',{minimumFractionDigits:2})} CHF</span>
                            </div>
                          </div>
                        )}

                        {/* Nettolohn */}
                        <div className="flex justify-between items-center py-1.5 border-t border-b border-slate-800 font-bold">
                          <span className="text-slate-300">8000 Nettolohn</span>
                          <span className="text-emerald-400 font-mono">{net.toLocaleString('de-CH',{minimumFractionDigits:2})} CHF</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-xs text-slate-500">
                          <span>9000 Ausbezahlter Lohn (monatlich)</span>
                          <span className="font-semibold text-slate-300 font-mono">{ausbezahlt.toLocaleString('de-CH',{minimumFractionDigits:2})} CHF</span>
                        </div>

                        {/* Period */}
                        <div className="flex space-x-4 pt-2 border-t border-slate-800 mt-1">
                          <div className="flex-1">
                            <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">Von</span>
                            <div className="flex space-x-1">
                              <input type="number" value={stream.startYear} onChange={(e) => handleUpdateSalaryStream(stream.id, { startYear: Number(e.target.value) })} className="w-16 border border-slate-800 rounded px-1 py-0.5 text-xs bg-slate-950 text-slate-200 font-mono" />
                              <MonthSelect value={stream.startMonth} onChange={(val) => handleUpdateSalaryStream(stream.id, { startMonth: val })} className="flex-1 border border-slate-800 rounded px-1 py-0.5 text-xs bg-slate-950 text-slate-200" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">Bis</span>
                            <div className="flex space-x-1">
                              <input type="number" value={stream.endYear} onChange={(e) => handleUpdateSalaryStream(stream.id, { endYear: Number(e.target.value) })} className="w-16 border border-slate-800 rounded px-1 py-0.5 text-xs bg-slate-950 text-slate-200 font-mono" />
                              <MonthSelect value={stream.endMonth} onChange={(val) => handleUpdateSalaryStream(stream.id, { endMonth: val })} className="flex-1 border border-slate-800 rounded px-1 py-0.5 text-xs bg-slate-950 text-slate-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                  {(!state.salaryStreams || state.salaryStreams.length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-4">Keine Lohnströme erfasst.</p>
                  )}
                </div>
              </div>
              )}

              {/* Sonstige Panel */}
              {incomeTab === 'sonstige' && (
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h4 className="text-md font-bold text-slate-200 font-mono">Sonstige Einkünfte</h4>
                  <button onClick={handleAddOtherIncome} className="px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded hover:bg-emerald-500 transition-colors">
                    + Einkommen
                  </button>
                </div>
                <div className="space-y-4">
                  {(state.otherIncomeEvents || []).map(event => (
                    <div key={event.id} className="flex flex-col space-y-3 bg-slate-900 p-3 border border-slate-800 rounded shadow-md">
                      <div className="flex space-x-4 items-center">
                        <div className="flex-grow">
                          <span className="text-xs text-slate-400 block mb-1">Beschreibung</span>
                          <input type="text" value={event.description} onChange={(e) => handleUpdateOtherIncome(event.id, { description: e.target.value })} className="w-full border border-slate-800 rounded px-3 py-2 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div className="w-32">
                          <span className="text-xs text-slate-400 block mb-1">Betrag/Monat</span>
                          <input type="number" value={event.monthlyAmount} onChange={(e) => handleUpdateOtherIncome(event.id, { monthlyAmount: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-2 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono" />
                        </div>
                        <div className="pt-5">
                          <button onClick={() => handleDeleteOtherIncome(event.id)} className="text-rose-400 hover:text-rose-300 px-2 py-2" title="Löschen">✕</button>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div>
                          <span className="text-xs text-slate-400 block mb-1">Start (J/M)</span>
                          <div className="flex space-x-2">
                            <input type="number" value={event.startYear} onChange={(e) => handleUpdateOtherIncome(event.id, { startYear: Number(e.target.value) })} className="w-20 border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono" />
                            <MonthSelect value={event.startMonth} onChange={(val) => handleUpdateOtherIncome(event.id, { startMonth: val })} className="w-20 border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100" />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block mb-1">Ende (J/M)</span>
                          <div className="flex space-x-2">
                            <input type="number" value={event.endYear} onChange={(e) => handleUpdateOtherIncome(event.id, { endYear: Number(e.target.value) })} className="w-20 border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono" />
                            <MonthSelect value={event.endMonth} onChange={(val) => handleUpdateOtherIncome(event.id, { endMonth: val })} className="w-20 border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!state.otherIncomeEvents || state.otherIncomeEvents.length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-4">Keine sonstigen Einkünfte erfasst.</p>
                  )}
                </div>
              </div>
              )}
            </section>
          )}

          {(activeModalTab === 'all' || activeModalTab === 2) && (
            <section>
              <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2 font-mono">2. Lebenshaltung & Konsum</h3>
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                      <tr className="text-slate-400 text-xs font-mono uppercase text-left">
                        <th className="pb-3 pr-4">Budget-Kategorie</th>
                        <th className="pb-3 px-4 text-right w-36">Monatlich (CHF/Mt)</th>
                        <th className="pb-3 pl-4 text-right w-36">Jährlich (CHF/Jahr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-sm">
                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Haushalt & Nahrung</div>
                          <div className="text-[10px] text-slate-500">Lebensmittel, Haustiere, sonstige Haushaltskosten</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.living.haushaltEssen || 0) / 12)}
                            onChange={(e) => updateState('living', { haushaltEssen: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.living.haushaltEssen || 0}
                            onChange={(e) => updateState('living', { haushaltEssen: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Mobilität</div>
                          <div className="text-[10px] text-slate-500">Auto, Motorrad, OeV Abos</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.living.mobilitaet || 0) / 12)}
                            onChange={(e) => updateState('living', { mobilitaet: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.living.mobilitaet || 0}
                            onChange={(e) => updateState('living', { mobilitaet: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Telefon, Handy & Medien</div>
                          <div className="text-[10px] text-slate-500">Mobiltelefon, Internet, TV, Radio (Serafe)</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.living.telefonHandyMedien || 0) / 12)}
                            onChange={(e) => updateState('living', { telefonHandyMedien: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.living.telefonHandyMedien || 0}
                            onChange={(e) => updateState('living', { telefonHandyMedien: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Kleider & Freizeit</div>
                          <div className="text-[10px] text-slate-500">Hobbies, Kultur, Restaurant, Kleidung</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.living.kleiderFreizeit || 0) / 12)}
                            onChange={(e) => updateState('living', { kleiderFreizeit: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.living.kleiderFreizeit || 0}
                            onChange={(e) => updateState('living', { kleiderFreizeit: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Ferien & Reisen</div>
                          <div className="text-[10px] text-slate-500">Urlaub, Hotels, Flugtickets, Ausflüge</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.living.ferienReisen || 0) / 12)}
                            onChange={(e) => updateState('living', { ferienReisen: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.living.ferienReisen || 0}
                            onChange={(e) => updateState('living', { ferienReisen: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Versicherungen (Sonstige)</div>
                          <div className="text-[10px] text-slate-500">Hausrat, Haftpflicht, Rechtsschutz</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.living.versicherungenSonstige || 0) / 12)}
                            onChange={(e) => updateState('living', { versicherungenSonstige: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.living.versicherungenSonstige || 0}
                            onChange={(e) => updateState('living', { versicherungenSonstige: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <CapExManager category="living" label="Einmalige Konsum-Ausgaben (z.B. Fahrzeugkauf)" />
              </div>
            </section>
          )}

          {(activeModalTab === 'all' || activeModalTab === 3) && (
            <section>
              <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2 font-mono">3. Gesundheit & Diverses</h3>
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                      <tr className="text-slate-400 text-xs font-mono uppercase text-left">
                        <th className="pb-3 pr-4">Kategorie</th>
                        <th className="pb-3 px-4 text-right w-36">Monatlich (CHF/Mt)</th>
                        <th className="pb-3 pl-4 text-right w-36">Jährlich (CHF/Jahr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-sm">
                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Kranken- & Unfallversicherung (Grundprämie)</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={state.health.applyAgeIncrease}
                                onChange={(e) => updateState('health', { applyAgeIncrease: e.target.checked })}
                                className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-950 rounded"
                              />
                              <span>Alters-Erhöhung (+{state.health.ageIncreaseRate}% p.a. ab 2027)</span>
                            </label>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.health.krankenkasseBase || 0) / 12)}
                            onChange={(e) => updateState('health', { krankenkasseBase: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.health.krankenkasseBase || 0}
                            onChange={(e) => updateState('health', { krankenkasseBase: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Zahnarzt, Optiker & Franchise</div>
                          <div className="text-[10px] text-slate-500">Zahnarztbesuche, Brillen, Medikamente (Selbstbehalt)</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.health.zahnarztOptiker || 0) / 12)}
                            onChange={(e) => updateState('health', { zahnarztOptiker: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.health.zahnarztOptiker || 0}
                            onChange={(e) => updateState('health', { zahnarztOptiker: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 pr-4 text-slate-200">
                          <div>Diverses & Reserve</div>
                          <div className="text-[10px] text-slate-500">Spenden, Vereinsbeiträge, Taschengeld, Unvorhergesehenes</div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={Math.round((state.health.diversesReserve || 0) / 12)}
                            onChange={(e) => updateState('health', { diversesReserve: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="number"
                            value={state.health.diversesReserve || 0}
                            onChange={(e) => updateState('health', { diversesReserve: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Jährlicher Erhöhungssatz (%)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={state.health.ageIncreaseRate}
                      onChange={(e) => updateState('health', { ageIncreaseRate: Number(e.target.value) })}
                      className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <CapExManager category="health" label="Einmalige Gesundheits-Ausgaben / Reserven (CapEx)" />
              </div>
            </section>
          )}

          {(activeModalTab === 'all' || activeModalTab === 4) && (
            <section>
              <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2 font-mono">4. Wohnen & Immobilie</h3>
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 bg-slate-900 p-4 rounded border border-slate-800">
                    <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono border-b border-slate-800 pb-1.5">Werte & Steuern</h4>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Belehnungswert (Bankwert) (CHF)</span>
                      <input type="number" value={state.housing.bankLendingValue} onChange={(e) => updateState('housing', { bankLendingValue: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Steuerwert Liegenschaft (CHF)</span>
                      <input type="number" value={state.housing.efhTaxValue} onChange={(e) => updateState('housing', { efhTaxValue: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Eigenmietwert (Steuern) (CHF)</span>
                      <input type="number" value={state.housing.eigenmietwert} onChange={(e) => updateState('housing', { eigenmietwert: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-900 p-4 rounded border border-slate-800">
                    <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono border-b border-slate-800 pb-1.5">Hypothekarschulden</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Saron Betrag</span>
                        <input type="number" value={state.housing.saronAmount} onChange={(e) => updateState('housing', { saronAmount: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-xs" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Saron Zins (%)</span>
                        <input type="number" step="0.01" value={state.housing.saronRate} onChange={(e) => updateState('housing', { saronRate: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Fest Betrag</span>
                        <input type="number" value={state.housing.festAmount} onChange={(e) => updateState('housing', { festAmount: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-xs" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Fest Zins (%)</span>
                        <input type="number" step="0.01" value={state.housing.festRate} onChange={(e) => updateState('housing', { festRate: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-100 font-mono text-xs" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Amortisation (p.a.)</span>
                      <input type="number" value={state.housing.amortisation} onChange={(e) => updateState('housing', { amortisation: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-900 p-4 rounded border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono border-b border-slate-800 pb-1.5">Unterhalt & Stress-Kosten</h4>
                      <div className="mt-3">
                        <span className="text-xs text-slate-400 block mb-1">Unterhaltssatz (als % vom Steuerwert)</span>
                        <input type="number" step="0.1" value={state.housing.unterhaltRate} onChange={(e) => updateState('housing', { unterhaltRate: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                      </div>
                    </div>
                    
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] space-y-1.5 font-mono text-slate-400">
                      <div className="text-slate-200 font-semibold mb-1 text-[11px] font-sans">Kalkulatorische Stress-Kosten (Banken)</div>
                      <div className="flex justify-between">
                        <span>Kalkulatorischer Zins (5% stress):</span>
                        <span className="text-rose-455">CHF {formatCHF(((state.housing.saronAmount || 0) + (state.housing.festAmount || 0)) * 0.05).replace('CHF', '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kalk. Unterhaltskosten (1% bankwert):</span>
                        <span className="text-rose-455">CHF {formatCHF((state.housing.bankLendingValue || 0) * 0.01).replace('CHF', '')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                  <h4 className="font-semibold text-slate-200 text-sm font-mono border-b border-slate-800 pb-2 mb-3">Laufende Nebenkosten der Liegenschaft</h4>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs font-mono uppercase text-left">
                        <th>Kategorie</th>
                        <th className="text-right w-36">Monatlich (CHF/Mt)</th>
                        <th className="text-right w-36 pl-4">Jährlich (CHF/Jahr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 text-slate-200">
                          <div>Strom & Heizung (Nebenkosten)</div>
                          <div className="text-[10px] text-slate-500">Heizöl/Gas, Strom, Wasser, Kehricht, Kaminfeger</div>
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={Math.round((state.housing.stromHeizung || 0) / 12)}
                            onChange={(e) => updateState('housing', { stromHeizung: Number(e.target.value) * 12 })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                        <td className="py-2 pl-4">
                          <input
                            type="number"
                            value={state.housing.stromHeizung || 0}
                            onChange={(e) => updateState('housing', { stromHeizung: Number(e.target.value) })}
                            className="w-full border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <CapExManager category="housing" label="Einmalige Liegenschafts-Investitionen / Renovationen (CapEx)" />
              </div>
            </section>
          )}

          {(activeModalTab === 'all' || activeModalTab === 5) && (
            <section>
              <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2 font-mono">5. Vermögen & Finanzplan-Parameter</h3>
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-slate-900 p-4 rounded border border-slate-800">
                    <h4 className="font-semibold text-slate-200 text-sm font-mono border-b border-slate-800 pb-1.5">Verfügbares Vermögen (Start)</h4>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Startvermögen Liquide (CHF)</span>
                      <input type="number" value={state.assets.startingLiquidWealth} onChange={(e) => updateState('assets', { startingLiquidWealth: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Rendite auf freies Vermögen (%)</span>
                      <input type="number" step="0.1" value={state.baseline.liquidYieldRate} onChange={(e) => updateState('baseline', { liquidYieldRate: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-900 p-4 rounded border border-slate-800">
                    <h4 className="font-semibold text-slate-200 text-sm font-mono border-b border-slate-800 pb-1.5">Gebundenes Kapital (Vorsorgebezug)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-slate-400 block mb-1">Säule 3a Saldo (CHF)</span>
                        <input type="number" value={state.assets.saeule3a.balance} onChange={(e) => updateState('assets', { saeule3a: { ...state.assets.saeule3a, balance: Number(e.target.value) }})} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block mb-1">Bezugsjahr</span>
                        <input type="text" value={state.assets.saeule3a.withdrawalYear} onChange={(e) => updateState('assets', { saeule3a: { ...state.assets.saeule3a, withdrawalYear: e.target.value }})} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" placeholder="z.B. 2028" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-slate-400 block mb-1">Freizügigkeitskonto (CHF)</span>
                        <input type="number" value={state.assets.freizuegigkeitskonto.balance} onChange={(e) => updateState('assets', { freizuegigkeitskonto: { ...state.assets.freizuegigkeitskonto, balance: Number(e.target.value) }})} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block mb-1">Bezugsjahr</span>
                        <input type="text" value={state.assets.freizuegigkeitskonto.withdrawalYear} onChange={(e) => updateState('assets', { freizuegigkeitskonto: { ...state.assets.freizuegigkeitskonto, withdrawalYear: e.target.value }})} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" placeholder="z.B. 2027" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <h4 className="font-semibold text-slate-200 text-sm font-mono border-b border-slate-800 pb-1.5 mb-3">Globale Parameter</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Jährlicher Inflationssatz (%)</span>
                      <input type="number" step="0.1" value={state.baseline.inflationRate} onChange={(e) => updateState('baseline', { inflationRate: Number(e.target.value) })} className="w-full border border-slate-800 rounded px-3 py-1.5 bg-slate-950 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm" />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.baseline.applyInflation}
                          onChange={(e) => updateState('baseline', { applyInflation: e.target.checked })}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-950 rounded"
                        />
                        <span>Inflation anwenden (ab 2031+)</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

          {(activeModalTab === 'all' || activeModalTab === 6) && (
            <section>
              <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2 font-mono">6. Steuerabzüge (Multi-Year)</h3>
              <div className="bg-slate-950/40 p-6 rounded-lg border border-slate-800 space-y-6">
                <p className="text-xs text-slate-400">
                  Erfassen Sie hier Ihre steuerlichen Abzüge für die kommenden Planungsjahre. Gesetzliche Obergrenzen für den Kanton Aargau (AG) und die direkte Bundessteuer (CH) werden in den Berechnungen automatisch angewendet.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-slate-350 text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
                        <th className="py-3 px-3 text-left font-medium w-64">Abzugsart</th>
                        {YEARS.map(y => (
                          <th key={y} className="py-3 px-3 text-right font-medium w-24">{y}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {(
                        [
                          { label: 'Fahrkosten (Ziffer 10.1)', field: 'transport', help: 'Pendlerkosten. Capped bei max. 7\'000 CHF für Kanton (AG) und 3\'200 CHF für Bund (CH).' },
                          { label: 'Auswärtige Verpflegung (Ziffer 10.2)', field: 'meal', help: 'Mehrkosten Mittagessen. Capped bei max. 3\'200 CHF (Kanton & Bund).' },
                          { label: 'Übrige Berufskosten (Ziffer 10.3)', field: 'professional', help: 'Pauschale oder effektive Kosten für Arbeitsmittel etc.' },
                          { label: 'Kinderdrittbetreuung (Ziffer 15.0)', field: 'childcare', help: 'Kosten für Fremdbetreuung. Capped bei max. 10\'000 CHF (AG) / 25\'000 CHF (CH) pro Kind.' },
                          { label: 'Unterhaltsbeiträge (Ziffer 12.0)', field: 'alimony', help: 'Gezahlte Alimente an Ex-Partner/Kinder. Steuerlich voll abziehbar.' },
                          { label: 'Spenden / Zuwendungen (Ziffer 15.3)', field: 'donations', help: 'Gemeinnützige Spenden. Capped bei max. 20% des Nettoeinkommens.' },
                          { label: 'Aus- und Weiterbildung (Ziffer 15.5)', field: 'education', help: 'Berufsorientierte Aus- und Weiterbildungskosten. Capped bei max. 12\'000 CHF.' },
                          { label: 'Übrige Abzüge (Ziffer 15.6)', field: 'other', help: 'Diverse andere gesetzlich zugelassene Abzüge.' }
                        ] as { label: string; field: keyof YearlyDeductions; help: string }[]
                      ).map(row => (
                        <tr key={row.field} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-3 font-medium">
                            <span className="block text-slate-200">{row.label}</span>
                            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">{row.help}</span>
                          </td>
                          {YEARS.map(year => {
                            const val = state.taxDeductions?.[year]?.[row.field] ?? 0;
                            return (
                              <td key={year} className="py-2 px-2 text-right">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={val === 0 ? '' : val}
                                    onChange={(e) => {
                                      const newVal = Math.max(0, Number(e.target.value));
                                      const currentYearDeds = state.taxDeductions[year] || {
                                        transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0
                                      };
                                      updateState('taxDeductions', {
                                        ...state.taxDeductions,
                                        [year]: {
                                          ...currentYearDeds,
                                          [row.field]: newVal
                                        }
                                      });
                                    }}
                                    placeholder="0"
                                    className="w-24 border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono text-xs"
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button onClick={closeSettingsModal} className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-500 transition-colors">Schliessen</button>
        </div>
      </div>
    </div>
  );
};
