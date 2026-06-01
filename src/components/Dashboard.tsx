import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations } from '../hooks/useCalculations';
import { CoverageGauge } from './charts/CoverageGauge';
import { WaterfallChart } from './charts/WaterfallChart';
import { WealthTrajectoryChart } from './charts/WealthTrajectoryChart';

export const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<YearKey>('2026');
  const { data, trajectory, cumulativeKPIs } = useCalculations();
  const { state, updateState } = usePlanning();

  const activeData = data[selectedYear];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-xl">
        <div>
           <h2 className="text-lg font-bold text-slate-100 font-mono">Übersicht & Analyse</h2>
           <p className="text-sm text-slate-400">Familie Frey, Bettwil (AG)</p>
        </div>
        <div className="flex items-center space-x-4">
           <label className="text-sm font-medium text-slate-300">Analysejahr:</label>
           <select
             value={selectedYear}
             onChange={(e) => setSelectedYear(e.target.value as YearKey)}
             className="border-slate-800 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 border bg-slate-950 text-slate-100 font-mono"
           >
             {YEARS.map(y => (
               <option key={y} value={y}>{y}</option>
             ))}
           </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-red-500 p-4 rounded-lg shadow flex flex-col justify-center">
          <p className="text-sm text-slate-400 font-medium">Summe bezahlte Steuern (2026-2060)</p>
          <p className="text-xl font-bold text-slate-100 font-mono">{Math.round(cumulativeKPIs.totalTaxPaid).toLocaleString("de-CH")} CHF</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-purple-500 p-4 rounded-lg shadow flex flex-col justify-center">
          <p className="text-sm text-slate-400 font-medium">Vermögen per 2026</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-lg font-bold text-slate-100 font-mono">
              {data['2026'] ? Math.round(data['2026'].totalWealthEnd).toLocaleString("de-CH") : 0} CHF <span className="text-[10px] text-slate-500 font-sans font-normal">(Total)</span>
            </p>
            <p className="text-sm font-semibold text-slate-300 font-mono">
              {data['2026'] ? Math.round(data['2026'].liquidWealthEnd).toLocaleString("de-CH") : 0} CHF <span className="text-[10px] text-slate-500 font-sans font-normal">(Liquid)</span>
            </p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-blue-500 p-4 rounded-lg shadow flex flex-col justify-center">
          <p className="text-sm text-slate-400 font-medium">Vermögen per 2060</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-lg font-bold text-slate-100 font-mono">
              {data ? Math.round((cumulativeKPIs as any).netWealth2060).toLocaleString("de-CH") : 0} CHF <span className="text-[10px] text-slate-500 font-sans font-normal">(Total)</span>
            </p>
            <p className="text-sm font-semibold text-slate-300 font-mono">
              {data ? Math.round((cumulativeKPIs as any).liquidWealth2060).toLocaleString("de-CH") : 0} CHF <span className="text-[10px] text-slate-500 font-sans font-normal">(Liquid)</span>
            </p>
          </div>
        </div>
        <div className={`bg-slate-900 border border-slate-800 border-l-4 p-4 rounded-lg shadow flex flex-col justify-center ${cumulativeKPIs.totalSavings >= 0 ? 'border-l-emerald-500' : 'border-l-orange-500'}`}>
          <p className="text-sm text-slate-400 font-medium">Ersparnisse / Verzehr (2026-2060)</p>
          <p className={`text-xl font-bold font-mono ${cumulativeKPIs.totalSavings >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
            {cumulativeKPIs.totalSavings > 0 ? '+' : ''}{Math.round(cumulativeKPIs.totalSavings).toLocaleString("de-CH")} CHF
          </p>
        </div>
        <div className={`bg-slate-900 border border-slate-800 border-l-4 p-4 rounded-lg shadow flex flex-col justify-center ${activeData.affordabilityRatio <= 33 ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
          <p className="text-sm text-slate-400 font-medium font-sans">Tragbarkeit ({selectedYear})</p>
          <p className={`text-xl font-bold font-mono ${activeData.affordabilityRatio <= 33 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {activeData.affordabilityRatio.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coverage Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl col-span-1">
          <h3 className="text-md font-bold text-slate-100 mb-1 border-b border-slate-800 pb-2 font-mono">Garantierte Fixkostendeckung</h3>
          <p className="text-xs text-slate-400 mb-4">(AHV + PK) / Fixe Kosten</p>
          <CoverageGauge ratio={activeData.coverageRatio} />
          <div className="mt-4 text-sm text-center text-slate-300">
             AHV + PK: <span className="font-semibold text-slate-100 font-mono">{Math.round(activeData.guaranteedIncome).toLocaleString("de-CH")} CHF</span>
             <br />
             Fixkosten: <span className="font-semibold text-slate-100 font-mono">{Math.round(activeData.fixedCosts).toLocaleString("de-CH")} CHF</span>
          </div>
        </div>

        {/* Waterfall Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl col-span-2">
           <h3 className="text-md font-bold text-slate-100 mb-1 border-b border-slate-800 pb-2 font-mono">Cash Flow Breakdown ({selectedYear})</h3>
           <p className="text-xs text-slate-400 mb-4">Von den Bruttoeinkünften zum Überschuss/Defizit</p>
           <WaterfallChart data={activeData} />
        </div>
      </div>

      {/* Trajectory Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-6">
           <div>
             <h3 className="text-md font-bold text-slate-100 mb-1 font-mono">Vermögensentwicklung (2026 - 2060)</h3>
             <p className="text-xs text-slate-400">Projektion des Liquiditätsverzehrs vs. Immobilienwert</p>
           </div>
           <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="inflationToggle"
                checked={state.baseline.applyInflation}
                onChange={(e) => updateState('baseline', { applyInflation: e.target.checked })}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950 rounded"
              />
              <label htmlFor="inflationToggle" className="text-sm font-medium text-slate-300 select-none cursor-pointer">
                Inflation ab 2031 ({state.baseline.inflationRate}%) auf Ausgaben
              </label>
           </div>
        </div>
        <WealthTrajectoryChart trajectory={trajectory} />
      </div>
    </div>
  );
};
