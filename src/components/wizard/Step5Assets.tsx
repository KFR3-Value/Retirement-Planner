import React from 'react';
import type { PlanningState } from '../../context/PlanningContext';

interface StepProps {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState> | ((prev: PlanningState) => PlanningState)) => void;
}

export const Step5Assets: React.FC<StepProps> = ({ state, updateState }) => {
  const handleAssetChange = (field: keyof typeof state.clientBaseline.assets, value: any) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        assets: {
          ...prev.clientBaseline.assets,
          [field]: value
        }
      }
    }));
  };

  const handleSaeule3aChange = (field: 'balance' | 'withdrawalYear', value: any) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        assets: {
          ...prev.clientBaseline.assets,
          saeule3a: {
            ...prev.clientBaseline.assets.saeule3a,
            [field]: value
          }
        }
      }
    }));
  };

  const handleFreizuegigkeitChange = (field: 'balance' | 'withdrawalYear', value: any) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        assets: {
          ...prev.clientBaseline.assets,
          freizuegigkeitskonto: {
            ...prev.clientBaseline.assets.freizuegigkeitskonto,
            [field]: value
          }
        }
      }
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Aktuelles Vermögen</h3>
        <p className="text-slate-400 mt-2">
          Erfassen Sie Ihre flüssigen Mittel und gebundenen Vorsorgegelder.
        </p>
      </div>

      <div className="space-y-6">
        {/* Liquid Wealth */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Flüssiges Vermögen</h4>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Startguthaben flüssige Mittel (CHF)</label>
            <input
              type="number"
              value={state.clientBaseline.assets.startingLiquidWealth}
              onChange={e => handleAssetChange('startingLiquidWealth', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Bargeld, Sparkonten und freie Wertschriftenportfolios (ohne Vorsorgegelder).</p>
          </div>
        </div>

        {/* Pillar 3a */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Säule 3a</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Aktueller Kontostand (CHF)</label>
              <input
                type="number"
                value={state.clientBaseline.assets.saeule3a.balance}
                onChange={e => handleSaeule3aChange('balance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Erwartetes Auszahlungsjahr</label>
              <input
                type="number"
                value={state.clientBaseline.assets.saeule3a.withdrawalYear}
                onChange={e => handleSaeule3aChange('withdrawalYear', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Freizügigkeitskonto */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Freizügigkeitskonto</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Aktueller Kontostand (CHF)</label>
              <input
                type="number"
                value={state.clientBaseline.assets.freizuegigkeitskonto.balance}
                onChange={e => handleFreizuegigkeitChange('balance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Erwartetes Auszahlungsjahr</label>
              <input
                type="number"
                value={state.clientBaseline.assets.freizuegigkeitskonto.withdrawalYear}
                onChange={e => handleFreizuegigkeitChange('withdrawalYear', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
