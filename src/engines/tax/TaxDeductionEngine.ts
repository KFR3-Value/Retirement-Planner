/**
 * Config-driven Tax Deduction Engine
 * 
 * Iterates through JSON keys (source-driven), looks up mappings,
 * executes handlers, and warns on unmapped keys.
 */
import type { DeductionsData } from './deduction.schema';
import { TAX_DEDUCTION_MAPPING } from './deduction.mapping';
import { HANDLERS } from './deduction.handlers';
import type { HandlerContext } from './deduction.handlers';
import type { InternalDeductionField, DeductionScope, EligibilityCondition } from './deduction.types';

export interface EngineInput {
    canton: string;
    deductionsData: DeductionsData;
    income: number;
    status: 'single' | 'married' | 'concubinage';
    childAges: number[];
    hasPillar2: boolean;
    hasPillar3a: boolean;
    isRetired: boolean;
    isOver65?: boolean;
    isSingleParent?: boolean;
    isDualIncome?: boolean;
    hasProperty?: boolean;
    propertyAgeYears?: number;
    isPropertyRented?: boolean;
    expenses: Partial<Record<InternalDeductionField, number>>; // User input values
}

export interface AppliedRule {
    key: string;
    field: InternalDeductionField;
    rawValue: number;
    appliedValue: number;
    scope: DeductionScope;
}

export interface EngineResult {
    /** Aggregated deductions by field */
    deductions: Record<InternalDeductionField, number>;
    /** Keys in JSON without mapping */
    unmappedKeys: string[];
    /** Detailed log of applied rules */
    appliedRules: AppliedRule[];
    /** Threshold values (for eligibility checks) */
    thresholds: Record<string, number>;
    /** Reference values (for information) */
    references: Record<string, number>;
}

// Initialize empty result with all fields
const createEmptyDeductions = (): Record<InternalDeductionField, number> => ({
    transport: 0,
    meal: 0,
    professional: 0,
    debtInterest: 0,
    maintenance: 0,
    pillar3a: 0,
    pillar2Buyin: 0,
    insurance: 0,
    childcare: 0,
    alimony: 0,
    donations: 0,
    wealthManagement: 0,
    others: 0,
    childDeduction: 0,
    marriedDeduction: 0,
    dualIncomeDeduction: 0,
    singleParentDeduction: 0,
    singlePersonDeduction: 0,
    retiredDeduction: 0,
    educationCosts: 0,
    imputedRentDeduction: 0,
    rentalDeduction: 0,
    healthInsurance: 0,
    selfCareChildcare: 0,
    modestIncomeRelief: 0,
    threshold: 0,
    factor: 0,
    reference: 0,
    skip: 0,
});

