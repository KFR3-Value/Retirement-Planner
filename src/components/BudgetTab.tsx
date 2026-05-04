import React from 'react';
import type { RetirementState } from '../types';
import { DualInputItem } from './DualInputItem';

interface Props {
  state: RetirementState;
  updateState: (key: keyof RetirementState, value: number) => void;
}

export const BudgetTab: React.FC<Props> = ({ state, updateState }) => {
  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>Budget Details anpassen</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Geben Sie die Werte entweder monatlich oder jährlich ein. Die andere Spalte wird automatisch berechnet.
      </p>

      <div className="budget-list">
        <div className="budget-row budget-header">
          <div className="budget-label">Kategorie</div>
          <div className="budget-input">Monatlich (CHF)</div>
          <div className="budget-input">Jährlich (CHF)</div>
        </div>

        <h3 className="budget-section-title">Fixe Kosten (ohne Wohnen/Steuern)</h3>
        <DualInputItem 
          label="Krankenkasse (inkl. Zusatz)" 
          valueAnnual={state.krankenkasse} 
          onChangeAnnual={(v) => updateState('krankenkasse', v)} 
        />
        <DualInputItem 
          label="Mobilität (Auto, ÖV)" 
          valueAnnual={state.mobilitaet} 
          onChangeAnnual={(v) => updateState('mobilitaet', v)} 
        />
        <DualInputItem 
          label="Weitere feste Verpflichtungen (Telefon, Hausrat, etc.)" 
          valueAnnual={state.festeVerpflichtungen} 
          onChangeAnnual={(v) => updateState('festeVerpflichtungen', v)} 
        />

        <h3 className="budget-section-title">Variable Lebenshaltungskosten</h3>
        <DualInputItem 
          label="Haushaltskosten (Nahrung, Tier, Sonstiges)" 
          valueAnnual={state.variableHaushalt} 
          onChangeAnnual={(v) => updateState('variableHaushalt', v)} 
        />
        <DualInputItem 
          label="Persönliche Auslagen (Kleider, Freizeit)" 
          valueAnnual={state.personalAuslagen} 
          onChangeAnnual={(v) => updateState('personalAuslagen', v)} 
        />
        <DualInputItem 
          label="Diverses (Gesundheit, Zahnarzt, Brille)" 
          valueAnnual={state.diverses} 
          onChangeAnnual={(v) => updateState('diverses', v)} 
        />

        <h3 className="budget-section-title">Rückstellungen & CapEx</h3>
        <DualInputItem 
          label="Rückstellungen (Ferien, Anschaffungen)" 
          valueAnnual={state.rueckstellungen} 
          onChangeAnnual={(v) => updateState('rueckstellungen', v)} 
        />
      </div>
    </div>
  );
};
