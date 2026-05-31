/**
 * Type definitions for the config-driven deduction engine
 */

/**
 * Internal field identifiers (from TaxInput.deductions)
 */
export type InternalDeductionField =
    | 'transport'
    | 'meal'
    | 'professional'
    | 'debtInterest'
    | 'maintenance'
    | 'pillar3a'
    | 'pillar2Buyin'
    | 'insurance'
    | 'childcare'
    | 'alimony'
    | 'donations'
    | 'wealthManagement'
    | 'others'
    // Social/status-based deductions
    | 'childDeduction'
    | 'marriedDeduction'
    | 'dualIncomeDeduction'
    | 'singleParentDeduction'
    | 'singlePersonDeduction'
    | 'retiredDeduction'
    | 'educationCosts'
    | 'imputedRentDeduction'
    | 'rentalDeduction'
    | 'healthInsurance'
    | 'selfCareChildcare'
    | 'modestIncomeRelief'
    // Meta/reference values (not applied as deductions)
    | 'threshold'
    | 'factor'
    | 'reference'
    | 'skip';

/**
 * Scope of application
 */
export type DeductionScope =
    | 'per_person'      // Applied per taxpayer
    | 'per_household'   // Applied once for the tax unit
    | 'per_child'       // Applied per eligible child
    | 'per_child_age'   // Applied per child, varies by age
    | 'conditional';    // Requires eligibility check

/**
 * Logic strategy identifier
 */
export type DeductionLogic =
    | 'StandardCap'      // min/max capping, use 'max' field
    | 'FixedAmount'      // Flat amount from 'amount' field
    | 'PercentageCalc'   // Calculate percent of basis (income)
    | 'PercentWithCap'   // Percentage with min/max bounds
    | 'AgeBasedChild'    // Child deduction with age tiers
    | 'ConditionalFlag'  // Applied if condition met
    | 'Threshold'        // Defines income threshold (not a deduction)
    | 'Reference'        // Reference value (not applied directly)
    | 'Skip';            // Explicitly ignored

/**
 * Eligibility condition for conditional deductions
 */
export type EligibilityCondition =
    | 'always'
    | 'if_married'
    | 'if_single'
    | 'if_has_children'
    | 'if_dual_income'
    | 'if_single_parent'
    | 'if_retired'
    | 'if_has_pillar2'
    | 'if_no_pillar2'
    | 'if_has_pillar3a'
    | 'if_property_new'
    | 'if_property_old'
    | 'if_property_rented'
    | 'if_over_65'
    | 'if_child_minor'
    | 'if_child_adult'
    | 'if_child_in_education';

/**
 * Complete mapping entry
 */
export interface DeductionMapping {
    field: InternalDeductionField;
    logic: DeductionLogic;
    scope: DeductionScope;
    eligibility?: EligibilityCondition;
    description?: string; // English translation/explanation
}