export class TaxDeductionEngine {
    /**
     * Process canton deductions, driven by JSON keys
     */
    calculate(input: EngineInput): EngineResult {
        const cantonData = input.deductionsData[input.canton];
        if (!cantonData) {
            throw new Error(`Canton ${input.canton} not found in deductions data`);
        }

        const result = createEmptyDeductions();
        const unmappedKeys: string[] = [];
        const appliedRules: AppliedRule[] = [];
        const thresholds: Record<string, number> = {};
        const references: Record<string, number> = {};

        // Context for handlers
        const ctx: HandlerContext = {
            income: input.income,
            status: input.status,
            childCount: input.childAges.length,
            childAges: input.childAges,
            hasPillar2: input.hasPillar2,
            hasPillar3a: input.hasPillar3a,
            isRetired: input.isRetired,
            inputValue: 0, // Set per rule
        };

        // Iterate through JSON rules (source-driven)
        for (const rule of cantonData.Einkommen) {
            const mapping = TAX_DEDUCTION_MAPPING[rule.name];

            if (!mapping) {
                // CRUCIAL: Unmapped key detected!
                unmappedKeys.push(rule.name);
                console.warn(`[TaxDeductionEngine] ⚠️ Unmapped key: "${rule.name}" in canton ${input.canton}`);
                continue;
            }

            // Check eligibility
            if (!this.checkEligibility(mapping.eligibility, input)) {
                continue;
            }

            // Get handler
            const handler = HANDLERS[mapping.logic];
            if (!handler) {
                console.warn(`[TaxDeductionEngine] Unknown logic: ${mapping.logic}`);
                continue;
            }

            // Set input value based on field
            ctx.inputValue = input.expenses[mapping.field] || 0;

            // Execute handler
            const rawValue = handler(rule, ctx);

            // Handle special types
            if (mapping.logic === 'Threshold') {
                thresholds[rule.name] = rawValue;
                continue;
            }
            if (mapping.logic === 'Reference' || mapping.field === 'reference' || mapping.field === 'factor') {
                references[rule.name] = rule.amount || rule.percent || rule.max || 0;
                continue;
            }
            if (mapping.logic === 'Skip' || mapping.field === 'skip') {
                continue;
            }

            // Calculate applied value based on scope
            let appliedValue = rawValue;
            if (mapping.scope === 'per_child') {
                appliedValue = rawValue * input.childAges.length;
            }
            // per_child_age is already handled by knowing which age tier applies

            // Aggregate
            result[mapping.field] = (result[mapping.field] || 0) + appliedValue;

            appliedRules.push({
                key: rule.name,
                field: mapping.field,
                rawValue,
                appliedValue,
                scope: mapping.scope,
            });
        }

        // Log unmapped keys loudly
        if (unmappedKeys.length > 0) {
            console.error(`[TaxDeductionEngine] ❌ ${unmappedKeys.length} unmapped keys detected for ${input.canton}!`);
            console.error('Unmapped keys:', unmappedKeys);
        }

        return {
            deductions: result,
            unmappedKeys,
            appliedRules,
            thresholds,
            references,
        };
    }

    /**
     * Check if a deduction rule is eligible based on conditions
     */
    private checkEligibility(
        condition: EligibilityCondition | undefined,
        input: EngineInput
    ): boolean {
        if (!condition || condition === 'always') return true;

        switch (condition) {
            case 'if_married':
                return input.status === 'married';
            case 'if_single':
                return input.status === 'single' || input.status === 'concubinage';
            case 'if_has_children':
                return input.childAges.length > 0;
            case 'if_dual_income':
                return input.isDualIncome !== false && input.status === 'married';
            case 'if_single_parent':
                return input.isSingleParent === true;
            case 'if_retired':
                return input.isRetired === true;
            case 'if_over_65':
                return input.isOver65 === true;
            case 'if_has_pillar2':
                return input.hasPillar2 === true;
            case 'if_no_pillar2':
                return input.hasPillar2 === false;
            case 'if_has_pillar3a':
                return input.hasPillar3a === true;
            case 'if_property_new':
                return input.hasProperty === true && (input.propertyAgeYears ?? 0) <= 10;
            case 'if_property_old':
                return input.hasProperty === true && (input.propertyAgeYears ?? 0) > 10;
            case 'if_property_rented':
                return input.isPropertyRented === true;
            case 'if_child_minor':
                return input.childAges.some(age => age < 18);
            case 'if_child_adult':
                return input.childAges.some(age => age >= 18);
            case 'if_child_in_education':
                return input.childAges.some(age => age >= 18); // Simplified, assumes adult = in education
            default:
                return true;
        }
    }

    /**
     * Get deduction value for a specific German key from canton data
     */
    getDeductionValue(
        canton: string,
        deductionsData: DeductionsData,
        key: string,
        type: 'amount' | 'max' | 'percent' | 'min' = 'max'
    ): number {
        const cantonData = deductionsData[canton];
        if (!cantonData) return 0;

        const rule = cantonData.Einkommen.find(r => r.name === key);
        if (!rule) return 0;

        return rule[type] || 0;
    }
}

// Export singleton for convenience
export const taxDeductionEngine = new TaxDeductionEngine();
