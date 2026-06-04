export const TaxTariff = {
  Single: 'A',
  Married: 'C',
} as const;
export type TaxTariff = typeof TaxTariff[keyof typeof TaxTariff];

export const Canton = {
  AG: 'AG', AI: 'AI', AR: 'AR', BE: 'BE', BL: 'BL', BS: 'BS', FR: 'FR', GE: 'GE', GL: 'GL',
  GR: 'GR', JU: 'JU', LU: 'LU', NE: 'NE', NW: 'NW', OW: 'OW', SG: 'SG', SH: 'SH', SO: 'SO',
  SZ: 'SZ', TG: 'TG', TI: 'TI', UR: 'UR', VD: 'VD', VS: 'VS', ZG: 'ZG', ZH: 'ZH'
} as const;
export type Canton = typeof Canton[keyof typeof Canton];

export const EducationStatus = {
  Obligatory: 'obligatory',
  PostObligatory: 'post_obligatory' // Apprenticeship / Studies
} as const;
export type EducationStatus = typeof EducationStatus[keyof typeof EducationStatus];

export const ParentalCustody = {
  Sole: 'sole',
  Joint: 'joint'
} as const;
export type ParentalCustody = typeof ParentalCustody[keyof typeof ParentalCustody];

export const EmploymentStatus = {
  Employed: 'employed',
  SelfEmployed: 'self_employed',
  NonActive: 'non_active'
} as const;
export type EmploymentStatus = typeof EmploymentStatus[keyof typeof EmploymentStatus];

// --- Inputs ---

export interface CustomItem {
  id: string;
  label: string;
  amount: number;
}

// Deprecated: SalaryAssumptions (replaced by IncomeSegment)
// export interface SalaryAssumptions { ... }

export interface SalaryDeductions {
  ahvIvEo: number; // AHV (5.3% AN)
  alv: number; // ALV (1.1%)
  nbuv: number; // NBUV
  ktg: number; // KTG
}

export interface PensionRiskBenefits {
  // Lump Sums
  deathCapitalPercent: number; // e.g., 200%

  // Pensions
  disabilityPensionPercent: number; // e.g., 60%
  spousePensionPercent: number;     // e.g., 40%
  childPensionPercent: number;      // e.g., 8%

  // Waiting Periods
  disabilityWaitingPeriodMonths: number;

  // Funding (Cost)
  riskPremiumPercent: number; // Total cost (e.g. 2.5% of insured salary)
  employeeRiskShare: number;  // % of the premium paid by employee (e.g. 50%)

  // New: Separate Coordination for Risk
  coordinationDeduction?: number;
}

export interface PensionConfig {
  coordinationDeduction: number; // Standard/Savings Coordination
  interestRate: number; // Verzinsung
  savingsRates: { // Sparbeitrag
    age25_34: number;
    age35_44: number;
    age45_54: number;
    age55_65: number;
  };
  riskContribution: number; // Risikobeitrag (%)
  employerContributionPercent: number; // New: Employer Split (e.g. 50, 60)
  employeeContributionPercent: number; // New: Employee Split (e.g. 50, 40)

  riskBenefits?: PensionRiskBenefits; // Detailed Risk Parameters
}

export interface Pillar2Details {
  insuredSalary: number; // Versicherter Lohn

  // Breakdown (Optional overrides from Certificate)
  employeeSavingsAmount?: number; // Arbeitnehmer Sparbeitrag (CHF)
  employeeRiskAmount?: number;    // Arbeitnehmer Risikobeitrag (CHF)
  employerSavingsAmount?: number; // Arbeitgeber Sparbeitrag (CHF)
  employerRiskAmount?: number;    // Arbeitgeber Risikobeitrag (CHF)

  // Legacy/Computed fallbacks if user enters totals only?
  // We'll prioritize the 4 above.
  employeeContributionYearly: number; // Total AN (Legacy compat / Validation sum)
  employerContributionYearly: number; // Total AG (Legacy compat / Validation sum)

  planType: 'BVG_MINIMUM' | 'OVERRIDE_CERTIFICATE'; // Strategy for projection
  conversionRate?: number;
}

