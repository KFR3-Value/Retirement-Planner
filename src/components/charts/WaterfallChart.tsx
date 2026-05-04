import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type YearData } from '../../hooks/useCalculations';
import { formatCHF } from '../../utils/format';

export const WaterfallChart = ({ data }: { data: YearData }) => {
  const chartData = useMemo(() => {
    // We build a step-by-step waterfall.
    // 1. Income (Positive)
    // 2. Taxes (Negative)
    // 3. Fixed Costs (Negative)
    // 4. Variable & CapEx (Negative)
    // 5. Surplus/Deficit (Result)

    return [
      {
        name: 'Bruttoeinkommen',
        value: data.totalGrossIncome,
        displayValue: data.totalGrossIncome,
        fill: '#3b82f6' // Blue
      },
      {
        name: 'Steuern',
        value: -data.totalTaxBurden,
        displayValue: data.totalTaxBurden,
        fill: '#ef4444' // Red
      },
      {
        name: 'Fixe Kosten',
        value: -(data.mortgageInterest + data.amortisation + data.propertyMaintenance + data.krankenkasse + data.mobilitaet),
        displayValue: (data.mortgageInterest + data.amortisation + data.propertyMaintenance + data.krankenkasse + data.mobilitaet),
        fill: '#f97316' // Orange
      },
      {
        name: 'Var. Kosten & CapEx',
        value: -(data.variableKosten + data.capEx),
        displayValue: (data.variableKosten + data.capEx),
        fill: '#eab308' // Yellow
      },
      {
        name: 'Überschuss / Defizit',
        value: data.surplusDeficit,
        displayValue: data.surplusDeficit,
        fill: data.surplusDeficit >= 0 ? '#10b981' : '#dc2626' // Green if surplus, dark red if deficit
      }
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 shadow rounded">
          <p className="text-sm font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-700">{formatCHF(payload[0].payload.displayValue)}</p>
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
