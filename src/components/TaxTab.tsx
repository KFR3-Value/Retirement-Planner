import React from 'react';
import type { RetirementState, CalculatedOutputs } from '../types';

interface Props {
  state: RetirementState;
  outputs: CalculatedOutputs;
  updateState: (key: keyof RetirementState, value: number) => void;
}

export const TaxTab: React.FC<Props> = ({ state, outputs, updateState }) => {
  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Steuerberechnung (Aargau / Bettwil)</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Verheiratetentarif, inkl. römisch-katholischer Kirchensteuer (Gemeindesteuerfuss: 102%, Kanton: 109%, Kirche: 16%).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Tax Deductions Inputs */}
        <div>
          <h3 className="budget-section-title" style={{ marginTop: 0 }}>Pauschale & Individuelle Abzüge</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Erfassen Sie hier Ihre erwarteten Abzüge vom Bruttoeinkommen. Hypothekarzinsen werden automatisch vom Wohnkosten-Tab übernommen.
          </p>
          
          <div className="input-group">
            <div className="input-label">Krankenkassenprämien (CHF)</div>
            <input 
              type="number" 
              value={state.taxDeductionHealth} 
              onChange={(e) => updateState('taxDeductionHealth', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <div className="input-label">Übrige Versicherungen (CHF)</div>
            <input 
              type="number" 
              value={state.taxDeductionInsurances} 
              onChange={(e) => updateState('taxDeductionInsurances', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <div className="input-label">Säule 3a Einzahlungen (CHF)</div>
            <input 
              type="number" 
              value={state.taxDeduction3a} 
              onChange={(e) => updateState('taxDeduction3a', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <div className="input-label">Weitere Abzüge (Spenden, etc.)</div>
            <input 
              type="number" 
              value={state.taxDeductionOther} 
              onChange={(e) => updateState('taxDeductionOther', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Calculated Taxes Summary */}
        <div>
          <h3 className="budget-section-title" style={{ marginTop: 0 }}>Simulierte Steuererklärung</h3>
          
          <div className="summary-box" style={{ marginTop: '1rem', borderLeft: '4px solid var(--accent-primary)', fontSize: '0.9rem' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Einkommenssteuer</h4>
            
            <div className="summary-row" style={{ marginBottom: '0.25rem' }}>
              <span>Brutto Einkommen (AHV + PK + Rendite)</span>
              <span>{new Intl.NumberFormat('de-CH').format(outputs.grossTaxableIncome)} CHF</span>
            </div>
            
            <div className="summary-row" style={{ color: 'var(--danger)', marginBottom: '0.25rem' }}>
              <span>- Abzüge (KK, 3a, etc.)</span>
              <span>-{new Intl.NumberFormat('de-CH').format(state.taxDeductionHealth + state.taxDeductionInsurances + state.taxDeduction3a + state.taxDeductionOther)} CHF</span>
            </div>
            <div className="summary-row" style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
              <span>- Hypothekarzinsen</span>
              <span>-{new Intl.NumberFormat('de-CH').format(outputs.annualMortgageInterest)} CHF</span>
            </div>
            
            <div className="summary-row" style={{ fontWeight: 600, borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginBottom: '1rem' }}>
              <span>Steuerbares Einkommen</span>
              <span>{new Intl.NumberFormat('de-CH').format(outputs.taxableIncome)} CHF</span>
            </div>
            
            <div className="summary-row" style={{ fontWeight: 600, color: 'var(--accent-primary)', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
              <span>Einkommenssteuer (Kantons-, Gemeinde- & Bundessteuer)</span>
              <span>{new Intl.NumberFormat('de-CH').format(outputs.estimatedIncomeTax)} CHF</span>
            </div>

            {/* Wealth Tax Section */}
            <h4 style={{ fontSize: '1.05rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Vermögenssteuer</h4>
            
            <div className="summary-row" style={{ marginBottom: '0.25rem' }}>
              <span>Brutto Vermögen (Übriges + PK + Haus)</span>
              <span>{new Intl.NumberFormat('de-CH').format(outputs.grossTaxableWealth)} CHF</span>
            </div>
            
            <div className="summary-row" style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
              <span>- Hypothekarschuld</span>
              <span>-{new Intl.NumberFormat('de-CH').format(state.mortgageAmount)} CHF</span>
            </div>

            <div className="summary-row" style={{ fontWeight: 600, borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginBottom: '1rem' }}>
              <span>Steuerbares Vermögen</span>
              <span>{new Intl.NumberFormat('de-CH').format(outputs.taxableWealth)} CHF</span>
            </div>

            <div className="summary-row" style={{ fontWeight: 600, color: 'var(--accent-primary)', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
              <span>Vermögenssteuer (Kantons- & Gemeindesteuer)</span>
              <span>{new Intl.NumberFormat('de-CH').format(outputs.estimatedWealthTax)} CHF</span>
            </div>
            
            <div style={{ borderTop: '2px solid var(--text-primary)', marginTop: '1.5rem', paddingTop: '1rem' }}>
              <div className="summary-row" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total Laufende Steuern</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('de-CH').format(outputs.totalEstimatedTaxes)} CHF
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
