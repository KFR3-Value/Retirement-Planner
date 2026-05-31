/**
 * Statutory Federal Tax Tariffs 2025
 * Source: Federal Tax Administration (ESTV)
 */

export interface TaxBracket {
    limit: number;
    rate: number;
}

/**
 * Federal Direct Tax - Tariff A (Single)
 */
export const FEDERAL_TARIFF_A: TaxBracket[] = [
    { limit: 14800, rate: 0 },
    { limit: 17400, rate: 0.0077 },
    { limit: 26600, rate: 0.0088 },
    { limit: 41900, rate: 0.0264 },
    { limit: 56900, rate: 0.0297 },
    { limit: 77000, rate: 0.0594 },
    { limit: 106300, rate: 0.0660 },
    { limit: 137400, rate: 0.0880 },
    { limit: 178900, rate: 0.1100 },
    { limit: 769500, rate: 0.1320 },
    { limit: Number.MAX_SAFE_INTEGER, rate: 0.115 }
];

/**
 * Federal Direct Tax - Tariff B (Married)
 */
export const FEDERAL_TARIFF_B: TaxBracket[] = [
    { limit: 28800, rate: 0 },
    { limit: 22600, rate: 0.01 },
    { limit: 5500, rate: 0.02 },
    { limit: 15400, rate: 0.03 },
    { limit: 17000, rate: 0.04 },
    { limit: 15400, rate: 0.05 },
    { limit: 13800, rate: 0.06 },
    { limit: 12000, rate: 0.07 },
    { limit: 11400, rate: 0.08 },
    { limit: 10600, rate: 0.09 },
    { limit: 10000, rate: 0.10 },
    { limit: 9800, rate: 0.11 },
    { limit: 9200, rate: 0.12 },
    { limit: 730000, rate: 0.13 },
    { limit: Number.MAX_SAFE_INTEGER, rate: 0.115 }
];

// Deduction Limits
export const FED_MAX_DEDUCTION_TRANSPORT = 3200;
export const FED_MAX_DEDUCTION_MEAL = 3200;
export const FED_MAX_DEDUCTION_CHILD = 6700;
export const FED_MAX_DEDUCTION_CHILDCARE = 25000;
export const FED_INSURANCE_CAP_SINGLE_BASE = 1800;
export const FED_INSURANCE_CAP_MARRIED_BASE = 3700;
export const FED_INSURANCE_CAP_CHILD_ADDON = 700;
export const FED_DUAL_INCOME_MIN = 8500;
export const FED_DUAL_INCOME_MAX = 13900;
export const FED_DUAL_INCOME_RATE = 0.5;
