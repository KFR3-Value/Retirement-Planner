import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations, type YearData } from '../hooks/useCalculations';
import { useUI } from '../context/UIContext';
import { formatCHF } from '../utils/format';

export const Engine = () => {
  const { state, updateState, updateOtherIncome } = usePlanning();
  const { data } = useCalculations();
  const { openSettingsModal } = useUI();

  const getCellColor = (value: number, invert: boolean = false) => {
    if (value === 0) return '';
    const isPositive = invert ? value < 0 : value > 0;
    return isPositive ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900';
  };

  const InputRow = ({
    label,
    valueFn,
    onChange,
    type = "number",
    colSpan = 6
  }: {
    label: string,
    valueFn?: (year: YearKey) => string | number,
    onChange?: (year: YearKey, value: any) => void,
    type?: string,
    colSpan?: number
  }) => {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 px-4 text-sm font-medium text-gray-700 w-1/4">{label}</td>
        {valueFn ? YEARS.map(year => (
          <td key={year} className="py-2 px-2 text-right">
            {onChange ? (
               <input
                 type={type}
                 value={valueFn(year)}
                 onChange={(e) => onChange(year, type === 'number' ? Number(e.target.value) : e.target.value)}
                 className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
               />
            ) : (
               <span className="text-sm text-gray-900">{valueFn(year)}</span>
            )}
          </td>
        )) : (
          <td colSpan={colSpan} className="py-2 px-4 text-sm text-gray-500 italic">Global Input Configured Above</td>
        )}
      </tr>
    );
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
      <tr className={`border-b border-gray-200 ${isTotal ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50'}`}>
        <td className={`py-3 px-4 text-sm text-gray-800 ${isTotal ? 'font-bold' : ''}`}>
          {onClickLabel ? (
            <button onClick={onClickLabel} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 focus:outline-none">
              <span>{label}</span> 
              <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          ) : label}
        </td>
        {YEARS.map(year => {
          const val = data[year][dataKey] as number;
          const bgClass = isTotal ? getCellColor(val, invertColor) : '';
          return (
            <td key={year} className={`py-3 px-4 text-right text-sm whitespace-nowrap ${bgClass}`}>
              {formatCHF(val)}
            </td>
          );
        })}
      </tr>
    );
  };

  const CustomRow = ({ label, valueFn, isSub = false }: { label: string, valueFn: (year: YearKey) => number, isSub?: boolean }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className={`py-2 px-4 text-sm text-gray-800 ${isSub ? 'pl-8 text-gray-500' : ''}`}>
        {label}
      </td>
      {YEARS.map(year => (
        <td key={year} className="py-2 px-4 text-right text-sm whitespace-nowrap">
          {formatCHF(valueFn(year))}
        </td>
      ))}
    </tr>
  );

  const RateRow = ({ label, valueFn }: { label: string, valueFn: (year: YearKey) => number }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50 bg-blue-50/30">
      <td className="py-2 px-4 text-xs text-gray-700 italic pl-8">
        {label}
      </td>
      {YEARS.map(year => {
        const rate = valueFn(year);
        return (
          <td key={year} className="py-2 px-4 text-right text-xs whitespace-nowrap text-gray-600">
            {rate > 0 ? (rate * 100).toFixed(1) + '%' : '-'}
          </td>
        );
      })}
    </tr>
  );

  return (
    <>

    <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-blue-900 sticky top-16 z-40">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">
              Kategorie / Parameter
            </th>
            {YEARS.map(year => (
              <th key={year} className="py-3 px-4 text-right text-xs font-medium text-white uppercase tracking-wider">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">

          {/* SECTION 1: EINKÜNFTE */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase">
              1. Einkünfte (Income)
            </td>
          </tr>

          {/* Time Series Income */}
          <DataRow label="Lohn (Netto)" dataKey="salaryIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label="AHV Rente" dataKey="ahvIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label="Pensionskassen-Rente" dataKey="pkRenteIncome" onClickLabel={() => openSettingsModal(1)} />
          <DataRow label={`Vermögensertrag (${state.baseline.liquidYieldRate}% auf Liquides)`} dataKey="wealthYieldIncome" onClickLabel={() => openSettingsModal(3)} />

          <InputRow
            label="Sonstige Einkünfte (Manuell)"
            valueFn={(y) => state.otherIncome[y]}
            onChange={updateOtherIncome}
          />

          <DataRow label="Total Ordentliche Bruttoeinkünfte" dataKey="totalGrossIncome" isTotal={true} />

          {/* Kapitalbezüge (Ausserordentlich) */}
          <tr className="bg-orange-50/50">
             <td colSpan={7} className="py-2 px-4 font-semibold text-orange-800 text-sm border-b border-orange-200 mt-4">Ausserordentliche Zuflüsse (separat besteuert)</td>
          </tr>
          <DataRow label="Kapitalbezüge (PK / Säule 3a)" dataKey="capitalWithdrawalAmount" />


          {/* SECTION 2: AUSGABEN */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase mt-8 border-t-4 border-gray-300">
              2. Ausgaben (Budget)
            </td>
          </tr>

          <DataRow label="Hypothekarzinsen" dataKey="mortgageInterest" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Liegenschaftsunterhalt (1% EFH)" dataKey="propertyMaintenance" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Krankenkasse & Versicherungen" dataKey="krankenkasse" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Mobilität" dataKey="mobilitaet" onClickLabel={() => openSettingsModal(2)} />
          <DataRow label="Variable Kosten" dataKey="variableKosten" onClickLabel={() => openSettingsModal(2)} />

          <DataRow label="CapEx (Einmalige Investitionen)" dataKey="capEx" onClickLabel={() => openSettingsModal(4)} />

          <DataRow label="Total Ausgaben (exkl. Steuern)" dataKey="totalOutflowExclTaxes" isTotal={true} />


          {/* SECTION 4: STEUERN */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase mt-8 border-t-4 border-gray-300">
              3. Steuern (Tarif B - Verheiratete)
            </td>
          </tr>
          <DataRow label="Steuerbares Einkommen (nach Abzügen)" dataKey="taxableIncome" />
          <DataRow label="Steuerbares Vermögen" dataKey="taxableWealth" />
          
          <tr className="bg-gray-50">
             <td colSpan={7} className="py-2 px-4 font-semibold text-gray-800 text-sm border-b">A. Ordentliche Steuern (Einkommen & Vermögen)</td>
          </tr>
          <CustomRow label="Kantonssteuern (111%)" valueFn={(y) => data[y].ordinaryBreakdown?.cantonal || 0} isSub={true} />
          <CustomRow label="Gemeindesteuern Bettwil (102%)" valueFn={(y) => data[y].ordinaryBreakdown?.municipal || 0} isSub={true} />
          <CustomRow label="Kirchensteuern (19%)" valueFn={(y) => data[y].ordinaryBreakdown?.church || 0} isSub={true} />
          <CustomRow label="Direkte Bundessteuer" valueFn={(y) => data[y].ordinaryBreakdown?.federal || 0} isSub={true} />
          
          <tr className="bg-orange-50/50">
             <td colSpan={7} className="py-2 px-4 font-semibold text-orange-800 text-sm border-b border-t border-orange-200">B. Sondersteuern auf Kapitalbezüge</td>
          </tr>
          <CustomRow label="Kantonssteuern (1/3 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.cantonal || 0} isSub={true} />
          <CustomRow label="Gemeindesteuern Bettwil (1/3 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.municipal || 0} isSub={true} />
          <CustomRow label="Kirchensteuern (1/3 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.church || 0} isSub={true} />
          <CustomRow label="Direkte Bundessteuer (1/5 Tarif)" valueFn={(y) => data[y].withdrawalBreakdown?.federal || 0} isSub={true} />

          <tr className="bg-gray-50">
             <td colSpan={7} className="py-2 px-4 font-semibold text-gray-700 text-sm border-b border-t mt-2">Grenzsteuersätze (Marginal Rates auf Einfache Steuer)</td>
          </tr>
          <RateRow label="Einkommenssteuer (Kantonal Einfach)" valueFn={(y) => data[y].marginalRateInfo?.simpleIncomeRate || 0} />
          <RateRow label="Direkte Bundessteuer (Einkommen)" valueFn={(y) => data[y].marginalRateInfo?.federalRate || 0} />
          <RateRow label="Effektive Gesamtsteuerbelastung (Ordentlich)" valueFn={(y) => ((data[y].incomeTax + data[y].wealthTax) / (data[y].totalGrossIncome || 1))} />

          <DataRow label="Total Steuerbelastung (A + B)" dataKey="totalTaxBurden" isTotal={true} />


          {/* SECTION 5: CASH FLOW & WEALTH */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase mt-8 border-t-4 border-gray-300">
              4. Cash Flow & Vermögensentwicklung
            </td>
          </tr>
          <DataRow label="Cash Flow (Überschuss / Defizit)" dataKey="surplusDeficit" isTotal={true} />

          <DataRow label="Freies Vermögen (Liquid Assets) Ende Jahr" dataKey="liquidWealthEnd" onClickLabel={() => setIsSettingsModalOpen(true)} />
          <DataRow label="Säule 3a Ende Jahr" dataKey="saeule3aEnd" onClickLabel={() => setIsSettingsModalOpen(true)} />
          <DataRow label="Freizügigkeitskonto Ende Jahr" dataKey="fzkEnd" onClickLabel={() => setIsSettingsModalOpen(true)} />
          <DataRow label="Total Reinvermögen (inkl. Immobilien-Equity)" dataKey="totalWealthEnd" isTotal={true} />

        </tbody>
      </table>
    </div>
    </>
  );
};
