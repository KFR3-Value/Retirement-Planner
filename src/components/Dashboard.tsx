import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations } from '../hooks/useCalculations';
import { CoverageGauge } from './charts/CoverageGauge';
import { WaterfallChart } from './charts/WaterfallChart';
import { WealthTrajectoryChart } from './charts/WealthTrajectoryChart';

export const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<YearKey>('2026');
  const { data, trajectory } = useCalculations();
  const { state, updateState } = usePlanning();

  const activeData = data[selectedYear];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div>
           <h2 className="text-lg font-bold text-gray-800">Übersicht & Analyse</h2>
           <p className="text-sm text-gray-500">Familie Frey, Bettwil (AG)</p>
        </div>
        <div className="flex items-center space-x-4">
           <label className="text-sm font-medium text-gray-700">Analysejahr:</label>
           <select
             value={selectedYear}
             onChange={(e) => setSelectedYear(e.target.value as YearKey)}
             className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border bg-white"
           >
             {YEARS.map(y => (
               <option key={y} value={y}>{y}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coverage Card */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1">
          <h3 className="text-md font-bold text-gray-800 mb-1 border-b pb-2">Garantierte Fixkostendeckung</h3>
          <p className="text-xs text-gray-500 mb-4">(AHV + PK) / Fixe Kosten</p>
          <CoverageGauge ratio={activeData.coverageRatio} />
          <div className="mt-4 text-sm text-center text-gray-600">
             AHV + PK: <span className="font-semibold text-gray-800">{Math.round(activeData.guaranteedIncome).toLocaleString("de-CH")} CHF</span>
             <br />
             Fixkosten: <span className="font-semibold text-gray-800">{Math.round(activeData.fixedCosts).toLocaleString("de-CH")} CHF</span>
          </div>
        </div>

        {/* Waterfall Card */}
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
           <h3 className="text-md font-bold text-gray-800 mb-1 border-b pb-2">Cash Flow Breakdown ({selectedYear})</h3>
           <p className="text-xs text-gray-500 mb-4">Von den Bruttoeinkünften zum Überschuss/Defizit</p>
           <WaterfallChart data={activeData} />
        </div>
      </div>

      {/* Trajectory Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center border-b pb-2 mb-6">
           <div>
             <h3 className="text-md font-bold text-gray-800 mb-1">Vermögensentwicklung (2026 - 2045)</h3>
             <p className="text-xs text-gray-500">Projektion des Liquiditätsverzehrs vs. Immobilienwert</p>
           </div>
           <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="inflationToggle"
                checked={state.baseline.applyInflation}
                onChange={(e) => updateState('baseline', { applyInflation: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="inflationToggle" className="text-sm font-medium text-gray-700">
                Inflation ab 2031 ({state.baseline.inflationRate}%) auf Ausgaben
              </label>
           </div>
        </div>
        <WealthTrajectoryChart trajectory={trajectory} />
      </div>
    </div>
  );
};
