import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type YearData } from '../../hooks/useCalculations';
import { formatCHF } from '../../utils/format';

export const WaterfallChart = ({ data }: { data: YearData }) => {
  const chartData = useMemo(() => {
    // We build a step-by-step waterfall.
    let current = 0;

    // 1. Income (Positive)
    const incomeStart = current;
    const incomeEnd = current + data.totalGrossIncome;
    current = incomeEnd;

    // 2. Taxes (Negative)
    const taxStart = current;
    const taxEnd = current - data.totalTaxBurden;
    current = taxEnd;

    // 3. Fixe Kosten (Negative)
    const fixedCostsValue = data.mortgageInterest + data.amortisation + data.propertyMaintenance + data.krankenkasse + data.mobilitaet + data.versicherungenSonstige + data.stromHeizung + data.telefonHandyMedien;
    const fixedStart = current;
    const fixedEnd = current - fixedCostsValue;
    current = fixedEnd;

    // 4. Var. Kosten & CapEx (Negative)
    const varCostsValue = data.variableKosten + data.capEx;
    const varStart = current;
    const varEnd = current - varCostsValue;
    current = varEnd;

    // 5. Überschuss / Defizit (Total)
    // The final column anchors to 0 to show the net result.
    const surplusStart = 0;
    const surplusEnd = current;

    return [
      {
        name: 'Bruttoeinkommen',
        value: [incomeStart, incomeEnd],
        displayValue: data.totalGrossIncome,
        fill: '#3b82f6' // Blue
      },
      {
        name: 'Steuern',
        value: [taxStart, taxEnd],
        displayValue: -data.totalTaxBurden,
        fill: '#ef4444' // Red
      },
      {
        name: 'Fixe Kosten',
        value: [fixedStart, fixedEnd],
        displayValue: -fixedCostsValue,
        fill: '#f97316' // Orange
      },
      {
        name: 'Var. Kosten & CapEx',
        value: [varStart, varEnd],
        displayValue: -varCostsValue,
        fill: '#eab308' // Yellow
      },
      {
        name: 'Überschuss / Defizit',
        value: [surplusStart, surplusEnd],
        displayValue: surplusEnd,
        fill: surplusEnd >= 0 ? '#10b981' : '#dc2626' // Green if surplus, dark red if deficit
      }
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-2 shadow-2xl rounded text-slate-100 font-mono text-xs">
          <p className="font-semibold text-slate-200">{payload[0].payload.name}</p>
          <p className="text-emerald-400 mt-1 font-bold">{formatCHF(payload[0].payload.displayValue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
          <YAxis tickFormatter={(val) => `${val / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
