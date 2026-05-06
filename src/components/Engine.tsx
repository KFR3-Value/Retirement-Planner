import { useState } from 'react';
import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations, type YearData } from '../hooks/useCalculations';
import { formatCHF } from '../utils/format';

export const Engine = () => {
  const [isAhvModalOpen, setIsAhvModalOpen] = useState(false);
  const [isHypoModalOpen, setIsHypoModalOpen] = useState(false);
  const { state, updateState, updateCapEx, updateOtherIncome } = usePlanning();
  const { data } = useCalculations();

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

  return (
    <>
      {isAhvModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Parameter: Einkommen & Vorsorge</h2>
              <button onClick={() => setIsAhvModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AHV Start Markus (Jahr / Monat 0=Jan)</label>
                  <div className="flex space-x-2">
                    <input type="number" value={state.ahv.markusStartYear} onChange={(e) => updateState('ahv', { markusStartYear: Number(e.target.value) })} className="w-24 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="number" value={state.ahv.markusStartMonth} onChange={(e) => updateState('ahv', { markusStartMonth: Number(e.target.value) })} className="w-20 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" min={0} max={11} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AHV Start Monique (Jahr / Monat 0=Jan)</label>
                  <div className="flex space-x-2">
                    <input type="number" value={state.ahv.moniqueStartYear} onChange={(e) => updateState('ahv', { moniqueStartYear: Number(e.target.value) })} className="w-24 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="number" value={state.ahv.moniqueStartMonth} onChange={(e) => updateState('ahv', { moniqueStartMonth: Number(e.target.value) })} className="w-20 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" min={0} max={11} />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Pensionskasse</label>
                  
                  <div className="mb-4">
                    <span className="text-xs text-gray-500 block mb-1">Start (Jahr / Monat 0=Jan)</span>
                    <div className="flex space-x-2">
                      <input type="number" value={state.pensionskasse.startYear} onChange={(e) => updateState('pensionskasse', { startYear: Number(e.target.value) })} className="w-24 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                      <input type="number" value={state.pensionskasse.startMonth} onChange={(e) => updateState('pensionskasse', { startMonth: Number(e.target.value) })} className="w-20 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" min={0} max={11} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Total Kapital</span>
                      <input type="number" value={state.pensionskasse.totalCapital} onChange={(e) => updateState('pensionskasse', { totalCapital: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Rente %</span>
                      <input type="number" value={state.pensionskasse.renteSplit} onChange={(e) => updateState('pensionskasse', { renteSplit: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" min={0} max={100} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">UWS %</span>
                      <input type="number" step="0.1" value={state.pensionskasse.umwandlungssatz} onChange={(e) => updateState('pensionskasse', { umwandlungssatz: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Temporäres Erwerbseinkommen (Lohn)</label>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Bruttolohn pro Monat</span>
                      <input type="number" value={state.salary.monthlyGross} onChange={(e) => updateState('salary', { monthlyGross: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Sozialabzüge (%)</span>
                      <input type="number" value={state.salary.deductionRate} onChange={(e) => updateState('salary', { deductionRate: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" step="0.1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Start (Jahr / Monat 0=Jan)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.salary.startYear} onChange={(e) => updateState('salary', { startYear: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" value={state.salary.startMonth} onChange={(e) => updateState('salary', { startMonth: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" min={0} max={11} />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Ende (Jahr / Monat 0=Jan)</span>
                      <div className="flex space-x-2">
                        <input type="number" value={state.salary.endYear} onChange={(e) => updateState('salary', { endYear: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="number" value={state.salary.endMonth} onChange={(e) => updateState('salary', { endMonth: Number(e.target.value) })} className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" min={0} max={11} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setIsAhvModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Schliessen</button>
            </div>
          </div>
        </div>
      )}

      {isHypoModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Parameter: Hypothek</h2>
              <button onClick={() => setIsHypoModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saron Hypothek (Betrag / Zins %)</label>
                  <div className="flex space-x-2 items-center">
                    <input type="number" value={state.fixeKosten.hypothek.saronAmount} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, saronAmount: Number(e.target.value) }})} className="w-32 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="number" step="0.01" value={state.fixeKosten.hypothek.saronRate} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, saronRate: Number(e.target.value) }})} className="w-24 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Festhypothek (Betrag / Zins %)</label>
                  <div className="flex space-x-2 items-center">
                    <input type="number" value={state.fixeKosten.hypothek.festAmount} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, festAmount: Number(e.target.value) }})} className="w-32 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="number" step="0.01" value={state.fixeKosten.hypothek.festRate} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, festRate: Number(e.target.value) }})} className="w-24 border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setIsHypoModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Schliessen</button>
            </div>
          </div>
        </div>
      )}

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
          <DataRow label="Lohn (Netto)" dataKey="salaryIncome" onClickLabel={() => setIsAhvModalOpen(true)} />
          <DataRow label="AHV Rente" dataKey="ahvIncome" onClickLabel={() => setIsAhvModalOpen(true)} />
          <DataRow label="Pensionskassen-Rente" dataKey="pkRenteIncome" onClickLabel={() => setIsAhvModalOpen(true)} />
          <DataRow label="Vermögensertrag (2% auf Liquides)" dataKey="wealthYieldIncome" />

          <InputRow
            label="Sonstige Einkünfte (Manuell)"
            valueFn={(y) => state.otherIncome[y]}
            onChange={updateOtherIncome}
          />

          <DataRow label="Total Bruttoeinkünfte" dataKey="totalGrossIncome" isTotal={true} />


          {/* SECTION 2: AUSGABEN */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase mt-8 border-t-4 border-gray-300">
              2. Ausgaben (Budget)
            </td>
          </tr>

          <DataRow label="Hypothekarzinsen" dataKey="mortgageInterest" onClickLabel={() => setIsHypoModalOpen(true)} />
          <DataRow label="Liegenschaftsunterhalt (1% EFH)" dataKey="propertyMaintenance" />
          <DataRow label="Krankenkasse & Versicherungen" dataKey="krankenkasse" />
          <DataRow label="Mobilität" dataKey="mobilitaet" />
          <DataRow label="Variable Kosten" dataKey="variableKosten" />

          <InputRow
            label="CapEx (Einmalige Investitionen)"
            valueFn={(y) => state.capEx[y]}
            onChange={updateCapEx}
          />

          <DataRow label="Total Ausgaben (exkl. Steuern)" dataKey="totalOutflowExclTaxes" isTotal={true} />


          {/* SECTION 4: STEUERN */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase mt-8 border-t-4 border-gray-300">
              3. Steuern (Aargau - Approximativ)
            </td>
          </tr>
          <DataRow label="Steuerbares Einkommen (nach Abzügen)" dataKey="taxableIncome" />
          <DataRow label="Einkommenssteuer" dataKey="incomeTax" />
          <DataRow label="Steuerbares Vermögen" dataKey="taxableWealth" />
          <DataRow label="Vermögenssteuer" dataKey="wealthTax" />
          <DataRow label="Kapitalbezugssteuer (PK/3a)" dataKey="capitalWithdrawalTax" />

          <DataRow label="Total Steuerbelastung" dataKey="totalTaxBurden" isTotal={true} />


          {/* SECTION 5: CASH FLOW & WEALTH */}
          <tr>
            <td colSpan={7} className="py-4 px-4 bg-gray-100 font-bold text-gray-900 text-lg uppercase mt-8 border-t-4 border-gray-300">
              4. Cash Flow & Vermögensentwicklung
            </td>
          </tr>
          <DataRow label="Cash Flow (Überschuss / Defizit)" dataKey="surplusDeficit" isTotal={true} />

          <DataRow label="Freies Vermögen (Liquid Assets) Ende Jahr" dataKey="liquidWealthEnd" />
          <DataRow label="Säule 3a Ende Jahr" dataKey="saeule3aEnd" />
          <DataRow label="Total Reinvermögen (inkl. Immobilien-Equity)" dataKey="totalWealthEnd" isTotal={true} />

        </tbody>
      </table>
    </div>
    </>
  );
};
