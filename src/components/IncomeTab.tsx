import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { RetirementState, CalculatedOutputs } from '../types';
import { formatPercent } from '../utils/format';
import { DualInputItem } from './DualInputItem';

interface Props {
  state: RetirementState;
  outputs: CalculatedOutputs;
  updateState: (key: keyof RetirementState, value: number) => void;
}

export const IncomeTab: React.FC<Props> = ({ state, outputs, updateState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'income' | 'wealth'>('income');

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Einkommen & Vermögen</h2>
        
        <div className="subtabs-container" style={{ margin: 0 }}>
          <button 
            className={`subtab-button ${activeSubTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('income')}
          >
            Laufendes Einkommen
          </button>
          <button 
            className={`subtab-button ${activeSubTab === 'wealth' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('wealth')}
          >
            Vermögen & Immobilien
          </button>
        </div>
      </div>

      {activeSubTab === 'income' && (
        <div className="fade-in">
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Definieren Sie hier Ihre garantierte AHV-Rente und den Umwandlungssatz für Ihre Pensionskasse.
          </p>

          <div className="budget-list" style={{ marginBottom: '3rem' }}>
            <div className="budget-row budget-header">
              <div className="budget-label">Einkommensquelle</div>
              <div className="budget-input">Monatlich (CHF)</div>
              <div className="budget-input">Jährlich (CHF)</div>
            </div>
            
            <DualInputItem 
              label="AHV (Total)" 
              valueAnnual={state.ahvAnnual} 
              onChangeAnnual={(v) => updateState('ahvAnnual', v)} 
            />
            
            {/* Read-only representation of PK Annuity */}
            <div className="budget-row" style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div className="budget-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                PK Rente (Errechnet)
              </div>
              <div className="budget-input" style={{ fontWeight: 600, color: 'var(--accent-primary)', padding: '0.5rem 0.75rem' }}>
                {new Intl.NumberFormat('de-CH').format(Math.round(outputs.pkAnnuity / 12))} CHF
              </div>
              <div className="budget-input" style={{ fontWeight: 600, color: 'var(--accent-primary)', padding: '0.5rem 0.75rem' }}>
                {new Intl.NumberFormat('de-CH').format(Math.round(outputs.pkAnnuity))} CHF
              </div>
            </div>
            
            <div className="input-group" style={{ marginTop: '2rem', maxWidth: '400px' }}>
              <div className="input-label">
                <span className="input-label-text">Umwandlungssatz</span>
                <span className="input-value">{formatPercent(state.conversionRate)}</span>
              </div>
              <input 
                type="range" 
                min="4.0" max="7.0" step="0.1" 
                value={state.conversionRate}
                onChange={(e) => updateState('conversionRate', parseFloat(e.target.value))}
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Bestimmt die Höhe der jährlichen PK Rente basierend auf dem in der Kasse verbleibenden Kapital.</p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'wealth' && (
        <div className="fade-in">
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Treffen Sie Ihre Entscheidung zum Kapitalbezug und definieren Sie Ihr Immobilien- und sonstiges Vermögen.
          </p>

          {/* The Master Decision synced here */}
          <div className="input-group" style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="input-label" style={{ marginBottom: '1.5rem' }}>
              <span className="input-label-text" style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Die Hauptentscheidung: Kapital vs. Rente
                <span className="tooltip-icon" title="Wie viel % des Pensionskassen-Kapitals wollen Sie als Einmalzahlung beziehen?">
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

            {state.lumpSumPercentage > 0 && (
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Brutto Auszahlung</div>
                  <div style={{ fontWeight: 600 }}>{new Intl.NumberFormat('de-CH').format(outputs.withdrawnLumpSum)} CHF</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>Einmalige Steuer (Vorsorgetarif)</div>
                  <div style={{ fontWeight: 600, color: 'var(--danger)' }}>-{new Intl.NumberFormat('de-CH').format(outputs.capitalWithdrawalTax)} CHF</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Nettozufluss Vermögen</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{new Intl.NumberFormat('de-CH').format(outputs.withdrawnLumpSum - outputs.capitalWithdrawalTax)} CHF</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div>
              <h3 className="budget-section-title" style={{ marginTop: 0 }}>Flüssiges Vermögen</h3>
              <div className="input-group">
                <div className="input-label">Pensionskasse (Total Kapital, CHF)</div>
                <input 
                  type="number" 
                  value={state.pkCapital} 
                  onChange={(e) => updateState('pkCapital', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="input-group">
                <div className="input-label">Übriges freies Vermögen (CHF)</div>
                <input 
                  type="number" 
                  value={state.otherWealth} 
                  onChange={(e) => updateState('otherWealth', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <div className="input-label">
                  <span className="input-label-text">Erwartete Marktrendite auf freies Vermögen</span>
                  <span className="input-value">{formatPercent(state.expectedMarketReturn)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="8.0" step="0.5" 
                  value={state.expectedMarketReturn}
                  onChange={(e) => updateState('expectedMarketReturn', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
              <h3 className="budget-section-title" style={{ marginTop: 0 }}>Immobilien & Finanzierung</h3>
              <div className="input-group">
                <div className="input-label">Immobilienwert (Marktwert CHF)</div>
                <input 
                  type="number" 
                  value={state.propertyValue} 
                  onChange={(e) => updateState('propertyValue', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="input-group">
                <div className="input-label">Steuerwert der Immobilie (CHF)</div>
                <input 
                  type="number" 
                  value={state.propertyTaxValue} 
                  onChange={(e) => updateState('propertyTaxValue', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="input-group">
                <div className="input-label">Hypothek (CHF)</div>
                <input 
                  type="number" 
                  value={state.mortgageAmount} 
                  onChange={(e) => updateState('mortgageAmount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <div className="input-label">
                  <span className="input-label-text">Hypothekarzins</span>
                  <span className="input-value">{formatPercent(state.mortgageInterestRate)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="5.0" step="0.1" 
                  value={state.mortgageInterestRate}
                  onChange={(e) => updateState('mortgageInterestRate', parseFloat(e.target.value))}
                />
              </div>
              <div className="input-group">
                <div className="input-label">Amortisation pro Jahr (CHF)</div>
                <input 
                  type="number" 
                  value={state.annualAmortization} 
                  onChange={(e) => updateState('annualAmortization', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="summary-box" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Laufende Wohnkosten Übersicht</h4>
                <div className="summary-row" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Zins, Amortisation, Unterhalt & Nebenkosten</span>
                </div>
                <div className="summary-row" style={{ fontWeight: 600, marginTop: '0.5rem' }}>
                  <span>Total (Monat)</span>
                  <span style={{ color: 'var(--danger)' }}>
                    {new Intl.NumberFormat('de-CH').format(Math.round(outputs.totalHousingCosts / 12))} CHF
                  </span>
                </div>
                <div className="summary-row" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  <span className="text-muted">Total (Jahr)</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {new Intl.NumberFormat('de-CH').format(Math.round(outputs.totalHousingCosts))} CHF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
