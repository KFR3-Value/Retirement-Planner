import React, { useState } from 'react';
import { useRetirementModel } from '../hooks/useRetirementModel';
import { InputsCard } from './InputsCard';
import { CoverageGauge } from './CoverageGauge';
import { WaterfallChart } from './WaterfallChart';
import { GlidepathChart } from './GlidepathChart';
import { BudgetTab } from './BudgetTab';
import { IncomeTab } from './IncomeTab';
import { TaxTab } from './TaxTab';

export const Dashboard: React.FC = () => {
  const { state, updateState, outputs } = useRetirementModel();
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'income' | 'taxes'>('overview');

  return (
    <div className="app-container">
      <div className="dashboard-header">
        <h1>Pensionsplanung & Cash Flow (Familie Frey)</h1>
        <p className="text-muted">Interaktive Simulation für den Entscheid "Kapital vs. Rente" und Budgetplanung.</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          1. Übersicht
        </button>
        <button 
          className={`tab-button ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          2. Budget
        </button>
        <button 
          className={`tab-button ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          3. Einkommen & Vermögen
        </button>
        <button 
          className={`tab-button ${activeTab === 'taxes' ? 'active' : ''}`}
          onClick={() => setActiveTab('taxes')}
        >
          4. Steuern
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Block: Inputs */}
          <div>
            <InputsCard state={state} updateState={updateState} />
          </div>

          {/* Bottom Block: Visualizations & Summary stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 400px' }}><CoverageGauge outputs={outputs} /></div>
              <div style={{ flex: '1 1 400px' }}><WaterfallChart outputs={outputs} /></div>
            </div>
            
            <GlidepathChart state={state} outputs={outputs} />

            {/* Budget Summary Card */}
            <div className="card">
              <h2>Budget Zusammenfassung</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div className="summary-box">
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Einnahmen</h3>
                  <div className="summary-row">
                    <span>AHV</span>
                    <span>{new Intl.NumberFormat('de-CH').format(state.ahvAnnual)} CHF</span>
                  </div>
                  <div className="summary-row">
                    <span>PK Rente</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.pkAnnuity)} CHF</span>
                  </div>
                  <div className="summary-row">
                    <span>Erwartete Rendite (Lump Sum)</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.expectedAnnualYield)} CHF</span>
                  </div>
                  <div className="summary-row" style={{ fontWeight: 600 }}>
                    <span>Total Einnahmen</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.totalGuaranteedIncome + outputs.expectedAnnualYield)} CHF</span>
                  </div>
                </div>

                <div className="summary-box">
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Ausgaben</h3>
                  <div className="summary-row">
                    <span>Fixkosten (Wohnen, KK, etc.)</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.totalFixedCosts - outputs.totalEstimatedTaxes)} CHF</span>
                  </div>
                  <div className="summary-row">
                    <span>Variable Kosten & Rückstellungen</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.totalVariableCosts)} CHF</span>
                  </div>
                  <div className="summary-row">
                    <span>Laufende Steuern (geschätzt)</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.totalEstimatedTaxes)} CHF</span>
                  </div>
                  <div className="summary-row" style={{ fontWeight: 600 }}>
                    <span>Total Ausgaben</span>
                    <span>{new Intl.NumberFormat('de-CH').format(outputs.totalCosts)} CHF</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <BudgetTab state={state} updateState={updateState} />
      )}

      {activeTab === 'income' && (
        <IncomeTab state={state} outputs={outputs} updateState={updateState} />
      )}

      {activeTab === 'taxes' && (
        <TaxTab state={state} outputs={outputs} updateState={updateState} />
      )}
    </div>
  );
};
