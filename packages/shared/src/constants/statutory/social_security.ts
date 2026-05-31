/**
 * Statutory Social Security Rates 2025
 * Source: Federal Social Insurance Office (BSV)
 */

export const AHV_IV_EO_RATE_EMPLOYEE = 5.3; // 5.3%
export const ALV_RATE_EMPLOYEE = 1.1; // 1.1% on income up to 148,200
export const ALV_UPPER_LIMIT = 148200;

/**
 * Self-Employed AHV/IV/EO Sliding Scale (SVA)
 * Source: SVA Aargau / BSV 2025
 * For annual incomes between Lower and Upper Limit, a reduced rate applies.
 */
export const SVA_LOWER_LIMIT = 9800;
export const SVA_UPPER_LIMIT = 58800;
export const SVA_MIN_CONTRIBUTION = 514; // Minimum annual contribution if income < SVA_LOWER_LIMIT

export const SVA_LOWER_RATE = 0.05371; // 5.371% at SVA_LOWER_LIMIT
export const SVA_UPPER_RATE = 0.0965;  // 9.650% at SVA_UPPER_LIMIT
