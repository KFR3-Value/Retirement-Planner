import React from 'react';
import type { PlanningState } from '../../context/PlanningContext';
import { CheckCircle } from 'lucide-react';

interface StepProps {
  state: PlanningState;
}

export const Step6Review: React.FC<StepProps> = ({ state }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center py-10">
      <div className="w-20 h-20 bg-emerald-950/40 border border-emerald-800 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      
      <h3 className="text-3xl font-bold text-slate-100 tracking-tight text-center mb-4 font-mono">Alles bereit!</h3>
      
      <p className="text-slate-400 text-center max-w-md mb-8">
        Sie haben alle grundlegenden Annahmen für Ihre Finanzplanung erfolgreich erfasst. 
        Klicken Sie unten auf 'Fertigstellen & Speichern', um die Daten zu übernehmen und Ihre Projektionen zu aktualisieren.
      </p>

      <div className="bg-slate-900/50 w-full rounded-xl p-6 border border-slate-800 text-sm text-slate-300">
        <h4 className="font-semibold text-slate-100 mb-3 font-mono tracking-wide">Zusammenfassung der wichtigsten Eingaben:</h4>
        <ul className="space-y-2 font-mono text-xs">
          <li className="flex justify-between">
            <span className="text-slate-400">Inflationsrate:</span>
            <span className="font-medium text-slate-200">{state.globalAssumptions.inflationRate}%</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-400">Lohnströme:</span>
            <span className="font-medium text-slate-200">{state.clientBaseline.salaryStreams.length}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-400">Steuerwert Immobilie:</span>
            <span className="font-medium text-slate-200">CHF {state.clientBaseline.housing.efhTaxValue.toLocaleString('de-CH')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-400">Startguthaben flüssige Mittel:</span>
            <span className="font-medium text-slate-200">CHF {state.clientBaseline.assets.startingLiquidWealth.toLocaleString('de-CH')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
