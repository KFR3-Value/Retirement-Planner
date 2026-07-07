import { createContext, useContext, useState, type ReactNode } from 'react';

export type YearKey = string;

export const YEARS: YearKey[] = Array.from({ length: 2060 - 2026 + 1 }, (_, i) => String(2026 + i));

export interface OtherIncomeEvent {
  id: string;
  description: string;
  monthlyAmount: number;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  owner?: 'Markus' | 'Monique' | 'Gemeinsam';
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
  owner?: 'Markus' | 'Monique' | 'Gemeinsam';
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

export interface AmortisationEvent {
  id: string;
  description: string;
  amount: number;
  year: YearKey | string;
  mortgageType: 'saron' | 'fest';
}

export interface PensionskasseState {
  startYear: number;
  startMonth: number;
  endYear?: number;
  endMonth?: number;
  totalCapital: number;
  renteSplit: number; // 0 to 100
  umwandlungssatz: number; // percentage
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

export interface GlobalAssumptions {
  inflationRate: number;
  applyInflation: boolean;
  liquidYieldRate: number;
  taxMultiplierCanton: number;
  taxMultiplierCommune: number;
  taxMultiplierChurch: number;
  baseUmwandlungssatzMarkus: number;
  baseUmwandlungssatzMonique: number;
}

export interface ClientBaseline {
  ahv: {
    selectedScenarioId: string;
    scenarios: AHVScenarioDef[];
  };
  salaryStreams: SalaryStream[];
  otherIncomeEvents: OtherIncomeEvent[];
  living: {
    useDetailedExpenses?: boolean;
    haushaltEssen: number;
    mobilitaet: number;
    telefonHandyMedien: number;
    kleiderFreizeit: number;
    ferienReisen: number;
    versicherungenSonstige: number;
    detailedLiving?: {
      groceries: number;
      diningOut: number;
      householdSupplies: number;
      carAmortization: number;
      carInsurance: number;
      fuel: number;
      publicTransport: number;
      internetTv: number;
      mobilePhone: number;
      streaming: number;
      serafe: number;
      clothing: number;
      hobbies: number;
      entertainment: number;
      summerHolidays: number;
      winterSports: number;
      weekendTrips: number;
      personalLiability: number;
      legalProtection: number;
      lifeInsurance: number;
    };
  };
  health: {
    useDetailedExpenses?: boolean;
    krankenkasseBase: number;
    applyAgeIncrease: boolean;
    ageIncreaseRate: number;
    zahnarztOptiker: number;
    diversesReserve: number;
    detailedHealth?: {
      basicInsurance: number;
      supplementaryInsurance: number;
      franchise: number;
      deductibleExpected: number;
      uncoveredMeds: number;
      dentistCheckups: number;
      glassesContacts: number;
    };
  };
  housing: {
    efhTaxValue: number;
    bankLendingValue: number;
    eigenmietwert: number;
    saronAmount: number;
    saronRate: number;
    festAmount: number;
    festRate: number;
    unterhaltRate: number;
    stromHeizung: number;
    amortisation: number;
    amortisationTarget?: 'saron' | 'fest';
  };
  assets: {
    saeule3a: {
      balance: number;
      withdrawalYear: string;
    };
    freizuegigkeitskonto: {
      balance: number;
      withdrawalYear: string;
    };
    startingLiquidWealth: number;
  };
}

export interface ScenarioOverrides {
  pensionskasseMarkus: PensionskasseState;
  pensionskasseMonique: PensionskasseState;
  capExEvents: CapExEvent[];
  amortisationEvents: AmortisationEvent[];
  taxDeductions: Record<YearKey, YearlyDeductions>;
  survivor?: {
    deceasedPartner: 'Keiner' | 'Markus' | 'Monique';
    deathYear: number;
    expenseReductionFactor: number; // percentage
    pkSurvivorRate: number; // percentage
  };
}

export interface PlanningState {
  globalAssumptions: GlobalAssumptions;
  clientBaseline: ClientBaseline;
  scenarioOverrides: ScenarioOverrides;

