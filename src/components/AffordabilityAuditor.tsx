import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations } from '../hooks/useCalculations';
import { formatCHF } from '../utils/format';

export const AffordabilityAuditor = () => {
  const [selectedYear, setSelectedYear] = useState<YearKey>('2026');
  const { data } = useCalculations();
  const { state } = usePlanning();

  const [expandedIncome, setExpandedIncome] = useState(true);
  const [expandedCosts, setExpandedCosts] = useState(true);
  const [expandedRatio, setExpandedRatio] = useState(true);

  const activeData = data[selectedYear];

  const bankLendingValue = state.clientBaseline.housing.bankLendingValue || 1000000;
  
  // Imputed stress costs for active year (for detail panel)
  const activeMortgageDebt = activeData.mortgageDebt;
  const activeImputedInterest = activeMortgageDebt * 0.05;
  const activeImputedMaintenance = bankLendingValue * 0.01;
  const activeAmortisation = activeData.amortisation;
  const activeTotalImputedCosts = activeImputedInterest + activeImputedMaintenance + activeAmortisation;

  // Deemed yield for active year (Stress test income adjustments)
  const activeTotalStressIncome = activeData.stressGrossIncome;

  const statusColor = activeData.affordabilityRatio <= 33 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20' : 'text-rose-400 border-rose-500/20 bg-rose-950/20';
  const statusLabel = activeData.affordabilityRatio <= 33 ? 'Tragbar (Konform)' : 'Kritisch (Nicht konform)';

  const ExpandableHeaderRow = ({ 
    label, 
    valueFn, 
    expanded, 
    setExpanded, 
    className = "bg-slate-900/60 hover:bg-slate-800/40" 
  }: { 
    label: string, 
    valueFn?: (year: YearKey) => number, 
    expanded: boolean, 
    setExpanded: (v: boolean) => void, 
    className?: string 
  }) => (
    <tr className={`border-b border-slate-800 transition-colors duration-100 ${className}`}>
      <td 
        className="py-3 px-4 text-sm text-slate-200 font-bold flex items-center select-none whitespace-nowrap cursor-pointer hover:text-emerald-400"
        onClick={() => setExpanded(!expanded)}
      >
        <svg className={`w-4 h-4 mr-2 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        {label}
      </td>
      {YEARS.map(year => {
        const val = valueFn ? valueFn(year) : 0;
        const isSelected = selectedYear === year;
        const bgClass = isSelected ? 'bg-emerald-500/5 border-x border-emerald-500/10' : '';
        return (
          <td 
            key={year} 
            onClick={() => setSelectedYear(year)}
            className={`py-3 px-4 text-right text-sm font-mono font-bold text-slate-200 whitespace-nowrap cursor-pointer ${bgClass}`}
          >
            {valueFn ? formatCHF(val) : ''}
          </td>
        );
      })}
    </tr>
  );

  const DataRow = ({
    label,
    valueFn,
    isSub = false,
    isTotal = false,
    formatFn = formatCHF,
    className = ""
  }: {
    label: string;
    valueFn: (year: YearKey) => number | string;
    isSub?: boolean;
    isTotal?: boolean;
    formatFn?: (val: any) => string;
    className?: string;
  }) => {
    return (
      <tr className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-100 ${className} ${isTotal ? 'bg-slate-950/30' : ''}`}>
        <td className={`py-2 px-4 text-sm whitespace-nowrap ${isSub ? 'pl-8 text-slate-400' : 'text-slate-200'} ${isTotal ? 'font-bold text-slate-100' : ''}`}>
          {label}
        </td>
        {YEARS.map(year => {
          const val = valueFn(year);
          const isSelected = selectedYear === year;
          const bgClass = isSelected ? 'bg-emerald-500/5 border-x border-emerald-500/10' : '';
          return (
            <td 
              key={year} 
              onClick={() => setSelectedYear(year)}
              className={`py-2 px-4 text-right text-sm font-mono cursor-pointer select-none whitespace-nowrap ${isTotal ? 'font-bold text-slate-100' : 'text-slate-350'} ${bgClass}`}
            >
              {typeof val === 'number' ? formatFn(val) : val}
            </td>
          );
        })}
      </tr>
    );
  };

  const RatioRow = () => {
    return (
      <tr className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-100 bg-slate-950/20">
        <td className="py-2.5 px-4 text-sm font-bold text-slate-100 whitespace-nowrap">
          Tragbarkeits-Ratio (%)
        </td>
        {YEARS.map(year => {
          const ratio = data[year].affordabilityRatio;
          const isSelected = selectedYear === year;
          const bgClass = isSelected ? 'bg-emerald-500/5 border-x border-emerald-500/10' : '';
          const colorClass = ratio <= 33 ? 'text-emerald-400' : 'text-rose-455';
          return (
            <td 
              key={year} 
              onClick={() => setSelectedYear(year)}
              className={`py-2.5 px-4 text-right text-sm font-mono font-bold cursor-pointer select-none whitespace-nowrap ${colorClass} ${bgClass}`}
            >
              {ratio.toFixed(2)}%
            </td>
          );
        })}
      </tr>
    );
  };

  const StatusRow = () => {
    return (
      <tr className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-100 bg-slate-950/20">
        <td className="py-2.5 px-4 text-sm font-bold text-slate-100 whitespace-nowrap">
          Status (Limit 33%)
        </td>
        {YEARS.map(year => {
          const ratio = data[year].affordabilityRatio;
          const isSelected = selectedYear === year;
          const bgClass = isSelected ? 'bg-emerald-500/5 border-x border-emerald-500/10' : '';
          const label = ratio <= 33 ? 'Konform' : 'Kritisch';
          const badgeColor = ratio <= 33 
            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20' 
            : 'text-rose-400 bg-rose-950/40 border border-rose-500/20';
          return (
            <td 
              key={year} 
              onClick={() => setSelectedYear(year)}
              className={`py-2 px-3 text-center cursor-pointer select-none whitespace-nowrap ${bgClass}`}
            >
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                {label}
              </span>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-xl">
        <div>
           <h2 className="text-lg font-bold text-slate-100 font-mono">Affordability Auditor (Tragbarkeitsrechner)</h2>
           <p className="text-sm text-slate-400">Detaillierte Schritt-für-Schritt Auditierung nach Schweizer Bankenstandard (2026 - 2060)</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded font-mono">
          Aktives Prüfjahr: <span className="text-emerald-400 font-bold">{selectedYear}</span>
        </div>
      </div>

      {/* Spreadsheet grid containing all calculations */}
      <div className="w-full overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg shadow-2xl">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950 text-slate-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-800">
                Kategorie / Parameter
              </th>
              {YEARS.map(year => {
                const isSelected = selectedYear === year;
                return (
                  <th 
                    key={year} 
                    onClick={() => setSelectedYear(year)}
                    className={`py-3 px-4 text-right text-xs font-mono font-medium uppercase tracking-wider border-b border-slate-800 cursor-pointer select-none transition-colors ${isSelected ? 'bg-emerald-500/10 text-emerald-400 font-bold border-b border-emerald-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                  >
                    {year}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-800/40">
            
            {/* SECTION 1: STRESS-EINKOMMEN */}
            <ExpandableHeaderRow 
              label="1. Stress-Einkommen (Income for Stress Test)" 
              valueFn={(y) => data[y].stressGrossIncome} 
              expanded={expandedIncome} 
              setExpanded={setExpandedIncome} 
              className="bg-emerald-950/15 hover:bg-emerald-950/25 text-emerald-455 border-b border-slate-850" 
            />

            {expandedIncome && (
              <>
                <DataRow label="Netto-Lohn" isSub={true} valueFn={(y) => data[y].salaryIncome} />
                <DataRow label="AHV Rente" isSub={true} valueFn={(y) => data[y].ahvIncome} />
                <DataRow label="Pensionskasse Rente" isSub={true} valueFn={(y) => data[y].pkRenteIncome} />
                <DataRow label="Sonstige Einkünfte" isSub={true} valueFn={(y) => data[y].otherIncome} />
                <DataRow 
                  label="Kalk. Vermögensertrag (4% Deemed Yield)*" 
                  isSub={true} 
                  valueFn={(y) => data[y].stressGrossIncome - data[y].salaryIncome - data[y].ahvIncome - data[y].pkRenteIncome - data[y].otherIncome} 
                  className="text-emerald-350/90 font-medium"
                />
              </>
            )}

            {/* SECTION 2: KALKULATORISCHE KOSTEN */}
            <ExpandableHeaderRow 
              label="2. Jährliche Kalkulatorische Kosten (Stress-Test Expenses)" 
              valueFn={(y) => (data[y].mortgageDebt * 0.05) + ((state.clientBaseline.housing.bankLendingValue || 1000000) * 0.01) + data[y].amortisation} 
              expanded={expandedCosts} 
              setExpanded={setExpandedCosts} 
              className="bg-rose-950/10 hover:bg-rose-950/20 text-rose-455 border-b border-slate-850" 
            />

            {expandedCosts && (
              <>
                <DataRow label="Belehnungswert (Bankwert)" isSub={true} valueFn={() => bankLendingValue} />
                <DataRow label="Hypothekarschuld (t)" isSub={true} valueFn={(y) => data[y].mortgageDebt} />
                <DataRow label="Kalkulatorischer Zins (5.0% stress)*" isSub={true} valueFn={(y) => data[y].mortgageDebt * 0.05} />
                <DataRow label="Kalk. Unterhaltskosten (1.0% bankwert)*" isSub={true} valueFn={() => bankLendingValue * 0.01} />
                <DataRow label="Amortisation" isSub={true} valueFn={(y) => data[y].amortisation} />
              </>
            )}

            {/* SECTION 3: TRAGBARKEITS-RATIO & STATUS */}
            <ExpandableHeaderRow 
              label="3. Tragbarkeits-Prüfung" 
              expanded={expandedRatio} 
              setExpanded={setExpandedRatio} 
              className="bg-slate-900 hover:bg-slate-800/40 text-slate-200 border-b border-slate-850" 
            />

            {expandedRatio && (
              <>
                <RatioRow />
                <StatusRow />
              </>
            )}

          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-slate-500 leading-normal bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1">
        <p><strong>* Schweizerische Standardannahmen für Tragbarkeitsprüfungen:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Zins-Stresstest:</strong> Berechnet mit 5.0% kalkulatorischem Zins auf die ausstehende Hypothekarschuld im jeweiligen Jahr.</li>
          <li><strong>Unterhaltskosten:</strong> Berechnet mit 1.0% kalkulatorischen Nebenkosten auf den bankenanerkannten Belehnungswert (Bankwert) der Liegenschaft.</li>
          <li><strong>Vermögensertrag (Deemed Yield):</strong> Theoretischer Vermögensertrag von 4.0% auf das freie liquide Vermögen zur Erhöhung des tragbaren Einkommens.</li>
        </ul>
      </div>

      {/* Visual Gap Analysis for the selected year */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
          <h3 className="text-md font-bold text-slate-100 font-mono">
            Tragbarkeitsanalyse & Lösungsansätze für {selectedYear}
          </h3>
          <span className={`px-3 py-1 rounded text-xs font-bold ${statusColor}`}>
            {statusLabel} ({activeData.affordabilityRatio.toFixed(1)}%)
          </span>
        </div>
        
        {activeData.affordabilityRatio <= 33 ? (
          <div className="text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-lg">
            Die Tragbarkeit ist mit <strong>{activeData.affordabilityRatio.toFixed(1)}%</strong> im grünen Bereich. Die Liegenschaft ist für das Jahr {selectedYear} bankenkonform finanziert.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-rose-400 bg-rose-950/20 border border-rose-500/20 p-4 rounded-lg">
              Die Tragbarkeit ist mit <strong>{activeData.affordabilityRatio.toFixed(1)}%</strong> über dem Limit von 33.0%. Die kalkulatorischen Kosten übersteigen das zulässige Tragbarkeitsbudget um <strong>{formatCHF(activeTotalImputedCosts - (activeTotalStressIncome * 0.33))}</strong> pro Jahr.
            </div>
            
            <h4 className="text-sm font-bold text-slate-200">Kalkulierte Hebel zur Erreichung der Konformität:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <p className="font-semibold text-slate-100 mb-1">Option A: Zusätzliches Einkommen</p>
                Es wird ein zusätzliches jährliches Einkommen von <strong>{formatCHF((activeTotalImputedCosts / 0.33) - activeTotalStressIncome)}</strong> benötigt, um das Limit von 33% einzuhalten.
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <p className="font-semibold text-slate-100 mb-1">Option B: Amortisation / Schuldenabbau</p>
                Der Belehnungswert (Bankwert) müsste auf ca. <strong>{formatCHF((activeTotalStressIncome * 0.33 - activeAmortisation) / 0.06)}</strong> reduziert werden (durch Rückzahlung von Hypotheken oder tiefere Schätzung), um die Belastung unter 33% zu bringen.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
