/**
 * Stateless deduction handler functions (Logic Registry)
 */
import type { DeductionRule } from './deduction.schema';

export interface HandlerContext {
    income: number;
    status: 'single' | 'married' | 'concubinage';
    childCount: number;
    childAges: number[];
    hasPillar2: boolean;
    hasPillar3a: boolean;
    isRetired: boolean;
    inputValue: number; // User's expense value for this category
}

export type DeductionHandler = (
    rule: DeductionRule,
    ctx: HandlerContext
) => number;

/**
 * Standard capping: returns min(inputValue, rule.max) or rule.max if no input
 * If max is 0 and amount is set, uses amount as-is
 */
export const StandardCap: DeductionHandler = (rule, ctx) => {
    if (rule.max > 0) {
        return Math.min(ctx.inputValue, rule.max);
    }
    // If no max defined, just return input value (unlimited)
    return ctx.inputValue;
};

/**
 * Fixed amount: returns rule.amount directly
 */
export const FixedAmount: DeductionHandler = (rule, _ctx) => {
    return rule.amount || 0;
};

/**
 * Percentage of income with optional min/max bounds
 */
export const PercentWithCap: DeductionHandler = (rule, ctx) => {
    // Note: percent in JSON can be stored as whole numbers (e.g., 20 for 20%)
    // or as decimals (e.g., 0.3 for 0.3%). We check the magnitude.
    const pct = rule.percent > 1 ? rule.percent / 100 : rule.percent;
    const calculated = ctx.income * pct;
    let result = calculated;
    if (rule.min > 0) result = Math.max(result, rule.min);
    if (rule.max > 0) result = Math.min(result, rule.max);
    return result;
};

/**
 * Age-based child deduction (returns per-child amount from rule)
 */
export const AgeBasedChild: DeductionHandler = (rule, _ctx) => {
    return rule.amount || 0;
};

/**
 * Skip: returns 0 (used for reference values, thresholds)
 */
export const Skip: DeductionHandler = () => 0;

/**
 * Threshold: returns the amount as threshold value (for eligibility checks)
 */
export const ThresholdHandler: DeductionHandler = (rule, _ctx) => {
    return rule.amount || 0;
};

/**
 * Handler registry - maps logic type names to handler functions
 */
export const HANDLERS: Record<string, DeductionHandler> = {
    StandardCap,
    FixedAmount,
    PercentWithCap,
    PercentageCalc: PercentWithCap, // Alias
    AgeBasedChild,
    ConditionalFlag: FixedAmount,   // Same logic, different semantic
    Threshold: ThresholdHandler,
    Reference: Skip,
    Skip,
};