  /** @deprecated Legacy flat structure field */
  ahv?: any;
  /** @deprecated Legacy flat structure field */
  salaryStreams?: any[];
  /** @deprecated Legacy flat structure field */
  otherIncomeEvents?: any[];
  /** @deprecated Legacy flat structure field */
  living?: any;
  /** @deprecated Legacy flat structure field */
  health?: any;
  /** @deprecated Legacy flat structure field */
  housing?: any;
  /** @deprecated Legacy flat structure field */
  assets?: any;
  /** @deprecated Legacy flat structure field */
  pensionskasseMarkus?: any;
  /** @deprecated Legacy flat structure field */
  pensionskasseMonique?: any;
  /** @deprecated Legacy flat structure field */
  capExEvents?: any[];
  /** @deprecated Legacy flat structure field */
  amortisationEvents?: any[];
  /** @deprecated Legacy flat structure field */
  taxDeductions?: Record<string, any>;
  /** @deprecated Legacy flat structure field */
  survivor?: any;
  /** @deprecated Legacy flat structure field */
  baseline?: any;
}

export const defaultState: PlanningState = {
  globalAssumptions: {
    inflationRate: 1.5,
    applyInflation: true,
    liquidYieldRate: 2,
    taxMultiplierCanton: 1.11,
    taxMultiplierCommune: 1.02,
    taxMultiplierChurch: 0.19,
    baseUmwandlungssatzMarkus: 5.125,
    baseUmwandlungssatzMonique: 5.0,
  },
  clientBaseline: {
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
        endMonth: 11,
        owner: 'Markus'
      }
    ],
    otherIncomeEvents: [],
    living: {
      useDetailedExpenses: false,
      haushaltEssen: 19680,
      mobilitaet: 7800,
      telefonHandyMedien: 1800,
      kleiderFreizeit: 6240,
      ferienReisen: 9600,
      versicherungenSonstige: 1848,
      detailedLiving: {
        groceries: 12000,
        diningOut: 6000,
        householdSupplies: 1680,
        carAmortization: 0,
        carInsurance: 2000,
        fuel: 4800,
        publicTransport: 1000,
        internetTv: 800,
        mobilePhone: 400,
        streaming: 265,
        serafe: 335,
        clothing: 3000,
        hobbies: 2000,
        entertainment: 1240,
        summerHolidays: 5000,
        winterSports: 3000,
        weekendTrips: 1600,
        personalLiability: 400,
        legalProtection: 400,
        lifeInsurance: 1048
      }
    },
    health: {
      useDetailedExpenses: false,
      krankenkasseBase: 14400,
      applyAgeIncrease: true,
      ageIncreaseRate: 3,
      zahnarztOptiker: 2640,
      diversesReserve: 9600,
      detailedHealth: {
        basicInsurance: 12000,
        supplementaryInsurance: 2400,
        franchise: 5000,
        deductibleExpected: 1400,
        uncoveredMeds: 3200,
        dentistCheckups: 1000,
        glassesContacts: 1640
      }
    },
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
      amortisationTarget: 'saron',
      stromHeizung: 3600
    },
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
    }
  },
  scenarioOverrides: {
    pensionskasseMarkus: {
      startYear: 2027,
      startMonth: 1,
      endYear: 2099,
      endMonth: 11,
      totalCapital: 1250000,
      renteSplit: 50,
      umwandlungssatz: 5.125
    },
    pensionskasseMonique: {
      startYear: 2030,
      startMonth: 9,
      endYear: 2099,
      endMonth: 11,
      totalCapital: 0,
      renteSplit: 100,
      umwandlungssatz: 5.0
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
    amortisationEvents: [],
    taxDeductions: YEARS.reduce((acc, y) => {
      acc[y] = { transport: 0, meal: 0, professional: 0, childcare: 0, alimony: 0, donations: 0, education: 0, other: 0 };
      return acc;
    }, {} as Record<string, YearlyDeductions>),
    survivor: {
      deceasedPartner: 'Keiner',
      deathYear: 2035,
      expenseReductionFactor: 70,
      pkSurvivorRate: 60
    }
  }
};

