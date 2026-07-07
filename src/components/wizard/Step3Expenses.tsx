import React, { useState } from 'react';
import type { PlanningState } from '../../context/PlanningContext';

interface StepProps {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState> | ((prev: PlanningState) => PlanningState)) => void;
}

export const Step3Expenses: React.FC<StepProps> = ({ state, updateState }) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('yearly');

  const useDetailed = state.clientBaseline.living.useDetailedExpenses || false;

  const handleToggleDetailed = (enabled: boolean) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        living: { ...prev.clientBaseline.living, useDetailedExpenses: enabled },
        health: { ...prev.clientBaseline.health, useDetailedExpenses: enabled }
      }
    }));
  };

  const handleLivingChange = (field: keyof typeof state.clientBaseline.living, value: number) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        living: {
          ...prev.clientBaseline.living,
          [field]: value
        }
      }
    }));
  };

  const handleHealthChange = (field: keyof typeof state.clientBaseline.health, value: any) => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        health: {
          ...prev.clientBaseline.health,
          [field]: value
        }
      }
    }));
  };

  const handleDetailedLivingChange = (field: keyof NonNullable<typeof state.clientBaseline.living.detailedLiving>, value: number) => {
    updateState(prev => {
      const oldDetailed = prev.clientBaseline.living.detailedLiving || {} as any;
      const detailedLiving = { ...oldDetailed, [field]: value };
      
      const haushaltEssen = (detailedLiving.groceries || 0) + (detailedLiving.diningOut || 0) + (detailedLiving.householdSupplies || 0);
      const mobilitaet = (detailedLiving.carAmortization || 0) + (detailedLiving.carInsurance || 0) + (detailedLiving.fuel || 0) + (detailedLiving.publicTransport || 0);
      const telefonHandyMedien = (detailedLiving.internetTv || 0) + (detailedLiving.mobilePhone || 0) + (detailedLiving.streaming || 0) + (detailedLiving.serafe || 0);
      const kleiderFreizeit = (detailedLiving.clothing || 0) + (detailedLiving.hobbies || 0) + (detailedLiving.entertainment || 0);
      const ferienReisen = (detailedLiving.summerHolidays || 0) + (detailedLiving.winterSports || 0) + (detailedLiving.weekendTrips || 0);
      const versicherungenSonstige = (detailedLiving.personalLiability || 0) + (detailedLiving.legalProtection || 0) + (detailedLiving.lifeInsurance || 0);

      return {
        ...prev,
        clientBaseline: {
          ...prev.clientBaseline,
          living: {
            ...prev.clientBaseline.living,
            detailedLiving,
            haushaltEssen,
            mobilitaet,
            telefonHandyMedien,
            kleiderFreizeit,
            ferienReisen,
            versicherungenSonstige
          }
        }
      };
    });
  };

  const handleDetailedHealthChange = (field: keyof NonNullable<typeof state.clientBaseline.health.detailedHealth>, value: number) => {
    updateState(prev => {
      const oldDetailed = prev.clientBaseline.health.detailedHealth || {} as any;
      const detailedHealth = { ...oldDetailed, [field]: value };

      const krankenkasseBase = (detailedHealth.basicInsurance || 0) + (detailedHealth.supplementaryInsurance || 0);
      const diversesReserve = (detailedHealth.franchise || 0) + (detailedHealth.deductibleExpected || 0) + (detailedHealth.uncoveredMeds || 0);
      const zahnarztOptiker = (detailedHealth.dentistCheckups || 0) + (detailedHealth.glassesContacts || 0);

      return {
        ...prev,
        clientBaseline: {
          ...prev.clientBaseline,
          health: {
            ...prev.clientBaseline.health,
            detailedHealth,
            krankenkasseBase,
            diversesReserve,
            zahnarztOptiker
          }
        }
      };
    });
  };

  const renderDetailedField = (label: string, section: 'living' | 'health', field: string) => {
    const detailedLiving = state.clientBaseline.living.detailedLiving || {} as any;
    const detailedHealth = state.clientBaseline.health.detailedHealth || {} as any;
    
    let rawValue = 0;
    if (section === 'living') {
      rawValue = detailedLiving[field] || 0;
    } else {
      rawValue = detailedHealth[field] || 0;
    }

    const displayValue = timeframe === 'monthly' ? Math.round(rawValue / 12) : rawValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value) || 0;
      const annualValue = timeframe === 'monthly' ? val * 12 : val;
      if (section === 'living') {
        handleDetailedLivingChange(field as any, annualValue);
      } else {
        handleDetailedHealthChange(field as any, annualValue);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <div className="relative">
          <input
            type="number"
            value={displayValue || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
            placeholder="0"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Lebenshaltungs- & Gesundheitskosten</h3>
          <p className="text-slate-400 mt-2">
            Schätzen Sie Ihre Haushalts- und Gesundheitskosten. Wechseln Sie zur detaillierten Erfassung für geführte Unterkategorien.
          </p>
        </div>
        
        {/* Simple vs Detailed Toggle */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-lg shrink-0">
          <button
            onClick={() => handleToggleDetailed(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              !useDetailed ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Einfach
          </button>
          <button
            onClick={() => handleToggleDetailed(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              useDetailed ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Detailliert
          </button>
        </div>
      </div>

      {useDetailed && (
        <div className="mb-6 flex justify-end">
          {/* Monthly vs Yearly toggle */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                timeframe === 'monthly' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                timeframe === 'yearly' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Jährlich
            </button>
          </div>
        </div>
      )}

      {!useDetailed ? (
        <div className="space-y-6">
          {/* Simple Living Expenses */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Jährliche Lebenshaltungskosten (CHF)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Haushalt & Verpflegung</label>
                <input type="number" value={state.clientBaseline.living.haushaltEssen} onChange={e => handleLivingChange('haushaltEssen', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mobilität (Auto, ÖV)</label>
                <input type="number" value={state.clientBaseline.living.mobilitaet} onChange={e => handleLivingChange('mobilitaet', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Telecom & Medien</label>
                <input type="number" value={state.clientBaseline.living.telefonHandyMedien} onChange={e => handleLivingChange('telefonHandyMedien', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kleidung & Freizeit</label>
                <input type="number" value={state.clientBaseline.living.kleiderFreizeit} onChange={e => handleLivingChange('kleiderFreizeit', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ferien & Reisen</label>
                <input type="number" value={state.clientBaseline.living.ferienReisen} onChange={e => handleLivingChange('ferienReisen', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sonstige Versicherungen (Haftpflicht, etc.)</label>
                <input type="number" value={state.clientBaseline.living.versicherungenSonstige} onChange={e => handleLivingChange('versicherungenSonstige', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
            </div>
          </div>

          {/* Simple Health Expenses */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-100 mb-4 font-mono tracking-wide">Jährliche Gesundheitskosten (CHF)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Krankenkasse (Grund & Zusatz)</label>
                <input type="number" value={state.clientBaseline.health.krankenkasseBase} onChange={e => handleHealthChange('krankenkasseBase', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Zahnarzt & Optiker</label>
                <input type="number" value={state.clientBaseline.health.zahnarztOptiker} onChange={e => handleHealthChange('zahnarztOptiker', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Diverses / Gesundheitsreserven</label>
                <input type="number" value={state.clientBaseline.health.diversesReserve} onChange={e => handleHealthChange('diversesReserve', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono" />
              </div>

              <div className="sm:col-span-2 flex items-center mt-2 p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                <input type="checkbox" id="applyAgeIncrease" checked={state.clientBaseline.health.applyAgeIncrease} onChange={e => handleHealthChange('applyAgeIncrease', e.target.checked)} className="w-4 h-4 text-emerald-600 border-slate-700 bg-slate-950 rounded focus:ring-emerald-500 focus:ring-offset-slate-900" />
                <label htmlFor="applyAgeIncrease" className="ml-2 text-sm text-slate-300 font-medium">Altersbedingte Prämienerhöhung anwenden</label>
                {state.clientBaseline.health.applyAgeIncrease && (
                  <div className="ml-auto flex items-center">
                    <span className="text-sm text-slate-400 mr-2">Satz:</span>
                    <div className="relative w-20">
                      <input type="number" step="0.1" value={state.clientBaseline.health.ageIncreaseRate} onChange={e => handleHealthChange('ageIncreaseRate', parseFloat(e.target.value) || 0)} className="w-full pl-2 pr-6 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono" />
                      <span className="absolute right-2 top-1 text-slate-500 text-sm font-mono">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Detailed Living Expenses */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Haushalt & Verpflegung</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.living.haushaltEssen / 12) : state.clientBaseline.living.haushaltEssen}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderDetailedField('Lebensmittel (Supermarkt)', 'living', 'groceries')}
                {renderDetailedField('Restaurant / Auswärts essen', 'living', 'diningOut')}
                {renderDetailedField('Haushaltsartikel / Reinigung', 'living', 'householdSupplies')}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Mobilität (Auto, ÖV)</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.living.mobilitaet / 12) : state.clientBaseline.living.mobilitaet}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderDetailedField('Auto Amortisation / Leasing', 'living', 'carAmortization')}
                {renderDetailedField('Autoversicherung & Steuern', 'living', 'carInsurance')}
                {renderDetailedField('Treibstoff / Laden / Parken', 'living', 'fuel')}
                {renderDetailedField('Öffentlicher Verkehr (GA, Halbtax)', 'living', 'publicTransport')}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Telecom & Medien</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.living.telefonHandyMedien / 12) : state.clientBaseline.living.telefonHandyMedien}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderDetailedField('Internet & TV zu Hause', 'living', 'internetTv')}
                {renderDetailedField('Handyabo', 'living', 'mobilePhone')}
                {renderDetailedField('Streaming-Dienste', 'living', 'streaming')}
                {renderDetailedField('Serafe (Radio-/TV-Gebühr)', 'living', 'serafe')}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Kleidung & Freizeit</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.living.kleiderFreizeit / 12) : state.clientBaseline.living.kleiderFreizeit}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderDetailedField('Kleidung & Schuhe', 'living', 'clothing')}
                {renderDetailedField('Hobbies & Fitness', 'living', 'hobbies')}
                {renderDetailedField('Unterhaltung & Ausgang', 'living', 'entertainment')}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Ferien & Reisen</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.living.ferienReisen / 12) : state.clientBaseline.living.ferienReisen}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderDetailedField('Sommerferien', 'living', 'summerHolidays')}
                {renderDetailedField('Wintersport', 'living', 'winterSports')}
                {renderDetailedField('Wochenendausflüge', 'living', 'weekendTrips')}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Sonstige Versicherungen</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.living.versicherungenSonstige / 12) : state.clientBaseline.living.versicherungenSonstige}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderDetailedField('Privathaftpflicht / Hausrat', 'living', 'personalLiability')}
                {renderDetailedField('Rechtsschutz', 'living', 'legalProtection')}
                {renderDetailedField('Lebensversicherung', 'living', 'lifeInsurance')}
              </div>
            </div>
          </div>

          {/* Detailed Health Expenses */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 shadow-sm space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Krankenkasse</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.health.krankenkasseBase / 12) : state.clientBaseline.health.krankenkasseBase}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderDetailedField('Grundversicherung (KVG)', 'health', 'basicInsurance')}
                {renderDetailedField('Zusatzversicherung (VVG)', 'health', 'supplementaryInsurance')}
              </div>
              <div className="mt-4 p-3 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center">
                <input type="checkbox" id="applyAgeIncreaseDetailed" checked={state.clientBaseline.health.applyAgeIncrease} onChange={e => handleHealthChange('applyAgeIncrease', e.target.checked)} className="w-4 h-4 text-emerald-600 border-slate-700 bg-slate-950 rounded focus:ring-emerald-500 focus:ring-offset-slate-900" />
                <label htmlFor="applyAgeIncreaseDetailed" className="ml-2 text-sm text-slate-300 font-medium">Altersbedingte Prämienerhöhung anwenden</label>
                {state.clientBaseline.health.applyAgeIncrease && (
                  <div className="ml-auto flex items-center">
                    <span className="text-sm text-slate-400 mr-2">Satz:</span>
                    <div className="relative w-20">
                      <input type="number" step="0.1" value={state.clientBaseline.health.ageIncreaseRate} onChange={e => handleHealthChange('ageIncreaseRate', parseFloat(e.target.value) || 0)} className="w-full pl-2 pr-6 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono" />
                      <span className="absolute right-2 top-1 text-slate-500 text-sm font-mono">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Selbstbehalt & Reserven</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.health.diversesReserve / 12) : state.clientBaseline.health.diversesReserve}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderDetailedField('Gewählte Franchise (z.B. 2500)', 'health', 'franchise')}
                {renderDetailedField('Erwarteter Selbstbehalt (max. 700)', 'health', 'deductibleExpected')}
                {renderDetailedField('Selbstbezahlte Medis / Behandlungen', 'health', 'uncoveredMeds')}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-lg font-semibold text-slate-100 font-mono tracking-wide">Zahnarzt & Optiker</h4>
                <div className="text-emerald-400 font-mono">Total {timeframe === 'monthly' ? 'Monatlich' : 'Jährlich'}: {timeframe === 'monthly' ? Math.round(state.clientBaseline.health.zahnarztOptiker / 12) : state.clientBaseline.health.zahnarztOptiker}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderDetailedField('Zahnarzt & Dentalhygiene', 'health', 'dentistCheckups')}
                {renderDetailedField('Brillen & Kontaktlinsen', 'health', 'glassesContacts')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
