import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { RetirementState } from '../types';

interface Props {
  state: RetirementState;
  updateState: (key: keyof RetirementState, value: number) => void;
}

export const InputsCard: React.FC<Props> = ({ state, updateState }) => {
  return (
    <div className="card">
      <h2>Die Hauptentscheidung</h2>

      <div className="input-group" style={{ marginTop: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div className="input-label" style={{ marginBottom: '1.5rem' }}>
          <span className="input-label-text" style={{ fontSize: '1rem' }}>
            Kapital vs. Rente (Pensionskasse)
            <span className="tooltip-icon" title="Wie viel % des Pensionskassen-Kapitals wollen Sie als Einmalzahlung (Lump Sum) beziehen? Der Rest wird als lebenslange Rente ausbezahlt.">
              <HelpCircle size={16} />
            </span>
          </span>
          <span className="input-value" style={{ fontSize: '1.2rem' }}>{state.lumpSumPercentage}% Kapital</span>
        </div>
        
        <input 
          type="range" 
          min="0" max="100" step="10" 
          value={state.lumpSumPercentage}
          onChange={(e) => updateState('lumpSumPercentage', parseFloat(e.target.value))}
          style={{ height: '8px' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>
          <span>100% Rente</span>
          <span>100% Kapital</span>
        </div>
      </div>
      
      <p className="text-muted" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
        Passen Sie diesen Regler an, um direkt zu sehen, wie sich Ihre Entscheidung auf die Fixkosten-Deckung und den Cash Flow Wasserfall auswirkt.
      </p>
    </div>
  );
};
