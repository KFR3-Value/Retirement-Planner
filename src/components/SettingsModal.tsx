import React from 'react';
import { usePlanning, YEARS, type YearlyDeductions } from '../context/PlanningContext';
import { useUI } from '../context/UIContext';
import { BaselineEntry } from './BaselineEntry';

export const SettingsModal: React.FC = () => {
  const { state, updateState } = usePlanning();
  const { activeModalTab, closeSettingsModal } = useUI();

  if (!activeModalTab) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/40">
          <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">
            {activeModalTab === 6 
              ? 'Steuerabzüge (Multi-Year)' 
              : activeModalTab === 7 
                ? 'Todesfall-Simulation (Ablebensszenario)' 
                : 'Baseline-Finanzdaten'}
          </h2>
          <button onClick={closeSettingsModal} className="text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 scrollbar-thin">
          {/* Tabs 1-5 or 'all' -> BaselineEntry */}
          {(activeModalTab === 'all' || [1, 2, 3, 4, 5].includes(activeModalTab as number)) && (
            <BaselineEntry />
          )}

          {/* Tab 6: Steuerabzüge */}
          {activeModalTab === 6 && (
            <section className="space-y-4">
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
                          const val = state.scenarioOverrides.taxDeductions?.[year]?.[row.field] ?? 0;
                          return (
                            <td key={year} className="py-2 px-2 text-right">
                              <input
                                type="number"
                                value={val === 0 ? '' : val}
                                onChange={(e) => {
                                  const newVal = Math.max(0, Number(e.target.value));
                                  const currentYearDeds = state.scenarioOverrides.taxDeductions[year] || {
                                    transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0
                                  };
                                  updateState('taxDeductions', {
                                    ...state.scenarioOverrides.taxDeductions,
                                    [year]: {
                                      ...currentYearDeds,
                                      [row.field]: newVal
                                    }
                                  });
                                }}
                                placeholder="0"
                                className="w-24 border border-slate-800 rounded px-2 py-1 bg-slate-950 text-slate-200 text-right focus:ring-emerald-500 focus:border-emerald-500 font-mono text-xs"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tab 7: Todesfall-Simulation */}
          {activeModalTab === 7 && (
            <section className="space-y-6">
              <p className="text-xs text-slate-400">
                Simulieren Sie das Ableben eines Ehepartners in einem bestimmten Planungsjahr. Der Rechner passt ab diesem Jahr automatisch das steuerbare Einkommen (AHV Verwitwetenrente, Pensionskassen-Hinterlassenenrente 60%), den Zivilstandsstatus (Steuertarif Alleinstehend) und die Lebenshaltungskosten an.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Verstorbene Person</label>
                    <select
                      value={state.scenarioOverrides.survivor?.deceasedPartner || 'Keiner'}
                      onChange={(e) => updateState('survivor', { deceasedPartner: e.target.value })}
                      className="w-full border border-slate-805 rounded px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono text-xs"
                    >
                      <option value="Keiner">Keiner (Normaler Verlauf)</option>
                      <option value="Markus">Markus</option>
                      <option value="Monique">Monique</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Todesjahr (Simulation ab Jahr)</label>
                    <input
                      type="number"
                      min={2026}
                      max={2060}
                      value={state.scenarioOverrides.survivor?.deathYear ?? 2035}
                      onChange={(e) => updateState('survivor', { deathYear: Number(e.target.value) })}
                      disabled={state.scenarioOverrides.survivor?.deceasedPartner === 'Keiner'}
                      className="w-full border border-slate-800 rounded px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-950 text-slate-200 font-mono text-xs disabled:opacity-50"
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400">Ausgaben-Kürzung für Hinterbliebene (%)</label>
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        {state.scenarioOverrides.survivor?.expenseReductionFactor ?? 70}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="30"
                        max="100"
                        step="5"
                        value={state.scenarioOverrides.survivor?.expenseReductionFactor ?? 70}
                        onChange={(e) => updateState('survivor', { expenseReductionFactor: Number(e.target.value) })}
                        disabled={state.scenarioOverrides.survivor?.deceasedPartner === 'Keiner'}
                        className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1">
                      Variabler Konsumbedarf (Essen, Reisen, Diverses) wird auf diesen Wert reduziert. Wohnkosten bleiben bei 100%.
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400">Witwenrente PK des Verstorbenen (%)</label>
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        {state.scenarioOverrides.survivor?.pkSurvivorRate ?? 60}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={state.scenarioOverrides.survivor?.pkSurvivorRate ?? 60}
                        onChange={(e) => updateState('survivor', { pkSurvivorRate: Number(e.target.value) })}
                        disabled={state.scenarioOverrides.survivor?.deceasedPartner === 'Keiner'}
                        className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1">
                      Witwen/Witwerrentensätze liegen in der Schweiz gesetzlich/reglementarisch meist bei 60%.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-950/60 rounded-b-lg">
          <button 
            onClick={closeSettingsModal} 
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors text-sm shadow-md"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
};
