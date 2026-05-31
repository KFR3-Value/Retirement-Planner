/**
 * Tax Calculation Engine - Strategy Pattern
 */

export type CivilStatus = 'single' | 'married' | 'concubinage';
export type Confession = 'reformiert' | 'katholisch' | 'keine';

export interface TaxBracket {
    limit: number;
    rate: number;
}

export interface TaxResult {
    cantonTax: number;
    communeTax: number;
    churchTax: number;
    federalTax: number;
    totalTax: number;
    taxableIncome: number;
    taxableWealth: number;
}

export interface ExpenseProfile {
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
}

export interface DeductionResult {
    canton: number;
    federal: number;
    items: Record<string, { canton: number; federal: number }>;
    memberItems?: Record<string, { canton: number; federal: number }>[]; // Capped values per member (in order of input)
}

/**
 * Strategy interface for region/year specific tax logic.
 */
export interface TaxStrategy {
    name: string;
    year: number;
    region: string;

    /**
     * Calculates the deductions based on the engine's rules.
     */
    calculateDeductions(
        income: number,
        status: CivilStatus,
        childAges: number[],
        memberExpenses: ExpenseProfile[],
        earnedIncomes: number[]
    ): DeductionResult;

    /**
     * Calculates the simple tax (100% basis) for canton and federal.
     */
    calculateSimpleTax(
        taxableIncomeCanton: number,
        taxableIncomeFederal: number,
        taxableWealth: number,
        status: CivilStatus
    ): { simpleIncomeCanton: number; simpleWealthCanton: number; federalTax: number };

    /**
     * Applies multipliers for canton, commune, and church.
     */
    applyMultipliers(
        simpleIncome: number,
        simpleWealth: number,
        multipliers: { canton: number; commune: number; church: number }
    ): { cantonTax: number; communeTax: number; churchTax: number };
}
