import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CalculatedOutputs } from '../types';
import { formatCHF, formatPercent } from '../utils/format';

interface Props {
  outputs: CalculatedOutputs;
}

const COLORS = ['#10b981', '#ef4444', '#e2e8f0']; // Green for covered, Red for uncovered, Gray for empty

export const CoverageGauge: React.FC<Props> = ({ outputs }) => {
  const guaranteed = outputs.totalGuaranteedIncome;
  const fixedCosts = outputs.totalFixedCosts;
  
  const isFullyCovered = guaranteed >= fixedCosts;
  const coveredAmount = Math.min(guaranteed, fixedCosts);
  const uncoveredAmount = isFullyCovered ? 0 : fixedCosts - guaranteed;
  
  const data = [
    { name: 'Gedeckte Fixkosten', value: coveredAmount },
    ...(uncoveredAmount > 0 ? [{ name: 'Ungedeckte Fixkosten', value: uncoveredAmount }] : []),
  ];

  const percentage = (guaranteed / fixedCosts) * 100;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ alignSelf: 'flex-start' }}>Fixkosten-Deckung (The Floor)</h2>
      <p className="text-muted" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
        Anteil der fixen Kosten (Wohnen, KK, Steuern), die durch garantiertes Einkommen gedeckt sind.
      </p>
      
      <div style={{ position: 'relative', width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name.includes('Ungedeckt') ? COLORS[1] : COLORS[0]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCHF(value)} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: percentage >= 100 ? 'var(--success)' : 'var(--warning)' }}>
            {formatPercent(Math.min(percentage, 100))}
          </div>
        </div>
      </div>
      
      <div className="summary-box" style={{ width: '100%' }}>
        <div className="summary-row">
          <span>Garantiertes Einkommen:</span>
          <span className="positive">{formatCHF(guaranteed)}</span>
        </div>
        <div className="summary-row">
          <span>Totale Fixkosten:</span>
          <span>{formatCHF(fixedCosts)}</span>
        </div>
      </div>
    </div>
  );
};
