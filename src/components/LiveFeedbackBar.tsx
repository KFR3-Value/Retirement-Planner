import React from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { YEARS } from '../context/PlanningContext';
import { formatCHF } from '../utils/format';

export const LiveFeedbackBar: React.FC = () => {
  const { data, cumulativeKPIs } = useCalculations();


  // Find if liquid wealth ever goes negative
  const depletionYear = YEARS.find(y => data[y] && data[y].liquidWealthEnd < 0);
  
  // Calculate average or minimum coverage ratio during retirement (post 2030)
  const retirementYears = YEARS.filter(y => parseInt(y) >= 2031);
  let minCoverage = 100;
  let hasRetirementData = false;

  retirementYears.forEach(y => {
    if (data[y]) {
      hasRetirementData = true;
      if (data[y].coverageRatio < minCoverage) {
        minCoverage = data[y].coverageRatio;
      }
    }
  });

  // Check stress test compliance (affordability ratio <= 33% across all years)
  let maxAffordability = 0;
  YEARS.forEach(y => {
    if (data[y] && data[y].affordabilityRatio > maxAffordability) {
      maxAffordability = data[y].affordabilityRatio;
    }
  });
  
  const isStressTestCompliant = maxAffordability <= 33.0;

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8 sticky top-16 z-40 backdrop-blur-md bg-slate-900/90 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        
        {/* Left: Wealth Summary */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">Endvermögen (2060):</span>
            <span className={`font-mono font-bold ${cumulativeKPIs.netWealth2060 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCHF(cumulativeKPIs.netWealth2060)}
            </span>
            <span className="text-slate-500 font-sans text-[10px]">(Liquid: {formatCHF(cumulativeKPIs.liquidWealth2060)})</span>
          </div>

          {depletionYear ? (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-400 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold text-[10px] uppercase font-mono">Liquidität erschöpft in {depletionYear}!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-[10px] uppercase font-mono font-semibold">
              ✓ Liquidität gesichert
            </div>
          )}
        </div>

        {/* Right: Coverage and Tragbarkeit */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
          {/* Coverage ratio */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">Min. Deckungsquote (Rente):</span>
            <span className={`font-mono font-bold ${minCoverage >= 100 ? 'text-emerald-400' : minCoverage >= 80 ? 'text-amber-450' : 'text-rose-455'}`}>
              {hasRetirementData ? `${minCoverage.toFixed(0)}%` : 'N/A'}
            </span>
          </div>

          {/* Stress test */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">Tragbarkeit (Stress-Zins):</span>
            <span className={`font-mono font-bold ${isStressTestCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              Max {maxAffordability.toFixed(1)}%
            </span>
            {isStressTestCompliant ? (
              <span className="px-1.5 py-0.2 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-[9px] uppercase font-mono font-bold rounded">
                Konform
              </span>
            ) : (
              <span className="px-1.5 py-0.2 bg-rose-950/40 border border-rose-800/60 text-rose-400 text-[9px] uppercase font-mono font-bold rounded">
                Kritisch
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
