import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations, type YearData } from '../hooks/useCalculations';
import { useUI } from '../context/UIContext';
import { formatCHF } from '../utils/format';
import { ScenarioTimeline } from './ScenarioTimeline';
import { CapitalTimeline } from './CapitalTimeline';

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
      <tr className={`border-b border-slate-800/50 group ${isTotal ? 'bg-slate-950/50 font-bold' : 'hover:bg-slate-800/30 transition-colors duration-100'}`}>
        <td className={`sticky left-0 z-10 py-3 px-4 text-sm text-slate-200 whitespace-nowrap border-r border-slate-800/60 ${isTotal ? 'font-bold text-slate-100 bg-slate-950/90' : 'bg-slate-900 group-hover:bg-slate-800/80 transition-colors duration-100'}`}>
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
    <tr className="border-b border-slate-800/40 group hover:bg-slate-800/20 transition-colors duration-100">
      <td className={`sticky left-0 z-10 py-2 px-4 text-sm text-slate-300 whitespace-nowrap border-r border-slate-800/60 bg-slate-900 group-hover:bg-slate-800 transition-colors duration-100 ${isSub ? 'pl-8 text-slate-400' : ''}`}>
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

  const ExpandableHeaderRow = ({ 
    label, 
    dataKey, 
    valueFn, 
    expanded, 
    setExpanded, 
    rowClass = "bg-slate-900 hover:bg-slate-800",
    stickyClass = "bg-slate-900 group-hover:bg-slate-800"
  }: { 
    label: string, 
    dataKey?: keyof YearData, 
    rowClass?: string,
    stickyClass?: string,
    valueFn?: (year: YearKey) => number, 
    expanded: boolean, 
    setExpanded: (v: boolean) => void 
  }) => (
    <tr className={`border-b border-slate-800 group cursor-pointer transition-colors duration-100 ${rowClass}`} onClick={() => setExpanded(!expanded)}>
      <td className={`sticky left-0 z-10 py-3 px-4 text-sm text-slate-200 font-bold flex items-center select-none whitespace-nowrap border-r border-slate-800/60 transition-colors duration-100 ${stickyClass}`}>
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
    <div className="space-y-6">
      <ScenarioTimeline />
      <CapitalTimeline />

      <div className="w-full overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg shadow-2xl">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-950 text-slate-100">
          <tr>
            <th className="sticky left-0 z-20 bg-slate-950 py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-800 border-r border-slate-800/60">
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
            <td className="sticky left-0 z-10 py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-r border-slate-800/60">
              1. Einkünfte (Income)
            </td>
            <td colSpan={YEARS.length} className="bg-slate-950 border-b border-slate-800"></td>
          </tr>

          {/* Time Series Income */}
          <DataRow label="Lohn (Netto)" dataKey="salaryIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label="AHV Rente" dataKey="ahvIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label="Pensionskassen-Rente" dataKey="pkRenteIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label={`Vermögensertrag (${state.globalAssumptions.liquidYieldRate}% auf Liquides)`} dataKey="wealthYieldIncome" onClickLabel={() => openSettingsModal(3)} />

          <DataRow label="Sonstige Einkünfte" dataKey="otherIncome" onClickLabel={() => openSettingsModal(1)} />
          
          <DataRow label="Total Ordentliche Bruttoeinkünfte" dataKey="totalGrossIncome" isTotal={true} />

          {/* Capital Bezug */}
          <tr>
             <td className="sticky left-0 z-10 py-2 px-4 font-semibold text-amber-400 text-sm border-b border-slate-800 border-r border-slate-800/60 bg-[#1c1610]">
               Ausserordentliche Zuflüsse (separat besteuert)
             </td>
             <td colSpan={YEARS.length} className="bg-[#1c1610] border-b border-slate-800"></td>
          </tr>
          <DataRow label="Kapitalbezüge (PK / Säule 3a)" dataKey="capitalWithdrawalAmount" />


          {/* SECTION 2: AUSGABEN */}
          <tr>
            <td className="sticky left-0 z-10 py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-t-2 border-slate-800 border-r border-slate-800/60">
              2. Ausgaben (Budget)
            </td>
            <td colSpan={YEARS.length} className="bg-slate-950 border-b border-slate-800 border-t-2 border-slate-800"></td>
          </tr>

          {/* Wohnen & Liegenschaft */}
          <tr>
            <td className="sticky left-0 z-10 py-2 px-4 font-semibold text-emerald-400 text-sm border-b border-slate-800 border-r border-slate-800/60 bg-[#0c1a14]">
              Wohnen & Liegenschaft
            </td>
            <td colSpan={YEARS.length} className="bg-[#0c1a14] border-b border-slate-800"></td>
          </tr>
          <DataRow label="Hypothekarzinsen" dataKey="mortgageInterest" onClickLabel={() => openSettingsModal(4)} />
          <DataRow label="Liegenschaftsunterhalt (als % EFH)" dataKey="propertyMaintenance" onClickLabel={() => openSettingsModal(4)} />
          <DataRow label="Strom & Heizung (Nebenkosten)" dataKey="stromHeizung" onClickLabel={() => openSettingsModal(4)} />
  <DataRow label="Amortisation (Regulär)" dataKey="amortisation" onClickLabel={() => openSettingsModal(4)} />
  <DataRow label="Amortisation (Einmalig)" dataKey="oneOffAmortisation" onClickLabel={() => openSettingsModal(4)} />
          <DataRow label="Liegenschafts-Investitionen (CapEx)" dataKey="housingCapEx" onClickLabel={() => openSettingsModal(4)} />
          <DataRow label="Total Wohnen & Liegenschaft" dataKey="housingTotal" isTotal={true} />

          {/* Lebenshaltung & Konsum */}
          <tr>
            <td className="sticky left-0 z-10 py-2 px-4 font-semibold text-emerald-400 text-sm border-b border-slate-800 border-r border-slate-800/60 bg-[#0c1a14]">
              Lebenshaltung & Konsum
            </td>
            <td colSpan={YEARS.length} className="bg-[#0c1a14] border-b border-slate-800"></td>
          </tr>
          <DataRow label="Haushalt & Nahrung" dataKey="haushaltEssen" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Mobilität" dataKey="mobilitaet" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Telefon, Handy & Medien" dataKey="telefonHandyMedien" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Kleider & Freizeit" dataKey="kleiderFreizeit" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Ferien & Reisen" dataKey="ferienReisen" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Versicherungen (Sonstige)" dataKey="versicherungenSonstige" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Konsum-Investitionen (CapEx)" dataKey="livingCapEx" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Total Lebenshaltung" dataKey="livingTotal" isTotal={true} />

          {/* Gesundheit & Diverses */}
          <tr>
            <td className="sticky left-0 z-10 py-2 px-4 font-semibold text-emerald-400 text-sm border-b border-slate-800 border-r border-slate-800/60 bg-[#0c1a14]">
              Gesundheit & Diverses
            </td>
            <td colSpan={YEARS.length} className="bg-[#0c1a14] border-b border-slate-800"></td>
          </tr>
          <DataRow label="Krankenkasse" dataKey="krankenkasse" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Zahnarzt & Optiker" dataKey="zahnarztOptiker" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Diverses & Reserve" dataKey="diversesReserve" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Gesundheits-Reserven (CapEx)" dataKey="healthCapEx" onClickLabel={() => openSettingsModal(3)} />
          <DataRow label="Total Gesundheit & Diverses" dataKey="healthTotal" isTotal={true} />

          {/* Total Ausgaben */}
          <tr className="border-t-2 border-slate-800">
            <td className="sticky left-0 z-10 py-1 bg-slate-950 border-r border-slate-800/60"></td>
            <td colSpan={YEARS.length} className="bg-slate-950 border-t-2 border-slate-800"></td>
          </tr>
          <DataRow label="Total Ausgaben (exkl. Steuern)" dataKey="totalOutflowExclTaxes" isTotal={true} />


          {/* SECTION 4: STEUERN */}
          <tr>
            <td className="sticky left-0 z-10 py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-t-2 border-slate-800 border-r border-slate-800/60">
              3. Steuern (Tarif B - Verheiratete)
            </td>
            <td colSpan={YEARS.length} className="bg-slate-950 border-b border-slate-800 border-t-2 border-slate-800"></td>
          </tr>
          <ExpandableHeaderRow label="Steuerbares Einkommen (nach Abzügen)" dataKey="taxableIncome" expanded={expandedIncome} setExpanded={setExpandedIncome} />
          {expandedIncome && (
            <>
              <CustomRow label="+ Lohn (Netto)" valueFn={(y) => data[y].salaryIncome} isSub={true} onClickLabel={() => openSettingsModal(1)} />
              <CustomRow label="+ AHV Rente" valueFn={(y) => data[y].ahvIncome} isSub={true} onClickLabel={() => openSettingsModal(1)} />
              <CustomRow label="+ Pensionskassen-Rente" valueFn={(y) => data[y].pkRenteIncome} isSub={true} onClickLabel={() => openSettingsModal(1)} />
              <CustomRow label="+ Vermögensertrag" valueFn={(y) => data[y].wealthYieldIncome} isSub={true} onClickLabel={() => openSettingsModal(5)} />
              <CustomRow label="+ Sonstige Einkünfte" valueFn={(y) => data[y].otherIncome} isSub={true} onClickLabel={() => openSettingsModal(1)} />
              <CustomRow label="+ Eigenmietwert (nur steuerlich, bis 2028)" valueFn={(y) => data[y].eigenmietwert} isSub={true} onClickLabel={() => openSettingsModal(4)} />
              <CustomRow label="- Abzug: Fahrkosten (Ziffer 10.1)" valueFn={(y) => -(data[y].deductionsBreakdown?.transport?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Auswärtige Verpflegung (Ziffer 10.2)" valueFn={(y) => -(data[y].deductionsBreakdown?.meal?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Übrige Berufskosten (Ziffer 10.3)" valueFn={(y) => -(data[y].deductionsBreakdown?.professional?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Schuldzinsen (Ziffer 11.0)" valueFn={(y) => -data[y].mortgageInterest} isSub={true} onClickLabel={() => openSettingsModal(4)} />
              <CustomRow label="- Abzug: Liegenschaftsunterhalt (Ziffer 11.1)" valueFn={(y) => -data[y].propertyMaintenance} isSub={true} onClickLabel={() => openSettingsModal(4)} />
              <CustomRow label="- Abzug: Krankenkassen- & Vers. Prämien (Ziffer 14.0)" valueFn={(y) => -(data[y].deductionsBreakdown?.insurance?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(3)} />
              <CustomRow label="- Abzug: Alimente (Ziffer 12.0)" valueFn={(y) => -(data[y].deductionsBreakdown?.alimony?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Kinderdrittbetreuung (Ziffer 15.0)" valueFn={(y) => -(data[y].deductionsBreakdown?.childcare?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Spenden (Ziffer 15.3)" valueFn={(y) => -(data[y].deductionsBreakdown?.donations?.canton || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Aus- und Weiterbildung (Ziffer 15.5)" valueFn={(y) => -(state.scenarioOverrides.taxDeductions?.[y]?.education || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Übrige Abzüge (Ziffer 15.6)" valueFn={(y) => -(state.scenarioOverrides.taxDeductions?.[y]?.other || 0)} isSub={true} onClickLabel={() => openSettingsModal(6)} />
              <CustomRow label="- Abzug: Zweitverdienerabzug (Ziffer 16.0)" valueFn={(y) => -(data[y].deductionsBreakdown?.dual_income?.canton || 0)} isSub={true} />
              <CustomRow label="- Abzug: Werterhaltende Investitionen (CapEx)" valueFn={(y) => -data[y].deductibleCapEx} isSub={true} onClickLabel={() => openSettingsModal(4)} />
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
          
          <ExpandableHeaderRow 
            label="B. Sondersteuern auf Kapitalbezüge" 
            rowClass="bg-[#1c1610] hover:bg-[#2c2015] text-amber-450 border-t border-slate-800" 
            stickyClass="bg-[#1c1610] group-hover:bg-[#2c2015] text-amber-450" 
            valueFn={(y) => data[y].capitalWithdrawalTax} 
            expanded={expandedSondTax} 
            setExpanded={setExpandedSondTax} 
          />
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
            <td className="sticky left-0 z-10 py-4 px-4 bg-slate-950 font-bold text-slate-200 text-md uppercase tracking-wider border-b border-slate-800 border-t-2 border-slate-800 border-r border-slate-800/60">
              4. Cash Flow & Vermögensentwicklung
            </td>
            <td colSpan={YEARS.length} className="bg-slate-950 border-b border-slate-800 border-t-2 border-slate-800"></td>
          </tr>
          <DataRow label="Cash Flow (Überschuss / Defizit)" dataKey="surplusDeficit" isTotal={true} />

          <tr className="border-b border-slate-800 group hover:bg-slate-800/20">
            <td className="sticky left-0 z-10 py-3 px-4 text-sm text-slate-200 font-semibold whitespace-nowrap border-r border-slate-800/60 bg-slate-900 group-hover:bg-slate-800 transition-colors duration-100">
              Hypothekarische Tragbarkeit (Stress Test)
            </td>
            {YEARS.map(year => {
              const val = data[year].affordabilityRatio;
              const cellColor = val <= 33 ? 'text-emerald-450 font-bold' : 'text-rose-400 font-bold';
              return (
                <td key={year} className="py-3 px-4 text-right text-sm font-mono whitespace-nowrap">
                  <span className={cellColor}>{val.toFixed(1)}%</span>
                </td>
              );
            })}
          </tr>

          <DataRow label="Freies Vermögen (Liquide) Ende Jahr" dataKey="liquidWealthEnd" onClickLabel={() => openSettingsModal(5)} />
          <DataRow label="Säule 3a Ende Jahr" dataKey="saeule3aEnd" onClickLabel={() => openSettingsModal(5)} />
          <DataRow label="Freizügigkeitskonto Ende Jahr" dataKey="fzkEnd" onClickLabel={() => openSettingsModal(5)} />
          <DataRow label="Pensionskasse Guthaben Ende Jahr" dataKey="pensionskasseCapitalEnd" onClickLabel={() => openSettingsModal(1)} />
          <CustomRow label="Immobilien Eigenkapital (Verkehrswert - Hypothek)" valueFn={(y) => data[y].bankLendingValue - data[y].mortgageDebt} onClickLabel={() => openSettingsModal(4)} />
          <DataRow label="Total Reinvermögen (inkl. PK & Immobilien)" dataKey="totalWealthEnd" isTotal={true} />

        </tbody>
      </table>
    </div>
  </div>
  );
};
