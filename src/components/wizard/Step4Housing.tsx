import React from 'react';
import { type PlanningState, type AmortisationEvent, YEARS } from '../../context/PlanningContext';

interface StepProps {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState> | ((prev: PlanningState) => PlanningState)) => void;
}

export const Step4Housing: React.FC<StepProps> = ({ state, updateState }) => {
  const [newEventDesc, setNewEventDesc] = React.useState('');
  const [newEventAmount, setNewEventAmount] = React.useState('');
  const [newEventYear, setNewEventYear] = React.useState(YEARS[0] || '2026');
  const [newEventTarget, setNewEventTarget] = React.useState<'saron' | 'fest'>('saron');

  const handleHousingChange = (field: keyof typeof state.clientBaseline.housing, value: any) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        housing: {
          ...prev.clientBaseline.housing,
          [field]: value
        }
      }
    }));
  };

  const addAmortisationEvent = () => {
    const amt = parseFloat(newEventAmount);
    if (!newEventDesc || isNaN(amt) || amt <= 0) return;

    const newEvent: AmortisationEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      description: newEventDesc,
      amount: amt,
      year: newEventYear,
      mortgageType: newEventTarget
    };

    updateState(prev => ({
      ...prev,
      scenarioOverrides: {
        ...prev.scenarioOverrides,
        amortisationEvents: [...(prev.scenarioOverrides.amortisationEvents || []), newEvent]
      }
    }));

    setNewEventDesc('');
    setNewEventAmount('');
  };

  const removeAmortisationEvent = (id: string) => {
    updateState(prev => ({
      ...prev,
      scenarioOverrides: {
        ...prev.scenarioOverrides,
        amortisationEvents: (prev.scenarioOverrides.amortisationEvents || []).filter(e => e.id !== id)
      }
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Wohnen & Hypotheken</h3>
        <p className="text-slate-400 mt-2">
          Geben Sie die Details zu Ihrer selbstbewohnten Immobilie und deren Finanzierung ein.
        </p>
      </div>

      <div className="space-y-6">
        {/* Property Values */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Immobilienwert (CHF)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Steuerwert</label>
              <input
                type="number"
                value={state.clientBaseline.housing.efhTaxValue}
                onChange={e => handleHousingChange('efhTaxValue', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Verkehrswert</label>
              <input
                type="number"
                value={state.clientBaseline.housing.bankLendingValue}
                onChange={e => handleHousingChange('bankLendingValue', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Eigenmietwert</label>
              <input
                type="number"
                value={state.clientBaseline.housing.eigenmietwert}
                onChange={e => handleHousingChange('eigenmietwert', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Mortgages */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Hypotheken & Finanzierung</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">SARON Hypothek (Betrag)</label>
                <input
                  type="number"
                  value={state.clientBaseline.housing.saronAmount}
                  onChange={e => handleHousingChange('saronAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">SARON Zinssatz (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={state.clientBaseline.housing.saronRate}
                  onChange={e => handleHousingChange('saronRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Festhypothek (Betrag)</label>
                <input
                  type="number"
                  value={state.clientBaseline.housing.festAmount}
                  onChange={e => handleHousingChange('festAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Festhypothek Zinssatz (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={state.clientBaseline.housing.festRate}
                  onChange={e => handleHousingChange('festRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Jährliche Amortisation (CHF)</label>
              <input
                type="number"
                value={state.clientBaseline.housing.amortisation || 0}
                onChange={e => handleHousingChange('amortisation', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Zielhypothek für Jährliche Amortisation</label>
              <select
                value={state.clientBaseline.housing.amortisationTarget || 'saron'}
                onChange={e => handleHousingChange('amortisationTarget', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-200"
              >
                <option value="saron">SARON Hypothek</option>
                <option value="fest">Festhypothek</option>
              </select>
            </div>
          </div>
        </div>

        {/* One-off Amortisations */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-2 font-mono tracking-wide">Einmalige Amortisationen (Sonderzahlungen)</h4>
          <p className="text-slate-400 text-sm mb-4">Erfassen Sie ausserordentliche Abzahlungen einzelner Hypothekarprodukte.</p>
          
          {/* List of events */}
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
            {(!state.scenarioOverrides.amortisationEvents || state.scenarioOverrides.amortisationEvents.length === 0) ? (
              <p className="text-slate-500 text-sm italic font-mono">Keine einmaligen Amortisationen erfasst.</p>
            ) : (
              state.scenarioOverrides.amortisationEvents.map(e => (
                <div key={e.id} className="flex justify-between items-center bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 font-mono text-sm">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-emerald-400 font-bold">{e.year}</span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="text-slate-200 font-bold">{e.amount.toLocaleString('de-CH')} CHF</span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="text-slate-300 font-bold uppercase">{e.mortgageType}</span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="text-slate-400 truncate inline-block align-middle max-w-[200px]" title={e.description}>{e.description}</span>
                  </div>
                  <button
                    onClick={() => removeAmortisationEvent(e.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/30 p-4 rounded-lg border border-slate-800/50">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Beschreibung</label>
              <input
                type="text"
                placeholder="z.B. Teilrückzahlung SARON"
                value={newEventDesc}
                onChange={e => setNewEventDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Betrag (CHF)</label>
              <input
                type="number"
                placeholder="Betrag"
                value={newEventAmount}
                onChange={e => setNewEventAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Jahr</label>
                <select
                  value={newEventYear}
                  onChange={e => setNewEventYear(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Produkt</label>
                <select
                  value={newEventTarget}
                  onChange={e => setNewEventTarget(e.target.value as 'saron' | 'fest')}
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
                >
                  <option value="saron">SARON</option>
                  <option value="fest">FEST</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2 md:col-span-4 flex justify-end mt-2">
              <button
                onClick={addAmortisationEvent}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-4 py-2 rounded font-mono text-sm font-bold shadow transition-colors"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Unterhalt & Nebenkosten</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unterhaltssatz (% des Verkehrswerts)</label>
              <input
                type="number"
                step="0.1"
                value={state.clientBaseline.housing.unterhaltRate}
                onChange={e => handleHousingChange('unterhaltRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Strom & Heizung (CHF)</label>
              <input
                type="number"
                value={state.clientBaseline.housing.stromHeizung}
                onChange={e => handleHousingChange('stromHeizung', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
