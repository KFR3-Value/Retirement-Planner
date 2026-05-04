import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CalculatedOutputs } from '../types';
import { formatCHF } from '../utils/format';

interface Props {
  outputs: CalculatedOutputs;
}

export const WaterfallChart: React.FC<Props> = ({ outputs }) => {
  // Simple representation as a side-by-side comparison or cascade
  const data = [
    { name: 'Garant. Einkommen', value: outputs.totalGuaranteedIncome, fill: '#10b981' }, // Green
    { name: 'Erwarteter Ertrag', value: outputs.expectedAnnualYield, fill: '#3b82f6' }, // Blue
    { name: 'Steuern (Fix)', value: -outputs.totalEstimatedTaxes, fill: '#f59e0b' }, // Orange
    { name: 'Fixkosten (Wohnen/KK)', value: -(outputs.totalFixedCosts - outputs.totalEstimatedTaxes), fill: '#ef4444' }, // Red
    { name: 'Variable Kosten', value: -outputs.totalVariableCosts, fill: '#f43f5e' }, // Rose/Red
    { 
      name: outputs.annualShortfall >= 0 ? 'Überschuss' : 'Fehlbetrag', 
      value: outputs.annualShortfall, 
      fill: outputs.annualShortfall >= 0 ? '#10b981' : '#ef4444' 
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}><strong>{payload[0].payload.name}</strong></p>
          <p style={{ margin: 0, color: payload[0].payload.fill }}>
            {formatCHF(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h2>Cash Flow Wasserfall</h2>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        Gegenüberstellung von Einkünften und Ausgaben.
      </p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={80} />
            <YAxis tickFormatter={(val) => `${val / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
