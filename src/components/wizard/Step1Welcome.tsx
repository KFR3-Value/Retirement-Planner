import React from 'react';
import type { PlanningState } from '../../context/PlanningContext';

interface StepProps {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState> | ((prev: PlanningState) => PlanningState)) => void;
}

export const Step1Welcome: React.FC<StepProps> = ({ state, updateState }) => {
  const handleChange = (field: keyof typeof state.globalAssumptions, value: any) => {
    updateState(prev => ({
      ...prev,
      globalAssumptions: {
        ...prev.globalAssumptions,
        [field]: value
      }
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Willkommen beim Budget-Assistenten</h3>
        <p className="text-slate-400 mt-2">
          Legen wir die wirtschaftlichen Grundannahmen für Ihre Finanzplanung fest.
          Diese Parameter beeinflussen Ihre langfristige Vermögensentwicklung.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Wirtschaftliche Faktoren</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Inflationsrate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={state.globalAssumptions.inflationRate}
                  onChange={e => handleChange('inflationRate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 font-mono">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Erwartete jährliche Inflation.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Rendite flüssige Mittel (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={state.globalAssumptions.liquidYieldRate}
                  onChange={e => handleChange('liquidYieldRate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 font-mono">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Rendite auf freien Ersparnissen.</p>
            </div>

            <div className="sm:col-span-2 flex items-center mt-2">
              <input
                type="checkbox"
                id="applyInflation"
                checked={state.globalAssumptions.applyInflation}
                onChange={e => handleChange('applyInflation', e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-700 bg-slate-950 rounded focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="applyInflation" className="ml-2 text-sm text-slate-300">
                Inflation im Zeitverlauf auf Ausgaben anwenden
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Steuerfüsse</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Kanton</label>
              <input
                type="number"
                step="0.01"
                value={state.globalAssumptions.taxMultiplierCanton}
                onChange={e => handleChange('taxMultiplierCanton', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Gemeinde</label>
              <input
                type="number"
                step="0.01"
                value={state.globalAssumptions.taxMultiplierCommune}
                onChange={e => handleChange('taxMultiplierCommune', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Kirche</label>
              <input
                type="number"
                step="0.01"
                value={state.globalAssumptions.taxMultiplierChurch}
                onChange={e => handleChange('taxMultiplierChurch', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
