import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations, type YearData } from '../hooks/useCalculations';
import { useUI } from '../context/UIContext';
import { formatCHF } from '../utils/format';

export const Engine = () => {
  const { state } = usePlanning();
  const { data } = useCalculations();
  const { openSettingsModal } = useUI();
  
  const [expandedIncome, setExpandedIncome] = useState(false);
  const [expandedWealth, setExpandedWealth] = useState(false);
  const [expandedOrdTax, setExpandedOrdTax] = useState(false);
  const [expandedSondTax, setExpandedSondTax] = useState(false);

  const getCellColor = (value: number, invert: boolean = false) => {
    if (value === 0) return '';
    const isPositive = invert ? value < 0 : value > 0;
    return isPositive ? 'bg-emerald-950/30 text-emerald-400 font-semibold' : 'bg-rose-950/30 text-rose-400 font-semibold';
  };

  const DataRow = ({
    label,
    dataKey,
    isTotal = false,
    invertColor = false,
    onClickLabel
  }: {
    label: string,
    dataKey: keyof YearData,
    isTotal?: boolean,
    invertColor?: boolean,
    onClickLabel?: () => void
  }) => {
    return (
      <tr className={`border-b border-slate-800/50 ${isTotal ? 'bg-slate-950/50 font-bold' : 'hover:bg-slate-800/30 transition-colors duration-100'}`}>
        <td className={`py-3 px-4 text-sm text-slate-200 whitespace-nowrap ${isTotal ? 'font-bold text-slate-100' : ''}`}>
          {onClickLabel ? (
            <button onClick={onClickLabel} className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 focus:outline-none transition-colors">
              <span>{label}</span> 
              <svg className="w-4 h-4 text-slate-500 ml-1 hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          ) : label}
        </td>
        {YEARS.map(year => {
          const val = data[year][dataKey] as number;
          const bgClass = isTotal ? getCellColor(val, invertColor) : '';
          return (
            <td key={year} className={`py-3 px-4 text-right text-sm font-mono text-slate-200 whitespace-nowrap ${bgClass}`}>
              {formatCHF(val)}
            </td>
          );
        })}
      </tr>
    );
  };

  const CustomRow = ({ label, valueFn, isSub = false, onClickLabel }: { label: string, valueFn: (year: YearKey) => number, isSub?: boolean, onClickLabel?: () => void }) => (
    <tr className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-100">
      <td className={`py-2 px-4 text-sm text-slate-300 whitespace-nowrap ${isSub ? 'pl-8 text-slate-400' : ''}`}>
        {onClickLabel ? (
          <button onClick={onClickLabel} className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 focus:outline-none transition-colors">
            <span>{label}</span> 
            <svg className="w-4 h-4 text-slate-500 ml-1 hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        ) : label}
      </td>
      {YEARS.map(year => (
        <td key={year} className="py-2 px-4 text-right text-sm font-mono text-slate-300 whitespace-nowrap">
          {formatCHF(valueFn(year))}
        </td>
      ))}
    </tr>
  );

  const ExpandableHeaderRow = ({ label, dataKey, valueFn, expanded, setExpanded, className = "bg-slate-900/60 hover:bg-slate-800/40" }: { label: string, dataKey?: keyof YearData, valueFn?: (year: YearKey) => number, expanded: boolean, setExpanded: (v: boolean) => void, className?: string }) => (
    <tr className={`border-b border-slate-800 cursor-pointer transition-colors duration-100 ${className}`} onClick={() => setExpanded(!expanded)}>
      <td className="py-3 px-4 text-sm text-slate-200 font-bold flex items-center select-none whitespace-nowrap">
        <svg className={`w-4 h-4 mr-2 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        {label}
      </td>
      {YEARS.map(year => {
        const val = valueFn ? valueFn(year) : dataKey ? (data[year][dataKey] as number) : 0;
        return (
          <td key={year} className="py-3 px-4 text-right text-sm font-mono font-bold text-slate-200 whitespace-nowrap">
            {formatCHF(val)}
          </td>
        );
      })}
    </tr>
  );

  return (
    <>

    <div className="w-full overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg shadow-2xl">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-950 text-slate-100">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-800">
              Kategorie / Parameter
            </th>
            {YEARS.map(year => (
              <th key={year} className="py-3 px-4 text-right text-xs font-mono font-medium text-slate-400 uppercase tracking-wider border-b border-slate-800">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-900 divide-y divide-slate-800/40">

          {/* SECTION 1: EINKÜNFTE */}
          <tr>
            <td colSpan={YEARS.length + 1} className="py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800">
              1. Einkünfte (Income)
            </td>
          </tr>

          {/* Time Series Income */}
          <DataRow label="Lohn (Netto)" dataKey="salaryIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label="AHV Rente" dataKey="ahvIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label="Pensionskassen-Rente" dataKey="pkRenteIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label={`Vermögensertrag (${state.baseline.liquidYieldRate}% auf Liquides)`} dataKey="wealthYieldIncome" onClickLabel={() => openSettingsModal(3)} />

          <DataRow label="Sonstige Einkünfte" dataKey="otherIncome" onClickLabel={() => openSettingsModal(1)} />
          
          <DataRow label="Total Ordentliche Bruttoeinkünfte" dataKey="totalGrossIncome" isTotal={true} />

          {/* Capital Bezug */}
          <tr className="bg-amber-950/20">
             <td colSpan={YEARS.length + 1} className="py-2 px-4 font-semibold text-amber-400 text-sm border-b border-slate-800">Ausserordentliche Zuflüsse (separat besteuert)</td>
          </tr>
          <DataRow label="Kapitalbezüge (PK / Säule 3a)" dataKey="capitalWithdrawalAmount" />


          {/* SECTION 2: AUSGABEN */}
          <tr>
            <td colSpan={YEARS.length + 1} className="py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-t-2 border-slate-800">
              2. Ausgaben (Budget)
            </td>
          </tr>

          <DataRow label="Hypothekarzinsen" dataKey="mortgageInterest" onClickLabel={() => openSettingsModal(5)} />
          <DataRow label="Liegenschaftsunterhalt (als % EFH)" dataKey="propertyMaintenance" onClickLabel={() => openSettingsModal(5)} />
          <DataRow label="Krankenkasse & Versicherungen" dataKey="krankenkasse" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Mobilität" dataKey="mobilitaet" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Variable Kosten" dataKey="variableKosten" onClickLabel={() => openSettingsModal(2)} />

          <DataRow label="CapEx (Einmalige Investitionen)" dataKey="capEx" onClickLabel={() => openSettingsModal(4)} />

          <DataRow label="Total Ausgaben (exkl. Steuern)" dataKey="totalOutflowExclTaxes" isTotal={true} />


          {/* SECTION 4: STEUERN */}
          <tr>
            <td colSpan={YEARS.length + 1} className="py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-t-2 border-slate-800">
              3. Steuern (Tarif B - Verheiratete)
            </td>
          </tr>
          <ExpandableHeaderRow label="Steuerbares Einkommen (nach Abzügen)" dataKey="taxableIncome" expanded={expandedIncome} setExpanded={setExpandedIncome} />
          {expandedIncome && (
            <>
              <CustomRow label="+ Lohn (Netto)" valueFn={(y) => data[y].salaryIncome} isSub={true} />
              <CustomRow label="+ AHV Rente" valueFn={(y) => data[y].ahvIncome} isSub={true} />
              <CustomRow label="+ Pensionskassen-Rente" valueFn={(y) => data[y].pkRenteIncome} isSub={true} />
              <CustomRow label="+ Vermögensertrag" valueFn={(y) => data[y].wealthYieldIncome} isSub={true} />
              <CustomRow label="+ Sonstige Einkünfte" valueFn={(y) => data[y].otherIncome} isSub={true} />
              <CustomRow label="+ Eigenmietwert (nur steuerlich, bis 2028)" valueFn={(y) => data[y].eigenmietwert} isSub={true} onClickLabel={() => openSettingsModal(5)} />
              <CustomRow label="- Abzug: Krankenkasse & Versicherungen" valueFn={(y) => -data[y].krankenkasse} isSub={true} onClickLabel={() => openSettingsModal(2)} />
              <CustomRow label="- Abzug: Schuldzinsen (Hypothek)" valueFn={(y) => -data[y].mortgageInterest} isSub={true} onClickLabel={() => openSettingsModal(5)} />
              <CustomRow label="- Abzug: Liegenschaftsunterhalt" valueFn={(y) => -data[y].propertyMaintenance} isSub={true} onClickLabel={() => openSettingsModal(5)} />
              <CustomRow label="- Abzug: Werterhaltende Investitionen" valueFn={(y) => -data[y].deductibleCapEx} isSub={true} />
            </>
          )}
          
          <ExpandableHeaderRow label="Steuerbares Vermögen" dataKey="taxableWealth" expanded={expandedWealth} setExpanded={setExpandedWealth} />
          {expandedWealth && (
            <>
              <CustomRow label="Liquides Vermögen" valueFn={(y) => data[y].wealthTaxableBase.liquid} isSub={true} />
              <CustomRow label="Säule 3a" valueFn={(y) => data[y].wealthTaxableBase.pillar3a} isSub={true} />
              <CustomRow label="Steuerwert Liegenschaft (AG)" valueFn={(y) => data[y].efhTaxValue} isSub={true} onClickLabel={() => openSettingsModal(5)} />
              <CustomRow label="- Hypothekarschulden" valueFn={(y) => -data[y].mortgageDebt} isSub={true} onClickLabel={() => openSettingsModal(5)} />
            </>
          )}
          
          <ExpandableHeaderRow label="A. Ordentliche Steuern (Einkommen & Vermögen)" valueFn={(y) => data[y].incomeTax + data[y].wealthTax} expanded={expandedOrdTax} setExpanded={setExpandedOrdTax} />
          {expandedOrdTax && (
            <>
              <CustomRow label="Kantonssteuern (111%)" valueFn={(y) => data[y].ordinaryBreakdown?.cantonal || 0} isSub={true} />
              <CustomRow label="Gemeindesteuern Bettwil (102%)" valueFn={(y) => data[y].ordinaryBreakdown?.municipal || 0} isSub={true} />
              <CustomRow label="Kirchensteuern (19%)" valueFn={(y) => data[y].ordinaryBreakdown?.church || 0} isSub={true} />
              <CustomRow label="Direkte Bundessteuer" valueFn={(y) => data[y].ordinaryBreakdown?.federal || 0} isSub={true} />
            </>
          )}
          
          <ExpandableHeaderRow label="B. Sondersteuern auf Kapitalbezüge" className="bg-amber-950/20 hover:bg-amber-900/30 text-amber-400 border-t border-slate-800" valueFn={(y) => data[y].capitalWithdrawalTax} expanded={expandedSondTax} setExpanded={setExpandedSondTax} />
          {expandedSondTax && (
            <>
              <DataRow label="Bemessungsgrundlage (Kapitalbezüge)" dataKey="capitalWithdrawalAmount" />
              <CustomRow label="Kantonssteuern (1/3 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.cantonal || 0} isSub={true} />
              <CustomRow label="Gemeindesteuern Bettwil (1/3 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.municipal || 0} isSub={true} />
              <CustomRow label="Kirchensteuern (1/3 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.church || 0} isSub={true} />
              <CustomRow label="Direkte Bundessteuer (1/5 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.federal || 0} isSub={true} />
            </>
          )}

          <DataRow label="Total Steuerbelastung (A + B)" dataKey="totalTaxBurden" isTotal={true} />


          {/* SECTION 5: CASH FLOW & WEALTH */}
          <tr>
            <td colSpan={YEARS.length + 1} className="py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-t-2 border-slate-800">
              4. Cash Flow & Vermögensentwicklung
            </td>
          </tr>
          <DataRow label="Cash Flow (Überschuss / Defizit)" dataKey="surplusDeficit" isTotal={true} />

          <DataRow label="Freies Vermögen (Liquid Assets) Ende Jahr" dataKey="liquidWealthEnd" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Säule 3a Ende Jahr" dataKey="saeule3aEnd" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Freizügigkeitskonto Ende Jahr" dataKey="fzkEnd" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Total Reinvermögen (inkl. Immobilien-Equity)" dataKey="totalWealthEnd" isTotal={true} />

        </tbody>
      </table>
    </div>
    </>
  );
};
