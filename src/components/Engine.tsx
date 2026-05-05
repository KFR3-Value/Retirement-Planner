import { usePlanning, YEARS, type YearKey } from '../context/PlanningContext';
import { useCalculations, type YearData } from '../hooks/useCalculations';
import { formatCHF } from '../utils/format';

export const Engine = () => {
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
    invertColor = false
  }: {
    label: string,
    dataKey: keyof YearData,
    isTotal?: boolean,
    invertColor?: boolean
  }) => {
    return (
      <tr className={`border-b border-gray-200 ${isTotal ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50'}`}>
        <td className={`py-3 px-4 text-sm text-gray-800 ${isTotal ? 'font-bold' : ''}`}>{label}</td>
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

          {/* Global Configs for Income shown as summary rows to set Context state, normally we'd have a side-panel, but we put it inline */}
          <tr className="bg-blue-50">
            <td colSpan={7} className="py-2 px-4 text-xs font-semibold text-blue-800 uppercase">Globale Parameter: AHV & Pensionskasse</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-2 px-4 text-sm text-gray-700">AHV Start Markus (Jahr / Monat 0=Jan)</td>
            <td colSpan={3} className="py-2 px-4">
               <input type="number" value={state.ahv.markusStartYear} onChange={(e) => updateState('ahv', { markusStartYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 mr-2" />
               <input type="number" value={state.ahv.markusStartMonth} onChange={(e) => updateState('ahv', { markusStartMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1" min={0} max={11} />
            </td>
            <td colSpan={3} className="py-2 px-4 text-sm text-gray-500">Volle Rente Paar: {formatCHF(state.ahv.fullPensionCouple)}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-2 px-4 text-sm text-gray-700">AHV Start Monique (Jahr / Monat 0=Jan)</td>
            <td colSpan={6} className="py-2 px-4">
               <input type="number" value={state.ahv.moniqueStartYear} onChange={(e) => updateState('ahv', { moniqueStartYear: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 mr-2" />
               <input type="number" value={state.ahv.moniqueStartMonth} onChange={(e) => updateState('ahv', { moniqueStartMonth: Number(e.target.value) })} className="w-16 border rounded px-2 py-1" min={0} max={11} />
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-2 px-4 text-sm text-gray-700">PK Kapital / Rente Split (%) / UWS (%)</td>
            <td colSpan={6} className="py-2 px-4 flex space-x-4">
               <div>Total: <input type="number" value={state.pensionskasse.totalCapital} onChange={(e) => updateState('pensionskasse', { totalCapital: Number(e.target.value) })} className="w-32 border rounded px-2 py-1" /></div>
               <div>Rente %: <input type="number" value={state.pensionskasse.renteSplit} onChange={(e) => updateState('pensionskasse', { renteSplit: Number(e.target.value) })} className="w-16 border rounded px-2 py-1" min={0} max={100} /></div>
               <div>UWS %: <input type="number" step="0.1" value={state.pensionskasse.umwandlungssatz} onChange={(e) => updateState('pensionskasse', { umwandlungssatz: Number(e.target.value) })} className="w-16 border rounded px-2 py-1" /></div>
            </td>
          </tr>

          {/* Time Series Income */}
          <DataRow label="AHV Rente" dataKey="ahvIncome" />
          <DataRow label="Pensionskassen-Rente" dataKey="pkRenteIncome" />
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
          <tr className="bg-blue-50">
            <td colSpan={7} className="py-2 px-4 text-xs font-semibold text-blue-800 uppercase">Globale Parameter: Fixkosten</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-2 px-4 text-sm text-gray-700">Saron Hypo / Zins (%)</td>
            <td colSpan={6} className="py-2 px-4">
              <input type="number" value={state.fixeKosten.hypothek.saronAmount} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, saronAmount: Number(e.target.value) }})} className="w-32 border rounded px-2 py-1 mr-2" />
              <input type="number" step="0.01" value={state.fixeKosten.hypothek.saronRate} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, saronRate: Number(e.target.value) }})} className="w-20 border rounded px-2 py-1" /> %
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-2 px-4 text-sm text-gray-700">Festhypothek / Zins (%)</td>
            <td colSpan={6} className="py-2 px-4">
              <input type="number" value={state.fixeKosten.hypothek.festAmount} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, festAmount: Number(e.target.value) }})} className="w-32 border rounded px-2 py-1 mr-2" />
              <input type="number" step="0.01" value={state.fixeKosten.hypothek.festRate} onChange={(e) => updateState('fixeKosten', { hypothek: { ...state.fixeKosten.hypothek, festRate: Number(e.target.value) }})} className="w-20 border rounded px-2 py-1" /> %
            </td>
          </tr>

          <DataRow label="Hypothekarzinsen" dataKey="mortgageInterest" />
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
  );
};
