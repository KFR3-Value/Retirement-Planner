import { createContext, useContext, useState, type ReactNode } from 'react';

export type YearKey = '2026' | '2027' | '2028' | '2029' | '2030' | '2031+';

export const YEARS: YearKey[] = ['2026', '2027', '2028', '2029', '2030', '2031+'];

export interface OtherIncomeEvent {
  id: string;
  description: string;
  monthlyAmount: number;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export interface SalaryDeductions {
  ahv: number;  ahvBasis?: number;
  alv: number;  alvBasis?: number;
  nbuv: number; nubvBasis?: number;
  ktg: number;  ktgBasis?: number;
  bvg: number;  bvgBasis?: number;
  other: number; otherBasis?: number;
}

export interface SalaryStream {
  id: string;
  description: string;
  inputType: 'brutto' | 'netto';
  amount: number;
  deductions: SalaryDeductions;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export interface AHVStream {
  id: string;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  markusAmount: number;
  moniqueAmount: number;
}

export interface AHVScenarioDef {
  id: string;
  name: string;
  streams: AHVStream[];
}

export interface CapExEvent {
  id: string;
  description: string;
  amount: number;
  year: YearKey | string;
  isTaxDeductible?: boolean;
  category?: 'housing' | 'living' | 'health';
}

export interface PlanningState {
  // Section 1: Einkünfte
  ahv: {
    selectedScenarioId: string;
    scenarios: AHVScenarioDef[];
  };
  pensionskasse: {
    startYear: number;
    startMonth: number;
    totalCapital: number;
    renteSplit: number; // 0 to 100
    umwandlungssatz: number; // percentage
  };
  salaryStreams: SalaryStream[];
  otherIncomeEvents: OtherIncomeEvent[];

  // Domains
  housing: {
    efhTaxValue: number;
    bankLendingValue: number;
    eigenmietwert: number;
    saronAmount: number;
    saronRate: number; // percentage
    festAmount: number;
    festRate: number; // percentage
    unterhaltRate: number; // percentage of EFH value
    amortisation: number;
    stromHeizung: number;
  };
  living: {
    haushaltEssen: number;
    mobilitaet: number;
    telefonHandyMedien: number;
    kleiderFreizeit: number;
    ferienReisen: number;
    versicherungenSonstige: number;
  };
  health: {
    krankenkasseBase: number;
    applyAgeIncrease: boolean;
    ageIncreaseRate: number; // percentage
    zahnarztOptiker: number;
    diversesReserve: number;
  };
  capExEvents: CapExEvent[];

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
  taxDeductions: Record<YearKey, YearlyDeductions>;
}

export interface YearlyDeductions {
  transport: number;
  meal: number;
  professional: number;
  insuranceOverride?: number;
  childcare: number;
  alimony: number;
  donations: number;
  education: number;
  other: number;
}

const defaultState: PlanningState = {
  ahv: {
    selectedScenarioId: 'scen1',
    scenarios: [
      {
        id: 'scen1',
        name: 'Szenario 1 (Monique ab 10.2027)',
        streams: [
          { id: 's1-1', startYear: 2026, startMonth: 0, endYear: 2027, endMonth: 8, markusAmount: 2520, moniqueAmount: 0 },
          { id: 's1-2', startYear: 2027, startMonth: 9, endYear: 2030, endMonth: 8, markusAmount: 2495, moniqueAmount: 1159 },
          { id: 's1-3', startYear: 2030, startMonth: 9, endYear: 2099, endMonth: 11, markusAmount: 1925, moniqueAmount: 1819 }
        ]
      },
      {
        id: 'scen2',
        name: 'Szenario 2 (Monique ab 10.2029)',
        streams: [
          { id: 's2-1', startYear: 2026, startMonth: 0, endYear: 2029, endMonth: 8, markusAmount: 2520, moniqueAmount: 0 },
          { id: 's2-2', startYear: 2029, startMonth: 9, endYear: 2030, endMonth: 8, markusAmount: 2518, moniqueAmount: 1262 },
          { id: 's2-3', startYear: 2030, startMonth: 9, endYear: 2099, endMonth: 11, markusAmount: 1925, moniqueAmount: 1855 }
        ]
      },
      {
        id: 'scen3',
        name: 'Szenario 3 (Monique regulär ab 10.2030)',
        streams: [
          { id: 's3-1', startYear: 2026, startMonth: 0, endYear: 2030, endMonth: 8, markusAmount: 2520, moniqueAmount: 0 },
          { id: 's3-2', startYear: 2030, startMonth: 9, endYear: 2099, endMonth: 11, markusAmount: 1925, moniqueAmount: 1955 }
        ]
      }
    ]
  },
  pensionskasse: {
    startYear: 2027,
    startMonth: 1,
    totalCapital: 1250000,
    renteSplit: 50,
    umwandlungssatz: 5.125
  },
  salaryStreams: [
    {
      id: 'salary-1',
      description: 'Lohn Markus (Base 2026)',
      inputType: 'netto',
      amount: 9500,
      deductions: {
        ahv: 4.66,
        ahvBasis: 10236.4,
        alv: 0,
        nbuv: 0.77,
        nubvBasis: 11636.4,
        ktg: 0.52,
        ktgBasis: 11636.4,
        bvg: 12.88,
        other: -3.17
      },
      startYear: 2026,
      startMonth: 0,
      endYear: 2026,
      endMonth: 11
    }
  ],
  otherIncomeEvents: [],
  housing: {
    efhTaxValue: 810000,
    bankLendingValue: 1400000,
    eigenmietwert: 16800,
    saronAmount: 175000,
    saronRate: 0.86,
    festAmount: 600000,
    festRate: 1.68,
    unterhaltRate: 1,
    amortisation: 0,
    stromHeizung: 3600
  },
  living: {
    haushaltEssen: 19680,
    mobilitaet: 7800,
    telefonHandyMedien: 1800,
    kleiderFreizeit: 6240,
    ferienReisen: 9600,
    versicherungenSonstige: 1848
  },
  health: {
    krankenkasseBase: 14400,
    applyAgeIncrease: true,
    ageIncreaseRate: 3,
    zahnarztOptiker: 2640,
    diversesReserve: 9600
  },
  capExEvents: [
    {
      id: '1',
      description: 'Kauf Firmenfahrzeug Skoda (AG 341628)',
      amount: 20000,
      year: '2026',
      isTaxDeductible: false,
      category: 'living'
    },
    {
      id: '2',
      description: 'Renovation: OG Böden & Elternschlafzimmer',
      amount: 30000,
      year: '2026',
      isTaxDeductible: true,
      category: 'housing'
    },
    {
      id: '3',
      description: 'Umgebung & Garten',
      amount: 40000,
      year: '2027',
      isTaxDeductible: true,
      category: 'housing'
    }
  ],
  assets: {
    saeule3a: {
      balance: 20000,
      withdrawalYear: '2027'
    },
    freizuegigkeitskonto: {
      balance: 40000,
      withdrawalYear: '2027'
    },
    startingLiquidWealth: 280000
  },
  baseline: {
    inflationRate: 1.5,
    applyInflation: true,
    liquidYieldRate: 2
  },
  taxDeductions: {
    '2026': { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 },
    '2027': { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 },
    '2028': { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 },
    '2029': { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 },
    '2030': { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 },
    '2031+': { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 }
  }
};

interface PlanningContextType {
  state: PlanningState;
  updateState: (section: keyof PlanningState, updates: any) => void;
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

  const loadState = (newState: PlanningState) => {
    setState(newState);
  };

  return (
    <PlanningContext.Provider value={{ state, updateState, loadState }}>
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