// New Income Structure
export interface WorkExpense {
  commuteType: 'public_transport' | 'private_vehicle'; // New
  publicTransportCost: number; // New
  commutingDistance: number; // km
  workDays: number; // default 220
  mealType: 'none' | 'canteen' | 'restaurant';
  officeDays?: string[]; // e.g. ['monday', 'tuesday']
}

export interface IncomeSegment {
  id: string;
  name: string; // e.g., "Job A", "Side Hustle"
  type: 'employment' | 'side_hustle' | 'other';
  startYear: number;
  startMonth?: number; // 0-11
  startDay?: number; // 1-31 (Default 1)
  endYear: number | null; // null = ongoing
  endMonth?: number | null; // 0-11
  endDay?: number; // 1-31 (Default last day of month)
  grossSalaryFullTime: number; // 100% basis
  occupationPercent: number; // e.g., 80
  growthRate: number; // %

  // New: Bonus
  bonusAmount?: number;
  bonusMonth?: number; // 1-12
  bonusPensionDeduction?: boolean; // Deduct pension from bonus?

  // New: PK per Job
  pension?: PensionConfig; // Legacy/Auto config (rates)
  pensionDetails?: Pillar2Details; // New: Explicit amounts from Certificate

  insuredSalaryBasisOverride?: number; // Custom Basis for Savings (pre-coordination)
  riskInsuredSalaryBasisOverride?: number; // Custom Basis for Risk (pre-coordination)


  // New: Social Deduction Overrides per Job
  customDeductions?: SalaryDeductions;

  // Work Expenses (Berufsauslagen)
  workExpenses?: WorkExpense;

  // Specific overrides for this segment
  deductionProfile?: 'standard' | 'self_employed' | 'none';

  // Exclusions (Opt-out)
  excludeSocial?: boolean; // No AHV/ALV/NBUV/KTG
  excludeTax?: boolean;    // Exclude from Taxable Income
  excludePensionSavings?: boolean; // Exclude from PK Savings (override pension config?)
  excludePensionRisk?: boolean;    // Exclude from PK Risk
}

// New Expense Structure
export type BudgetCategory =
  | 'housing'
  | 'food_household'
  | 'mobility'
  | 'insurance'
  | 'lifestyle'
  | 'health'
  | 'savings'
  | 'other';

export interface ExpenseSegment {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  ownerId: string; // memberId or 'shared'
  isShared?: boolean; // New: If personal, treat as shared in analysis

  // Classification
  type: 'living' | 'tax_deduction' | 'both' | 'saving';

  // Guided Budgeting Category
  category?: BudgetCategory;

  // If it is a tax deduction, where does it go?
  taxDeductionCategory?:
  | 'transport' // 10.1
  | 'meal' // 10.2
  | 'professional' // 10.3
  | 'debt_interest' // 11
  | 'alimony' // 12
  | 'childcare' // 15.0
  | 'donations' // 15.2/15.3
  | 'education' // 15.5
  | 'medical' // 17
  | 'pillar_3a' // 13 (New)
  | 'other'; // 15.6

  // Detailed Tax Params (for calculated deductions)
  taxDetails?: {
    workDays?: number;
    distance?: number; // km
    commuteType?: 'public_transport' | 'private_vehicle';
    mealType?: 'none' | 'canteen' | 'restaurant';
  };
}

export interface RealEstateAsset {
  id: string;
  name: string;
  ownerId: string; // 'shared' or memberId
  marketValue: number;
  mortgageAmount: number; // Total Debt
  equityFromPillar2: number; // For Hard LTV check (10% hard equity rule)
  purchaseYear: number;
  purchaseMonth?: number; // 1-12 (Default 1)
  isPrimaryResidence: boolean;

  // New: Detailed Mortgage Config
  mortgageAssumptions?: FinancingAssumptions;
  equitySources?: EquitySource[];

  // Tax
  taxValue?: number; // Steuerwert
}

export interface PersonProfile {
  id: string;
  name: string;
  isChild?: boolean;
  confession?: 'reformiert' | 'katholisch' | 'keine';
  birthDate: string; // YYYY-MM-DD
  retirementAge: number;

