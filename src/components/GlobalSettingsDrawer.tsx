import React from 'react';
import { usePlanning, defaultState } from '../context/PlanningContext';
import { useUI } from '../context/UIContext';

export const GlobalSettingsDrawer: React.FC = () => {
  const { state, updateState } = usePlanning();
  const { isDrawerOpen, closeDrawer } = useUI();

  if (!isDrawerOpen) return null;

  const assumptions = state.globalAssumptions;

  const handleUpdate = (key: keyof typeof assumptions, value: any) => {
    updateState('globalAssumptions', { [key]: value });
  };

  const handleReset = () => {
    if (window.confirm('Möchten Sie alle makroökonomischen Annahmen auf die Standardwerte zurücksetzen?')) {
      updateState('globalAssumptions', defaultState.globalAssumptions);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background backdrop blur */}
        <div 
          onClick={closeDrawer}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out" 
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          {/* Drawer Panel */}
          <div className="pointer-events-auto w-screen max-w-md transform bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl transition-all duration-300 ease-in-out flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-850 bg-slate-950/40 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-emerald-400 font-mono tracking-wide" id="slide-over-title">
                  Globale Annahmen
                </h2>
                <p className="text-xs text-slate-400 mt-1">Makroökonomische & steuerliche Parameter</p>
              </div>
              <button 
                onClick={closeDrawer}
                className="rounded-md text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
              >
                <span className="sr-only">Schliessen</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Section 1: Inflation & Yields */}
              <div className="space-y-4 bg-slate-950/30 p-4 rounded-lg border border-slate-850">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Markt & Inflation
                </h3>
                
                <div className="flex items-center justify-between py-2">
                  <label htmlFor="apply-inflation" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                    Inflation anwenden (ab 2031)
                  </label>
                  <input
                    id="apply-inflation"
                    type="checkbox"
                    checked={assumptions.applyInflation}
                    onChange={(e) => handleUpdate('applyInflation', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="inflation-rate">Inflationsrate (%)</label>
                    <span className="font-mono text-slate-200">{assumptions.inflationRate}%</span>
                  </div>
                  <input
                    id="inflation-rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={assumptions.inflationRate}
                    onChange={(e) => handleUpdate('inflationRate', parseFloat(e.target.value) || 0)}
                    disabled={!assumptions.applyInflation}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="liquid-yield-rate">Rendite liquides Vermögen (%)</label>
                    <span className="font-mono text-slate-200">{assumptions.liquidYieldRate}%</span>
                  </div>
                  <input
                    id="liquid-yield-rate"
                    type="number"
                    step="0.1"
                    min="-5"
                    max="15"
                    value={assumptions.liquidYieldRate}
                    onChange={(e) => handleUpdate('liquidYieldRate', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Angenommener jährlicher Ertrag auf dem freien Spar-/Depotvermögen.</p>
                </div>
              </div>

              {/* Section 2: Cantonal/Communal Tax Multipliers */}
              <div className="space-y-4 bg-slate-950/30 p-4 rounded-lg border border-slate-850">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Steuerfüsse (Aargau / Bettwil)
                </h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="tax-canton">Staatssteuer (Kanton AG)</label>
                    <span className="font-mono text-slate-200">{(assumptions.taxMultiplierCanton * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="tax-canton"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.5"
                    value={assumptions.taxMultiplierCanton}
                    onChange={(e) => handleUpdate('taxMultiplierCanton', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Kantonaler Steuerfuss. Standard für Kanton Aargau ist 1.11.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="tax-commune">Gemeindesteuer (Bettwil)</label>
                    <span className="font-mono text-slate-200">{(assumptions.taxMultiplierCommune * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="tax-commune"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.5"
                    value={assumptions.taxMultiplierCommune}
                    onChange={(e) => handleUpdate('taxMultiplierCommune', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Gemeindesteuerfuss Bettwil. Standard ist 1.02.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="tax-church">Kirchensteuer (Reformiert/Katholisch)</label>
                    <span className="font-mono text-slate-200">{(assumptions.taxMultiplierChurch * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="tax-church"
                    type="number"
                    step="0.01"
                    min="0"
                    max="0.5"
                    value={assumptions.taxMultiplierChurch}
                    onChange={(e) => handleUpdate('taxMultiplierChurch', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Kirchensteuerfuss Bettwil (Durchschnitt 0.19).</p>
                </div>
              </div>

              {/* Section 3: PK Conversion Rates */}
              <div className="space-y-4 bg-slate-950/30 p-4 rounded-lg border border-slate-850">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Standard PK Umwandlungssätze
                </h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="pk-markus">Basis UWS Markus (%)</label>
                    <span className="font-mono text-slate-200">{assumptions.baseUmwandlungssatzMarkus}%</span>
                  </div>
                  <input
                    id="pk-markus"
                    type="number"
                    step="0.001"
                    min="2"
                    max="10"
                    value={assumptions.baseUmwandlungssatzMarkus}
                    onChange={(e) => handleUpdate('baseUmwandlungssatzMarkus', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Standard-Umwandlungssatz für Markus (Referenz für Rente).</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <label htmlFor="pk-monique">Basis UWS Monique (%)</label>
                    <span className="font-mono text-slate-200">{assumptions.baseUmwandlungssatzMonique}%</span>
                  </div>
                  <input
                    id="pk-monique"
                    type="number"
                    step="0.001"
                    min="2"
                    max="10"
                    value={assumptions.baseUmwandlungssatzMonique}
                    onChange={(e) => handleUpdate('baseUmwandlungssatzMonique', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-800 rounded bg-slate-950 text-slate-100 px-3 py-2 font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Standard-Umwandlungssatz für Monique.</p>
                </div>
              </div>

            </div>

            {/* Footer with Reset and Close */}
            <div className="px-6 py-6 border-t border-slate-850 bg-slate-950/40 flex items-center justify-between space-x-4">
              <button 
                onClick={handleReset}
                className="px-4 py-2 border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-sm font-semibold rounded transition-colors shadow-sm"
              >
                Standardwerte laden
              </button>
              <button 
                onClick={closeDrawer}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded transition-colors shadow-md shadow-emerald-950/20"
              >
                Schliessen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
