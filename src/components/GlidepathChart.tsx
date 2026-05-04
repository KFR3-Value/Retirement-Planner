import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RetirementState, CalculatedOutputs } from '../types';
import { formatCHF } from '../utils/format';

interface Props {
  state: RetirementState;
  outputs: CalculatedOutputs;
}

export const GlidepathChart: React.FC<Props> = ({ state, outputs }) => {
  const data = useMemo(() => {
    const projection = [];
    let currentWealth = outputs.withdrawnLumpSum;
    
    // We need to re-calculate shortfall dynamically because capital depletes, thus yield depletes.
    const fixedCostsWithoutTaxes = outputs.totalFixedCosts - outputs.totalEstimatedTaxes; 
    
    for (let year = 1; year <= 25; year++) {
      projection.push({
        year: `Jahr ${year}`,
        wealth: Math.max(currentWealth, 0),
      });

      if (currentWealth <= 0) break;

      // Calculate yield for the current year
      const yieldThisYear = currentWealth * (state.expectedMarketReturn / 100);
      
      // Calculate taxes (roughly based on new wealth)
      // Simplifying: just keeping taxes constant for the projection for UI performance,
      // or we could recalculate. Let's keep it simple: shortfall changes only by the delta in yield.
      const yieldDelta = yieldThisYear - outputs.expectedAnnualYield;
      const shortfallThisYear = outputs.annualShortfall + yieldDelta; 

      currentWealth = currentWealth + shortfallThisYear;
    }
    
    return projection;
  }, [state.expectedMarketReturn, outputs.withdrawnLumpSum, outputs.expectedAnnualYield, outputs.annualShortfall]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}><strong>{label}</strong></p>
          <p style={{ margin: 0, color: payload[0].color }}>
            Liquides Vermögen: {formatCHF(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h2>Vermögensverlauf (25 Jahre)</h2>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        Projektion des bezogenen Kapitals unter Berücksichtigung von Rendite und jährlichem Fehlbetrag/Überschuss.
      </p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(val) => `${Math.round(val / 1000)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="wealth" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {data.length > 0 && data[data.length - 1].wealth <= 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem' }}>
          <strong>Achtung:</strong> Das liquide Vermögen ist vor Ablauf von 25 Jahren aufgebraucht.
        </div>
      )}
    </div>
  );
};