  // Replaced Salary with Timeline
  careerTimeline: IncomeSegment[];

  deductions: SalaryDeductions; // Social deduction rates (AHV/ALV etc.) - Default for person
  // pension: PensionConfig; // MOVED to IncomeSegment

  // --- Family Allowance Fields (FamZG 2025) ---
  educationStatus?: EducationStatus; // For children
  residenceCanton?: Canton; // For children & parents
  workCanton?: Canton; // For parents
  employmentStatus?: EmploymentStatus; // For parents
  custody?: ParentalCustody; // For parents
  livesWithChild?: boolean; // For parents
  grossIncomeAHV?: number; // Override for priority check (if different from calc)


  // Kept for configuration of non-monetary tax factors (Legacy / Fallback)
  // Logic moving to ExpenseSegment.taxDetails
  taxAssumptions: {
    // Deductions
    debtInterest: number;
    alimonyPaid: number;
    childcareCost: number; // Fremdbetreuung

    // Other settings
    ahvContributions: number; // For non-employed
    politicalDonations: number;
    charitableDonations: number;
    wealthManagementCosts: number;

    // Dual Income Deduction Override? (Usually auto-calculated)
    dualIncomeDeduction?: number;
  };

  initialWealth: {
    referenceYear: number; // Added: As of when?
    cash: number;
    pension: number;
    pillar3a: number;
    securities?: number;
  };
}

export interface ChildConfig {
  count: number;
  startYear: number;
  monthSpacing: number;
}

export interface AppState {
  currentScenarioId?: string | null; // ID of the currently loaded/saved scenario
  currentScenarioName?: string | null; // Name of the currently loaded/saved scenario
  autoSaveEnabled?: boolean; // Toggle for auto-save

  currentYear: number;
  members: PersonProfile[];

  // New Unified Expenses List
  expenses: ExpenseSegment[];

  // Real Estate
  realEstate: RealEstateAsset[];

  // Legacy Shared Costs (to be migrated/removed)
  // sharedCosts: SharedCosts;

  children: ChildConfig;
  macro: GlobalAssumptions;
  marriageYear: number | null;
  marriageOverrides?: Record<number, 'married' | 'single'>;
  civilStatus: 'single' | 'married' | 'concubinage';
}

// --- Reporting ---

export interface CalculationStep {
  label: string;
  value: number;
  note?: string;
}

export interface TaxItem {
  label: string;
  amount: number;
  trace?: CalculationStep[];
}

export interface SocialBreakdown {
  ahv: number;
  alv: number;
  nbuv: number;
  ktg: number;
}

export interface TaxBreakdown {
  grossIncome: number;
  grossEmploymentIncome: number; // For reconciliation (Bruttolohn)
  socialDeductions: number;
  socialBreakdown?: SocialBreakdown; // New
  pensionContributions: number; // For reconciliation
  netIncome: number;
  incomeEmployed: number;
  incomeSelfEmployed: number;
  incomeInsurance: number;
  incomeSecurities: number;
  incomeOther: number;
  incomeRealEstate: number;
  totalIncome: number;

  totalDeductions: number;
  deductionItems: TaxItem[];
  taxableIncome: number;

  netWealth: number;
  wealthTaxAllowance: number;
  taxableWealth: number;

  simpleTaxIncome: number;
  simpleTaxWealth: number;
  simpleTax100Percent: number;

  cantonTax: number;
  communeTax: number;
  churchTax: number;
  federalTax: number;
  fireTax: number;
  surcharge: number;
  totalTax: number;
  incomeNetOfTax: number; // New: Netto verfügbares Einkommen (Cash Net - Tax)

  ownerName: string;
  // Detailed Deduction Fields (Top Level for Reporting)
  deductionCommute?: number;
  deductionMeal?: number;
  deductionProfessional?: number;
  deductionPillar3a?: number;
  deductionInsurance?: number;
  deductionDual?: number;
  deductionChild?: number;
  deductionOther?: number;
  deductionDebtInterest?: number;
  deductionDonations?: number;
  deductionChildcare?: number;
  deductionAlimony?: number;
  deductionWealthManagement?: number;

