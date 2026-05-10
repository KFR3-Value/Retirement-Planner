import { createContext, useContext, useState, type ReactNode } from 'react';

export type YearKey = '2026' | '2027' | '2028' | '2029' | '2030' | '2031+';

export const YEARS: YearKey[] = ['2026', '2027', '2028', '2029', '2030', '2031+'];

export interface CapExEvent {
  id: string;
  description: string;
  amount: number;
  year: YearKey | string;
  isTaxDeductible?: boolean;
}

export interface PlanningState {
  // Section 1: Einkünfte
  ahv: {
    markusStartMonth: number; // 1 for Jan, 12 for Dec
    markusStartYear: number;
    markusEndMonth: number;
    markusEndYear: number;
    moniqueStartMonth: number;
    moniqueStartYear: number;
    moniqueEndMonth: number;
    moniqueEndYear: number;
    nichterwerbstaetig: boolean;
    fullPensionCouple: number;
  };
  pensionskasse: {
    startYear: number;
    startMonth: number;
    endYear: number;
    endMonth: number;
    totalCapital: number;
    renteSplit: number; // 0 to 100
    umwandlungssatz: number; // percentage
  };
  salary: {
    monthlyGross: number;
    startYear: number;
    startMonth: number; // 1 for Jan, 12 for Dec
    endYear: number;
    endMonth: number;
    deductionRate: number; // percentage
  };
  otherIncome: Record<YearKey, number>;
  eigenmietwert: Record<YearKey, number>;

  // Section 2: Ausgaben
  fixeKosten: {
    amortisation: number;
    krankenkasse: {
      base: number;
      applyAgeIncrease: boolean;
      ageIncreaseRate: number; // percentage
    };
    mobilitaet: number;
  };
  variableKosten: number;
  capExEvents: CapExEvent[];

  // Section 3: Immobilien
  immobilie: {
    efhTaxValue: number;
    eigenmietwert: number;
    hypothek: {
      saronAmount: number;
      saronRate: number; // percentage
      festAmount: number;
      festRate: number; // percentage
    };
    unterhaltRate: number; // percentage of EFH value
  };

  // Section 4: Vermögen
  assets: {
    saeule3a: {
      balance: number;
      withdrawalYear: string; // e.g. "2028" or ""
    };
    freizuegigkeitskonto: {
      balance: number;
      withdrawalYear: string;
    };
    startingLiquidWealth: number;
  };

  // Baseline
  baseline: {
    inflationRate: number; // percentage
    applyInflation: boolean;
    liquidYieldRate: number; // percentage
  };
}

const defaultState: PlanningState = {
  ahv: {
    markusStartMonth: 1, // Jan (1-indexed)
    markusStartYear: 2027,
    markusEndMonth: 12,
    markusEndYear: 2099,
    moniqueStartMonth: 10, // Oct (1-indexed)
    moniqueStartYear: 2027,
    moniqueEndMonth: 12,
    moniqueEndYear: 2099,
    nichterwerbstaetig: false,
    fullPensionCouple: 44100, // Reasonable max approximation
  },
  pensionskasse: {
    startYear: 2026,
    startMonth: 1, // Jan (1-indexed)
    endYear: 2099,
    endMonth: 12,
    totalCapital: 1200000,
    renteSplit: 50, // Default to 50% Rente, 50% Kapital
    umwandlungssatz: 5.0,
  },
  salary: {
    monthlyGross: 10000,
    startYear: 2026,
    startMonth: 1, // Jan (1-indexed)
    endYear: 2027,
    endMonth: 1, // Jan 2027
    deductionRate: 15, // Default 15% standard deductions
  },
  otherIncome: {
    '2026': 0, '2027': 0, '2028': 0, '2029': 0, '2030': 0, '2031+': 0
  },
  eigenmietwert: {
    '2026': 0, '2027': 0, '2028': 0, '2029': 0, '2030': 0, '2031+': 0
  },
  fixeKosten: {
    amortisation: 0,
    krankenkasse: {
      base: 12000, // Estimated base CHF per year for couple
      applyAgeIncrease: true,
      ageIncreaseRate: 3.0,
    },
    mobilitaet: 8000, // Default estimate
  },
  variableKosten: 36000, // Default estimate (3k/mo)
  capExEvents: [
    { id: '1', description: 'Kauf Firmenfahrzeug Skoda (AG 341628)', amount: 20000, year: '2026', isTaxDeductible: false },
    { id: '2', description: 'Renovation: OG Böden & Elternschlafzimmer', amount: 30000, year: '2026', isTaxDeductible: true },
    { id: '3', description: 'Umgebung & Garten', amount: 40000, year: '2027', isTaxDeductible: true }
  ],
  immobilie: {
    efhTaxValue: 810000,
    eigenmietwert: 0,
    hypothek: {
      saronAmount: 175000,
      saronRate: 0.86,
      festAmount: 600000,
      festRate: 1.68,
    },
    unterhaltRate: 1.0, // 1%
  },
  assets: {
    saeule3a: {
      balance: 0,
      withdrawalYear: '',
    },
    freizuegigkeitskonto: {
      balance: 40000,
      withdrawalYear: '2027',
    },
    startingLiquidWealth: 450000,
  },
  baseline: {
    inflationRate: 1.5,
    applyInflation: true,
    liquidYieldRate: 2.0,
  }
};

interface PlanningContextType {
  state: PlanningState;
  updateState: (section: keyof PlanningState, updates: any) => void;
  updateOtherIncome: (year: YearKey, value: number) => void;
  loadState: (newState: PlanningState) => void;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export const PlanningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlanningState>(defaultState);

  const updateState = (section: keyof PlanningState, updates: any) => {
    setState(prev => {
      const prevSection = prev[section];
      const isObject = typeof prevSection === 'object' && prevSection !== null && !Array.isArray(prevSection);
      return {
        ...prev,
        [section]: isObject ? { ...prevSection, ...updates } : updates
      };
    });
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
    <PlanningContext.Provider value={{ state, updateState, updateOtherIncome, loadState }}>
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