export function migrateFlatToNestedState(flatState: any): PlanningState {
  // Ensure both structure is nested and the new amortisation fields exist.
  // To be safe, we will migrate and also make sure default fields exist.
  const nested = (flatState.clientBaseline && flatState.scenarioOverrides && flatState.globalAssumptions)
    ? { ...flatState }
    : {
        globalAssumptions: {
          inflationRate: flatState.baseline?.inflationRate ?? flatState.globalAssumptions?.inflationRate ?? 1.5,
          applyInflation: flatState.baseline?.applyInflation ?? flatState.globalAssumptions?.applyInflation ?? true,
          liquidYieldRate: flatState.baseline?.liquidYieldRate ?? flatState.globalAssumptions?.liquidYieldRate ?? 2,
          taxMultiplierCanton: flatState.globalAssumptions?.taxMultiplierCanton ?? 1.11,
          taxMultiplierCommune: flatState.globalAssumptions?.taxMultiplierCommune ?? 1.02,
          taxMultiplierChurch: flatState.globalAssumptions?.taxMultiplierChurch ?? 0.19,
          baseUmwandlungssatzMarkus: flatState.globalAssumptions?.baseUmwandlungssatzMarkus ?? flatState.pensionskasseMarkus?.umwandlungssatz ?? 5.125,
          baseUmwandlungssatzMonique: flatState.globalAssumptions?.baseUmwandlungssatzMonique ?? flatState.pensionskasseMonique?.umwandlungssatz ?? 5.0,
        },
        clientBaseline: {
          ahv: flatState.ahv ?? defaultState.clientBaseline.ahv,
          salaryStreams: flatState.salaryStreams ?? defaultState.clientBaseline.salaryStreams,
          otherIncomeEvents: flatState.otherIncomeEvents ?? defaultState.clientBaseline.otherIncomeEvents,
          living: {
            ...(flatState.living ?? defaultState.clientBaseline.living),
            useDetailedExpenses: flatState.living?.useDetailedExpenses ?? defaultState.clientBaseline.living.useDetailedExpenses,
            detailedLiving: flatState.living?.detailedLiving ?? defaultState.clientBaseline.living.detailedLiving,
          },
          health: {
            ...(flatState.health ?? defaultState.clientBaseline.health),
            useDetailedExpenses: flatState.health?.useDetailedExpenses ?? defaultState.clientBaseline.health.useDetailedExpenses,
            detailedHealth: flatState.health?.detailedHealth ?? defaultState.clientBaseline.health.detailedHealth,
          },
          housing: {
            ...(flatState.housing ?? defaultState.clientBaseline.housing),
            amortisation: flatState.housing?.amortisation ?? defaultState.clientBaseline.housing.amortisation ?? 0,
          },
          assets: flatState.assets ?? defaultState.clientBaseline.assets,
        },
        scenarioOverrides: {
          pensionskasseMarkus: flatState.pensionskasseMarkus ?? defaultState.scenarioOverrides.pensionskasseMarkus,
          pensionskasseMonique: flatState.pensionskasseMonique ?? defaultState.scenarioOverrides.pensionskasseMonique,
          capExEvents: flatState.capExEvents ?? defaultState.scenarioOverrides.capExEvents,
          amortisationEvents: flatState.amortisationEvents ?? defaultState.scenarioOverrides.amortisationEvents ?? [],
          taxDeductions: flatState.taxDeductions ?? defaultState.scenarioOverrides.taxDeductions,
          survivor: flatState.survivor ?? defaultState.scenarioOverrides.survivor,
        }
      };

  // Ensure new fields exist even if nested structure was already present
  if (!nested.clientBaseline.housing.amortisationTarget) {
    nested.clientBaseline.housing.amortisationTarget = 'saron';
  }
  if (!nested.scenarioOverrides.amortisationEvents) {
    nested.scenarioOverrides.amortisationEvents = [];
  }

  return nested as PlanningState;
}

interface PlanningContextType {
  state: PlanningState;
  updateState: (section: string, updates: any) => void;
  loadState: (newState: PlanningState) => void;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export const PlanningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlanningState>(defaultState);

  const updateState = (section: string, updates: any) => {
    setState(prev => {
      // 1. Client Baseline
      if (['ahv', 'salaryStreams', 'otherIncomeEvents', 'living', 'health', 'housing', 'assets'].includes(section)) {
        const prevSection = prev.clientBaseline[section as keyof ClientBaseline];
        const isObject = typeof prevSection === 'object' && prevSection !== null && !Array.isArray(prevSection);
        return {
          ...prev,
          clientBaseline: {
            ...prev.clientBaseline,
            [section]: isObject ? { ...prevSection, ...updates } : updates
          }
        };
      }
      
      // 2. Scenario Overrides
      if (['pensionskasseMarkus', 'pensionskasseMonique', 'capExEvents', 'amortisationEvents', 'taxDeductions', 'survivor'].includes(section)) {
        const prevSection = prev.scenarioOverrides[section as keyof ScenarioOverrides];
        const isObject = typeof prevSection === 'object' && prevSection !== null && !Array.isArray(prevSection);
        return {
          ...prev,
          scenarioOverrides: {
            ...prev.scenarioOverrides,
            [section]: isObject ? { ...prevSection, ...updates } : updates
          }
        };
      }
      
      // 3. Global Assumptions (mapped from 'baseline')
      if (section === 'baseline') {
        return {
          ...prev,
          globalAssumptions: {
            ...prev.globalAssumptions,
            ...updates
          }
        };
      }

      // 4. Global Assumptions (mapped directly)
      if (section === 'globalAssumptions') {
        return {
          ...prev,
          globalAssumptions: {
            ...prev.globalAssumptions,
            ...updates
          }
        };
      }

      // Fallback/Direct update if section is a top-level bucket
      if (['globalAssumptions', 'clientBaseline', 'scenarioOverrides'].includes(section)) {
        return {
          ...prev,
          [section as keyof PlanningState]: {
            ...prev[section as keyof PlanningState],
            ...updates
          }
        } as PlanningState;
      }

      return prev;
    });
  };

  const loadState = (newState: PlanningState) => {
    setState(migrateFlatToNestedState(newState));
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
