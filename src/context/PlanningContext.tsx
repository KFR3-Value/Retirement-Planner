import { createContext, useContext, useState, type ReactNode } from 'react';

export type YearKey = '2026' | '2027' | '2028' | '2029' | '2030' | '2031+';

export const YEARS: YearKey[] = ['2026', '2027', '2028', '2029', '2030', '2031+'];

export interface PlanningState {
  // Section 1: Einkünfte
  ahv: {
    markusStartMonth: number; // 0 for Jan, etc.
    markusStartYear: number;
    moniqueStartMonth: number;
    moniqueStartYear: number;
    nichterwerbstaetig: boolean;
    fullPensionCouple: number;
  };
  pensionskasse: {
    startYear: number;
    startMonth: number;
    totalCapital: number;
    renteSplit: number; // 0 to 100
    umwandlungssatz: number; // percentage
  };
  otherIncome: Record<YearKey, number>;

  // Section 2: Ausgaben
  fixeKosten: {
    hypothek: {
      saronAmount: number;
      saronRate: number; // percentage
      festAmount: number;
      festRate: number; // percentage
    };
    amortisation: number;
    unterhaltRate: number; // percentage of EFH value
    krankenkasse: {
      base: number;
      applyAgeIncrease: boolean;
      ageIncreaseRate: number; // percentage
    };
    mobilitaet: number;
  };
  variableKosten: number;
  capEx: Record<YearKey, number>;

  // Section 3: Vermögen
  assets: {
    efhTaxValue: number;
    saeule3a: {
      balance: number;
      withdrawalYear: string; // e.g. "2028" or ""
    };
    startingLiquidWealth: number;
  };

  // Baseline
  baseline: {
    inflationRate: number; // percentage
    applyInflation: boolean;
  };
}

const defaultState: PlanningState = {
  ahv: {
    markusStartMonth: 0, // Jan
    markusStartYear: 2027,
    moniqueStartMonth: 9, // Oct
    moniqueStartYear: 2027,
    nichterwerbstaetig: false,
    fullPensionCouple: 44100, // Reasonable max approximation
  },
  pensionskasse: {
    startYear: 2026,
    startMonth: 0,
    totalCapital: 1200000,
    renteSplit: 50, // Default to 50% Rente, 50% Kapital
    umwandlungssatz: 5.0,
  },
  otherIncome: {
    '2026': 0, '2027': 0, '2028': 0, '2029': 0, '2030': 0, '2031+': 0
  },
  fixeKosten: {
    hypothek: {
      saronAmount: 175000,
      saronRate: 0.86,
      festAmount: 600000,
      festRate: 1.68,
    },
    amortisation: 0,
    unterhaltRate: 1.0, // 1%
    krankenkasse: {
      base: 12000, // Estimated base CHF per year for couple
      applyAgeIncrease: true,
      ageIncreaseRate: 3.0,
    },
    mobilitaet: 8000, // Default estimate
  },
  variableKosten: 36000, // Default estimate (3k/mo)
  capEx: {
    '2026': 0, '2027': 0, '2028': 0, '2029': 0, '2030': 0, '2031+': 0
  },
  assets: {
    efhTaxValue: 810000,
    saeule3a: {
      balance: 0,
      withdrawalYear: '',
    },
    startingLiquidWealth: 450000,
  },
  baseline: {
    inflationRate: 1.5,
    applyInflation: true,
  }
};

interface PlanningContextType {
  state: PlanningState;
  updateState: (section: keyof PlanningState, updates: any) => void;
  updateCapEx: (year: YearKey, value: number) => void;
  updateOtherIncome: (year: YearKey, value: number) => void;
  loadState: (newState: PlanningState) => void;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export const PlanningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlanningState>(defaultState);

  const updateState = (section: keyof PlanningState, updates: any) => {
    setState(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...updates }
    }));
  };

  const updateCapEx = (year: YearKey, value: number) => {
    setState(prev => ({
      ...prev,
      capEx: { ...prev.capEx, [year]: value }
    }));
  };

  const updateOtherIncome = (year: YearKey, value: number) => {
    setState(prev => ({
      ...prev,
      otherIncome: { ...prev.otherIncome, [year]: value }
    }));
  };

  const loadState = (newState: PlanningState) => {
    setState(newState);
  };

  return (
    <PlanningContext.Provider value={{ state, updateState, updateCapEx, updateOtherIncome, loadState }}>
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (context === undefined) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};
