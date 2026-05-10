import { usePlanning, YEARS } from '../context/PlanningContext';
import { useUI } from '../context/UIContext';

export const SettingsModal = () => {
  const { state, updateState } = usePlanning();
  const { activeModalTab, closeSettingsModal } = useUI();

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
              <div className="grid grid-cols-2 gap-6">
                {/* AHV */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">AHV</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Start Markus (Jahr / Monat 1=Jan)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.ahv.markusStartYear} onChange={(e) => updateState('ahv', { markusStartYear: Number(e.target.value) })} className="w-24 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" value={state.ahv.markusStartMonth} onChange={(e) => updateState('ahv', { markusStartMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Ende Markus (J/M)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.ahv.markusEndYear} onChange={(e) => updateState('ahv', { markusEndYear: Number(e.target.value) })} className="w-24 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" value={state.ahv.markusEndMonth} onChange={(e) => updateState('ahv', { markusEndMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Start Monique (Jahr / Monat 1=Jan)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.ahv.moniqueStartYear} onChange={(e) => updateState('ahv', { moniqueStartYear: Number(e.target.value) })} className="w-24 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" value={state.ahv.moniqueStartMonth} onChange={(e) => updateState('ahv', { moniqueStartMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Ende Monique (J/M)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.ahv.moniqueEndYear} onChange={(e) => updateState('ahv', { moniqueEndYear: Number(e.target.value) })} className="w-24 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" value={state.ahv.moniqueEndMonth} onChange={(e) => updateState('ahv', { moniqueEndMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PK & Lohn */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Pensionskasse</h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Start (Jahr / Monat 1=Jan)</span>
                        <div className="flex space-x-2">
                          <input type="number" value={state.pensionskasse.startYear} onChange={(e) => updateState('pensionskasse', { startYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                          <input type="number" value={state.pensionskasse.startMonth} onChange={(e) => updateState('pensionskasse', { startMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Ende (J/M)</span>
                        <div className="flex space-x-2">
                          <input type="number" value={state.pensionskasse.endYear} onChange={(e) => updateState('pensionskasse', { endYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                          <input type="number" value={state.pensionskasse.endMonth} onChange={(e) => updateState('pensionskasse', { endMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                        <span className="text-xs text-gray-500 block mb-1">Total Kapital</span>
                        <input type="number" value={state.pensionskasse.totalCapital} onChange={(e) => updateState('pensionskasse', { totalCapital: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
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

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Lohn (Temporär)</h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Bruttolohn/Monat</span>
                        <input type="number" value={state.salary.monthlyGross} onChange={(e) => updateState('salary', { monthlyGross: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Abzüge (%)</span>
                        <input type="number" value={state.salary.deductionRate} onChange={(e) => updateState('salary', { deductionRate: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" step="0.1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Start (J/M 1=Jan)</span>
                        <div className="flex space-x-2">
                          <input type="number" value={state.salary.startYear} onChange={(e) => updateState('salary', { startYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                          <input type="number" value={state.salary.startMonth} onChange={(e) => updateState('salary', { startMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Ende (J/M)</span>
                        <div className="flex space-x-2">
                          <input type="number" value={state.salary.endYear} onChange={(e) => updateState('salary', { endYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" />
                          <input type="number" value={state.salary.endMonth} onChange={(e) => updateState('salary', { endMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500" min={1} max={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
