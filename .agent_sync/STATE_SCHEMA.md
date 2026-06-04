# Application State Schema

This document outlines the restructured foundational data models and global state for the Bettwil Retirement Planner application.

## State Architecture

The application state has been restructured from a flat key-value model into three strictly typed, logical domains:

1. **Global Assumptions (`globalAssumptions`)**: Global financial, market, and tax parameters that apply across all calculations.
2. **Client Baseline (`clientBaseline`)**: Objective financial truths, baseline income streams, static assets, and primary real estate data.
3. **Scenario Overrides (`scenarioOverrides`)**: Subjective decisions, retirement strategies, pensionskasse settings, and one-off capex events.

---

## TypeScript Interfaces

Below are the exact, finalized TypeScript definitions located in `packages/shared/src/types.ts`.

### 1. Global Assumptions

```typescript
export interface GlobalAssumptions {
  inflationRate: number;                  // Inflation rate in percent (e.g., 1.5)
  applyInflation: boolean;                // Whether to apply inflation adjustment
  liquidYieldRate: number;                // Expected return rate on liquid wealth (percent)
  taxMultiplierCanton: number;            // Cantonal tax multiplier (e.g., 1.11 for Aargau)
  taxMultiplierCommune: number;           // Municipal tax multiplier (e.g., 1.02 for Bettwil)
  taxMultiplierChurch: number;            // Church tax multiplier (e.g., 0.19)
  baseUmwandlungssatzMarkus: number;      // Standard/Default PK conversion rate for Markus
  baseUmwandlungssatzMonique: number;     // Standard/Default PK conversion rate for Monique
}
```

### 2. Client Baseline

```typescript
export interface ClientBaseline {
  ahv: {
    selectedScenarioId: string;
    scenarios: any[];
  };
  salaryStreams: any[];
  otherIncomeEvents?: any[];
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
    ageIncreaseRate: number;
    zahnarztOptiker: number;
    diversesReserve: number;
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
```

### 3. Scenario Overrides

```typescript
export interface ScenarioOverrides {
  pensionskasseMarkus: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
    totalCapital: number;
    renteSplit: number;                   // Percentage taken as annuity (0 - 100)
    umwandlungssatz: number;              // Custom conversion rate applied
  };
  pensionskasseMonique: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
    totalCapital: number;
    renteSplit: number;                   // Percentage taken as annuity (0 - 100)
    umwandlungssatz: number;              // Custom conversion rate applied
  };
  capExEvents: any[];                     // One-off capital expenditure events
  taxDeductions: Record<string, any>;     // Year-by-year manual tax deductions
  survivor?: {                            // Partner survival simulation settings
    deceasedPartner: 'Keiner' | 'Markus' | 'Monique';
    deathYear: number;
    expenseReductionFactor: number;       // Reduced living expense percentage
    pkSurvivorRate: number;               // Widow's pension rate from PK (percent)
  };
}
```

### 4. Master Planning State

```typescript
export interface PlanningState {
  globalAssumptions: GlobalAssumptions;
  clientBaseline: ClientBaseline;
  scenarioOverrides: ScenarioOverrides;
}
```

---

## State Migration Strategy

To support legacy files and previously stored states (e.g. from local storage), the `PlanningContext` includes automatic migration logic:

```typescript
export function migrateFlatToNestedState(flatState: any): PlanningState {
  if (flatState.clientBaseline && flatState.scenarioOverrides && flatState.globalAssumptions) {
    return flatState as PlanningState;
  }

  // It's a flat legacy state, construct the new structure with fallbacks.
  return {
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
      living: flatState.living ?? defaultState.clientBaseline.living,
      health: flatState.health ?? defaultState.clientBaseline.health,
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
      taxDeductions: flatState.taxDeductions ?? defaultState.scenarioOverrides.taxDeductions,
      survivor: flatState.survivor ?? defaultState.scenarioOverrides.survivor,
    }
  };
}
```

---

## State Mutator (`updateState`)

The state update helper supports both full domain path updating and single property updates mapping to legacy keys for maximum code-base stability:

- Updating a full category object (e.g. `updateState('living', { haushaltEssen: 12000 })`) automatically maps to the nested `clientBaseline.living` structure.
- Array properties (like `salaryStreams` or `capExEvents`) are correctly handled as arrays rather than merged objects.