  memberBreakdown?: Record<string, {
    grossIncome: number;
    grossEmploymentIncome: number;
    socialDeductions: number;
    socialBreakdown?: SocialBreakdown; // New
    pensionContributions: number;
    incomeEmployed: number;
    incomeSelfEmployed: number;
    incomeSecurities: number;
    incomeRealEstate: number;
    incomeOther: number;
    totalIncome: number;
    taxableIncome: number;
    taxableWealth: number;

    // Deductions Breakdown
    deductionCommute: number;
    deductionMeal: number;
    deductionProfessional: number;
    deductionPillar3a: number;
    deductionInsurance: number;
    deductionDual: number;
    deductionChild: number;
    deductionDebtInterest: number;
    deductionChildcare: number;
    deductionAlimony: number;
    deductionDonations: number;
    deductionOther: number; // Remaining
    totalDeductions: number; // Total per member
    incomeNetOfTax: number; // New
  }>;
  traces: Record<string, CalculationStep[]>;
  valid?: boolean;
  errorMessage?: string;
}

export interface TaxInput {
  taxableIncomeBase: number;
  taxableWealthBase: number;
  grossIncomeTotal: number;
  socialDeductionsTotal: number;
  deductions: {
    transport: number;
    meal: number;
    professional: number;
    debtInterest: number;
    maintenance: number;
    pillar3a: number;
    pillar2Buyin: number;
    insurance: number;
    childcare: number;
    alimony: number;
    donations: number;
    wealthManagement: number;
    others: number;
  };
  earnedIncomes: number[];
  memberDeductions: Record<string, TaxInput['deductions']>;
  members: {
    name: string;
    gross: number;
    social: number;
    socialBreakdown: SocialBreakdown;
    pension: number;
    pensionTotal: number;
    net: number;
    isChild: boolean;
    confession?: 'reformiert' | 'katholisch' | 'keine';
  }[];
  imputedRent: number;
  meta: {
    canton: string;
    maritalStatus: 'single' | 'married' | 'concubinage';
    childCount: number;
    childAges: number[];
    confession: 'reformiert' | 'katholisch' | 'keine';
    cantonMultiplier?: number;
    municipalityMultiplier: number;
    churchMultiplier: number;
    /** Per-confession multipliers for mixed-confession church tax splitting */
    churchMultiplierRef?: number;
    churchMultiplierRom?: number;
  };
}

export interface IncomeStatement {
  revenue: {
    grossSalary: number;
    bonus: number;
    childAllowance: number;
    total: number;
  };
  expenses: {
    socialDeductions: number;
    tax: number;
    taxDetails?: TaxBreakdown[];
    sharedLiving: number;
    sharedLivingBreakdown?: { label: string; amount: number }[];
    personal: number;
    personalBreakdown?: { label: string; amount: number }[];
    children: number;
    childrenCostBreakdown?: { label: string; amount: number }[];
    total: number;
  };
  netSavings: number;
}

export interface BalanceSheet {
  assets: {
    cash: number;
    pension: number;
    pillar3a: number;
    realEstate: number;
    total: number;
  };
  liabilities: {
    mortgage: number;
    total: number;
  };
  equity: number;
}

export interface CashFlowStatement {
  operating: number;
  investing: number;
  financing: number;
  netChange: number;
}

export interface AssetFlow {
  label: string;
  start: number;
  contributions: number; // inflows, savings, salary credits
  returns: number;       // interest, capital gains
  interest?: number;     // Explicit tracking if needed (e.g. mortgage interest)
  withdrawals: number;   // outflows, taxes, purchases
  end: number;
}

export interface AssetFlows {
  cash: AssetFlow;
  pension: AssetFlow;
  pillar3a: AssetFlow;
  realEstate: AssetFlow;
  mortgage: AssetFlow;
}

export interface YearlyReport {
  year: number;
  age: number;
  label: string;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  assetFlows: AssetFlows; // New field
  cashFlow: CashFlowStatement;
  months: IncomeStatement[];

