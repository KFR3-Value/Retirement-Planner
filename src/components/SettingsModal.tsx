import { useState } from 'react';
import { usePlanning, YEARS } from '../context/PlanningContext';
import { useUI } from '../context/UIContext';

const MonthSelect = ({ value, onChange, className = "border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-white" }: { value: number, onChange: (val: number) => void, className?: string }) => {
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

  const handleAddCapEx = () => {
    const newEvent = { id: Date.now().toString(), description: 'Neue Investition', amount: 0, year: '2026', isTaxDeductible: false };
    updateState('capExEvents', [...state.capExEvents, newEvent]);
  };

  const handleUpdateCapEx = (id: string, updates: any) => {
    updateState('capExEvents', state.capExEvents.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteCapEx = (id: string) => {
    updateState('capExEvents', state.capExEvents.filter(e => e.id !== id));
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Globale Annahmen & Parameter</h2>
          <button onClick={closeSettingsModal} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-10">
          
          {/* SECTION 1: Einkommen & Vorsorge */}
          {(activeModalTab === 'all' || activeModalTab === 1) && (
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">1. Einkommen & Vorsorge</h3>

              {/* Sub-tab bar */}
              <div className="flex space-x-1 mb-6 border-b border-gray-200">
                {(['ahv','lohn','pk','sonstige'] as const).map(tab => {
                  const labels: Record<string,string> = { ahv:'AHV', lohn:'Lohn / Gehalt', pk:'Pensionskasse', sonstige:'Sonstige Einkünfte' };
                  return (
                    <button
                      key={tab}
                      onClick={() => setIncomeTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                        incomeTab === tab
                          ? 'bg-white border border-b-white border-gray-200 text-blue-700 -mb-px z-10'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* AHV Panel */}
              {incomeTab === 'ahv' && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
                  <h4 className="text-lg font-bold text-gray-800">AHV Szenarien</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">Aktuelles Szenario</span>
                    <select 
                      value={state.ahv.selectedScenarioId} 
                      onChange={(e) => updateState('ahv', { selectedScenarioId: e.target.value })}
                      className="w-full md:w-1/2 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {state.ahv.scenarios.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-gray-700 text-sm">Zahlungsströme (Aktuelles Szenario)</h5>
                      <button onClick={handleAddAHVStream} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                        + Neuer Strom
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {state.ahv.scenarios.find(s => s.id === state.ahv.selectedScenarioId)?.streams.map(stream => (
                        <div key={stream.id} className="flex flex-col space-y-3 bg-white p-4 border rounded shadow-sm relative">
                          <div className="absolute top-2 right-2">
                            <button onClick={() => handleDeleteAHVStream(stream.id)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                          </div>
                          
                          <div className="flex space-x-4">
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-1">Start (J/M)</span>
                              <div className="flex space-x-1">
                                <input type="number" value={stream.startYear} onChange={(e) => handleUpdateAHVStream(stream.id, { startYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-xs" />
                                <MonthSelect value={stream.startMonth} onChange={(val) => handleUpdateAHVStream(stream.id, { startMonth: val })} className="flex-1 border rounded px-2 py-1 text-xs bg-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-1">Ende (J/M)</span>
                              <div className="flex space-x-1">
                                <input type="number" value={stream.endYear} onChange={(e) => handleUpdateAHVStream(stream.id, { endYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-xs" />
                                <MonthSelect value={stream.endMonth} onChange={(val) => handleUpdateAHVStream(stream.id, { endMonth: val })} className="flex-1 border rounded px-2 py-1 text-xs bg-white" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-4">
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-1">Markus (CHF/Mt)</span>
                              <input type="number" value={stream.markusAmount} onChange={(e) => handleUpdateAHVStream(stream.id, { markusAmount: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-1">Monique (CHF/Mt)</span>
                              <input type="number" value={stream.moniqueAmount} onChange={(e) => handleUpdateAHVStream(stream.id, { moniqueAmount: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Pensionskasse Panel */}
              {incomeTab === 'pk' && (
              <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
                  <h4 className="text-lg font-bold text-gray-800">Pensionskasse</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Start (Jahr / Monat)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.pensionskasse.startYear} onChange={(e) => updateState('pensionskasse', { startYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                        <MonthSelect value={state.pensionskasse.startMonth} onChange={(val) => updateState('pensionskasse', { startMonth: val })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Total Kapital</span>
                      <input type="number" value={state.pensionskasse.totalCapital} onChange={(e) => updateState('pensionskasse', { totalCapital: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Rente %</span>
                      <input type="number" value={state.pensionskasse.renteSplit} onChange={(e) => updateState('pensionskasse', { renteSplit: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={0} max={100} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">UWS %</span>
                      <input type="number" step="0.1" value={state.pensionskasse.umwandlungssatz} onChange={(e) => updateState('pensionskasse', { umwandlungssatz: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Lohn Panel */}
              {incomeTab === 'lohn' && (
              <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
                  <h4 className="text-lg font-bold text-gray-800">Lohn / Gehalt</h4>
                  <button onClick={handleAddSalaryStream} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
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
                    <div key={stream.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                      {/* Card header */}
                      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
                        <input type="text" value={stream.description} onChange={(e) => handleUpdateSalaryStream(stream.id, { description: e.target.value })} className="font-semibold text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-56" />
                        <div className="flex items-center space-x-2">
                          <select value={stream.inputType} onChange={(e) => handleUpdateSalaryStream(stream.id, { inputType: e.target.value })} className="text-xs border rounded px-2 py-1 bg-white">
                            <option value="brutto">Brutto-Eingabe</option>
                            <option value="netto">Netto-Eingabe</option>
                          </select>
                          <button onClick={() => handleDeleteSalaryStream(stream.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                        </div>
                      </div>

                      <div className="px-4 py-3 space-y-1 text-sm">
                        {/* Monatslohn row */}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 text-xs w-40">Monatslohn (Brutto)</span>
                          <input type="number" value={stream.amount} onChange={(e) => handleUpdateSalaryStream(stream.id, { amount: Number(e.target.value) })} className="w-28 border rounded px-2 py-0.5 text-xs text-right focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        {/* Bruttolohn total */}
                        <div className="flex justify-between items-center py-1.5 border-t border-b border-gray-300 font-bold">
                          <span>5000 Bruttolohn</span>
                          <span className="text-right w-28 pr-2">{stream.amount.toLocaleString('de-CH', {minimumFractionDigits:2})} CHF</span>
                        </div>

                        {/* Deductions — only for brutto */}
                        {stream.inputType === 'brutto' && (
                          <div className="space-y-1 pt-1">
                            {/* header row */}
                            <div className="grid grid-cols-[1fr_6rem_4rem_6rem] gap-2 text-[10px] text-gray-400 uppercase pb-0.5">
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
                                <div key={row.key} className="grid grid-cols-[1fr_6rem_4rem_6rem] gap-2 items-center text-xs py-0.5">
                                  <span className="text-gray-600">{row.label}</span>
                                  <input
                                    type="number"
                                    value={basis}
                                    onChange={(e) => handleUpdateSalaryStream(stream.id, { deductions: { ...d, [row.basisKey]: Number(e.target.value) }})}
                                    className="w-full border rounded px-1 py-0.5 text-xs text-right bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <div className="flex items-center">
                                    <input type="number" step="0.01" value={pct} onChange={(e) => handleUpdateSalaryStream(stream.id, { deductions: { ...d, [row.key]: Number(e.target.value) }})} className="w-full border rounded px-1 py-0.5 text-xs text-right" />
                                    <span className="ml-0.5 text-gray-400">%</span>
                                  </div>
                                  <span className={`text-right font-medium ${amt < 0 ? 'text-green-600' : 'text-red-600'}`}>{amt === 0 ? '—' : `${amt < 0 ? '+' : '-'}${Math.abs(amt).toLocaleString('de-CH',{minimumFractionDigits:2})}`}</span>
                                </div>
                              );
                            })}
                            {/* Total deductions - sum per-basis */}
                            <div className="flex justify-between items-center pt-1 border-t text-xs font-semibold text-red-600">
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
                        <div className="flex justify-between items-center py-1.5 border-t border-b border-gray-300 font-bold">
                          <span>8000 Nettolohn</span>
                          <span className="text-green-700">{net.toLocaleString('de-CH',{minimumFractionDigits:2})} CHF</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-xs text-gray-500">
                          <span>9000 Ausbezahlter Lohn (monatlich)</span>
                          <span className="font-semibold text-gray-800">{ausbezahlt.toLocaleString('de-CH',{minimumFractionDigits:2})} CHF</span>
                        </div>

                        {/* Period */}
                        <div className="flex space-x-4 pt-2 border-t mt-1">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400 block mb-0.5">Von</span>
                            <div className="flex space-x-1">
                              <input type="number" value={stream.startYear} onChange={(e) => handleUpdateSalaryStream(stream.id, { startYear: Number(e.target.value) })} className="w-16 border rounded px-1 py-0.5 text-xs" />
                              <MonthSelect value={stream.startMonth} onChange={(val) => handleUpdateSalaryStream(stream.id, { startMonth: val })} className="flex-1 border rounded px-1 py-0.5 text-xs bg-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400 block mb-0.5">Bis</span>
                            <div className="flex space-x-1">
                              <input type="number" value={stream.endYear} onChange={(e) => handleUpdateSalaryStream(stream.id, { endYear: Number(e.target.value) })} className="w-16 border rounded px-1 py-0.5 text-xs" />
                              <MonthSelect value={stream.endMonth} onChange={(val) => handleUpdateSalaryStream(stream.id, { endMonth: val })} className="flex-1 border rounded px-1 py-0.5 text-xs bg-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                  {(!state.salaryStreams || state.salaryStreams.length === 0) && (
                    <p className="text-gray-500 text-sm text-center py-4">Keine Lohnströme erfasst.</p>
                  )}
                </div>
              </div>
              )}

              {/* Sonstige Panel */}
              {incomeTab === 'sonstige' && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h4 className="text-md font-bold text-gray-800">Sonstige Einkünfte</h4>
                  <button onClick={handleAddOtherIncome} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    + Einkommen
                  </button>
                </div>
                <div className="space-y-4">
                  {(state.otherIncomeEvents || []).map(event => (
                    <div key={event.id} className="flex flex-col space-y-3 bg-white p-3 border rounded shadow-sm">
                      <div className="flex space-x-4 items-center">
                        <div className="flex-grow">
                          <span className="text-xs text-gray-500 block mb-1">Beschreibung</span>
                          <input type="text" value={event.description} onChange={(e) => handleUpdateOtherIncome(event.id, { description: e.target.value })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="w-32">
                          <span className="text-xs text-gray-500 block mb-1">Betrag/Monat</span>
                          <input type="number" value={event.monthlyAmount} onChange={(e) => handleUpdateOtherIncome(event.id, { monthlyAmount: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="pt-5">
                          <button onClick={() => handleDeleteOtherIncome(event.id)} className="text-red-500 hover:text-red-700 px-2 py-2" title="Löschen">✕</button>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Start (J/M)</span>
                          <div className="flex space-x-2">
                            <input type="number" value={event.startYear} onChange={(e) => handleUpdateOtherIncome(event.id, { startYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                            <MonthSelect value={event.startMonth} onChange={(val) => handleUpdateOtherIncome(event.id, { startMonth: val })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Ende (J/M)</span>
                          <div className="flex space-x-2">
                            <input type="number" value={event.endYear} onChange={(e) => handleUpdateOtherIncome(event.id, { endYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                            <MonthSelect value={event.endMonth} onChange={(val) => handleUpdateOtherIncome(event.id, { endMonth: val })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!state.otherIncomeEvents || state.otherIncomeEvents.length === 0) && (
                    <p className="text-gray-500 text-sm text-center py-4">Keine sonstigen Einkünfte erfasst.</p>
                  )}
                </div>
              </div>
              )}
            </section>
          )}

          {/* SECTION 2: Ausgaben & Hypotheken */}
          {(activeModalTab === 'all' || activeModalTab === 2) && (
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">2. Ausgaben & Hypotheken</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Other Expenses */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Weitere Fixkosten</h4>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Krankenkasse Base (CHF)</span>
                    <input type="number" value={state.fixeKosten.krankenkasse.base} onChange={(e) => updateState('fixeKosten', { krankenkasse: { ...state.fixeKosten.krankenkasse, base: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Mobilität (CHF)</span>
                      <input type="number" value={state.fixeKosten.mobilitaet} onChange={(e) => updateState('fixeKosten', { mobilitaet: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Variable Kosten (CHF)</span>
                      <input type="number" value={state.variableKosten} onChange={(e) => updateState('variableKosten', Number(e.target.value))} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: Vermögen & Rendite */}
          {(activeModalTab === 'all' || activeModalTab === 3) && (
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">3. Vermögen & Rendite</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Assets */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Startkapital & Immobilien</h4>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Startvermögen Liquide (CHF)</span>
                    <input type="number" value={state.assets.startingLiquidWealth} onChange={(e) => updateState('assets', { startingLiquidWealth: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Rendite auf Liquides (%)</span>
                    <input type="number" step="0.1" value={state.baseline.liquidYieldRate} onChange={(e) => updateState('baseline', { liquidYieldRate: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                {/* Tied Assets */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Gebundenes Kapital</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Säule 3a Saldo</span>
                      <input type="number" value={state.assets.saeule3a.balance} onChange={(e) => updateState('assets', { saeule3a: { ...state.assets.saeule3a, balance: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">3a Bezugsjahr</span>
                      <input type="text" value={state.assets.saeule3a.withdrawalYear} onChange={(e) => updateState('assets', { saeule3a: { ...state.assets.saeule3a, withdrawalYear: e.target.value }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z.B. 2028" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">FZK Saldo</span>
                      <input type="number" value={state.assets.freizuegigkeitskonto.balance} onChange={(e) => updateState('assets', { freizuegigkeitskonto: { ...state.assets.freizuegigkeitskonto, balance: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">FZK Bezugsjahr</span>
                      <input type="text" value={state.assets.freizuegigkeitskonto.withdrawalYear} onChange={(e) => updateState('assets', { freizuegigkeitskonto: { ...state.assets.freizuegigkeitskonto, withdrawalYear: e.target.value }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z.B. 2027" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: Investitionsplan (CapEx) */}
          {(activeModalTab === 'all' || activeModalTab === 4) && (
            <section>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-800">4. Investitionsplan (CapEx)</h3>
                  <button 
                    onClick={handleAddCapEx}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    + Investition
                  </button>
                </div>
                <div className="space-y-4">
                  {state.capExEvents.map(event => (
                    <div key={event.id} className="flex space-x-4 items-center bg-white p-3 border rounded shadow-sm">
                      <div className="flex-grow">
                        <span className="text-xs text-gray-500 block mb-1">Beschreibung</span>
                        <input 
                          type="text" 
                          value={event.description} 
                          onChange={(e) => handleUpdateCapEx(event.id, { description: e.target.value })} 
                          className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div className="w-32">
                        <span className="text-xs text-gray-500 block mb-1">Betrag (CHF)</span>
                        <input 
                          type="number" 
                          value={event.amount} 
                          onChange={(e) => handleUpdateCapEx(event.id, { amount: Number(e.target.value) })} 
                          className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div className="w-24">
                        <span className="text-xs text-gray-500 block mb-1">Jahr</span>
                        <select 
                          value={event.year} 
                          onChange={(e) => handleUpdateCapEx(event.id, { year: e.target.value })}
                          className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="w-24 flex items-end pb-2">
                        <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer" title="Steuerlich abziehbar?">
                          <input 
                            type="checkbox" 
                            checked={event.isTaxDeductible || false}
                            onChange={(e) => handleUpdateCapEx(event.id, { isTaxDeductible: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span>Abziehbar</span>
                        </label>
                      </div>
                      <div className="pt-5">
                        <button 
                          onClick={() => handleDeleteCapEx(event.id)}
                          className="text-red-500 hover:text-red-700 px-2 py-2"
                          title="Löschen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {state.capExEvents.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">Keine Investitionen geplant.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: Immobilien */}
          {(activeModalTab === 'all' || activeModalTab === 5) && (
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">5. Immobilien (Eigenheim)</h3>
              <div className="grid grid-cols-2 gap-6">
                
                {/* Steuerwerte */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Werte & Steuern</h4>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Steuerwert Liegenschaft (CHF)</span>
                    <input type="number" value={state.immobilie.efhTaxValue} onChange={(e) => updateState('immobilie', { efhTaxValue: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Eigenmietwert (CHF)</span>
                    <input type="number" value={state.immobilie.eigenmietwert} onChange={(e) => updateState('immobilie', { eigenmietwert: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Liegenschaftsunterhalt (als % vom Steuerwert)</span>
                    <input type="number" step="0.1" value={state.immobilie.unterhaltRate} onChange={(e) => updateState('immobilie', { unterhaltRate: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                {/* Hypotheken */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Hypotheken</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Saron Betrag</span>
                      <input type="number" value={state.immobilie.hypothek.saronAmount} onChange={(e) => updateState('immobilie', { hypothek: { ...state.immobilie.hypothek, saronAmount: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Saron Zins (%)</span>
                      <input type="number" step="0.01" value={state.immobilie.hypothek.saronRate} onChange={(e) => updateState('immobilie', { hypothek: { ...state.immobilie.hypothek, saronRate: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Fest Betrag</span>
                      <input type="number" value={state.immobilie.hypothek.festAmount} onChange={(e) => updateState('immobilie', { hypothek: { ...state.immobilie.hypothek, festAmount: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Fest Zins (%)</span>
                      <input type="number" step="0.01" value={state.immobilie.hypothek.festRate} onChange={(e) => updateState('immobilie', { hypothek: { ...state.immobilie.hypothek, festRate: Number(e.target.value) }})} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={closeSettingsModal} className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700">Schliessen</button>
        </div>
      </div>
    </div>
  );
};