  riskAnalysis?: RiskAnalysisReport;
}

export interface RiskAnalysisReport {
  potentialDeathCapital: number;    // Lump sum
  potentialDeathPension: number;    // Annual spouse pension
  potentialDisabilityPension: number; // Annual disability pension
  insuredRiskSalary: number;        // The base used
}

export interface ProjectionResult {
  total: YearlyReport[];
  members: Record<string, YearlyReport[]>;
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

export interface ScenarioOverrides {
  pensionskasseMarkus: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
    totalCapital: number;
    renteSplit: number;
    umwandlungssatz: number;
  };
  pensionskasseMonique: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
    totalCapital: number;
    renteSplit: number;
    umwandlungssatz: number;
  };
  capExEvents: any[];
  taxDeductions: Record<string, any>;
  survivor?: {
    deceasedPartner: 'Keiner' | 'Markus' | 'Monique';
    deathYear: number;
    expenseReductionFactor: number;
    pkSurvivorRate: number;
  };
}

export interface PlanningState {
  globalAssumptions: GlobalAssumptions;
  clientBaseline: ClientBaseline;
  scenarioOverrides: ScenarioOverrides;
}


export interface YearlyAssumption {
  year: number;
  salaryGrowth: number;
  inflationAdjustment: number;
  extraExpenses: number;
}

// --- Mortgage & Equity Types ---

export type AmortizationStrategy = 'standard_linear_2nd_rank' | 'akb_hard_1pct_cutoff';

export type EquitySourceType = 'cash' | 'pillar_3a' | 'pension_fund' | 'gift_inheritance';
export type EquityUseMode = 'payout' | 'pledge'; // Payout reduces loan, Pledge keeps loan high but acts as collateral

export interface EquitySource {
  id: string;
  type: EquitySourceType;
  ownerId?: string; // Reference to member
  amount: number;
  mode?: EquityUseMode; // Only for 3a/PK
}

export interface MortgageProduct {
  id: string;
  name: string; // e.g. "Festhypothek 10J"
  amount: number;
  interestRate: number; // e.g. 0.015 (1.5%)
  duration: number; // Years, e.g. 10
  startDate: number; // 0 = purchase year, 5 = 5 years after
  type: 'fixed' | 'saron' | 'variable';
}

export interface FinancingAssumptions {
  imputedInterestRate: number;       // Default 5.0% (for Tragbarkeit only)
  maintenanceCostRate: number; // e.g. 0.01 (1%)
  pledgedAssetsReturnRate?: number; // e.g. 0.04 (4%) - Income from Pledged Assets
  amortizationStrategy: AmortizationStrategy;

  // Detailed Financing
  mortgageProducts?: MortgageProduct[];
  marketRefinanceRate?: number; // Default 2.5% for future refinancing
}


export interface MonthlyFinancials {
  month: number;
  gross: number;
  net: number;
  social: number;
  socialBreakdown: { ahv: number; alv: number; nbuv: number; ktg: number };
  pensionEmp: number;
  pensionEmpSave: number;
  pensionEmpRisk: number;
  pensionEmplr: number;
  pensionEmplrSave: number;
  pensionEmplrRisk: number;
  bonus: number;
  sources: string[];
  taxableIncome: number;
  customIncome: number;
  workExpenses: {
    transport: number;
    meal: number;
    professional: number;
  };
}

export interface AnnualFinancials {
  gross: number;
  net: number;
  social: number;
  socialBreakdown: { ahv: number; alv: number; nbuv: number; ktg: number };
  pensionEmp: number;
  pensionEmpSave: number;
  pensionEmplr: number;
  pensionEmplrSave: number;
  pensionRiskEmp: number;
  bonus: number;
  workExpenses: WorkExpense[];
  customIncome: number;
  taxDeductions: {
    transport: number;
    meal: number;
    professional: number;
    social: number;
    pillar2Buyin: number;
  };
  monthly: MonthlyFinancials[];
}

export interface WorkExpenseBreakdown {
  [sourceName: string]: {
    transport: number;
    meal: number;
    professional: number;
  };
}
