/**
 * Zod schemas for validating deductions.json structure
 */
import { z } from 'zod';

// Schema for individual deduction rule from JSON
export const DeductionRuleSchema = z.object({
    name: z.string(),
    amount: z.number().default(0),
    percent: z.number().default(0),
    min: z.number().default(0),
    max: z.number().default(0),
});

// Schema for canton deductions
export const CantonDeductionsSchema = z.object({
    Einkommen: z.array(DeductionRuleSchema),
});

// Full deductions.json schema
export const DeductionsDataSchema = z.record(z.string(), CantonDeductionsSchema);

// Inferred types
export type DeductionRule = z.infer<typeof DeductionRuleSchema>;
export type CantonDeductions = z.infer<typeof CantonDeductionsSchema>;
export type DeductionsData = z.infer<typeof DeductionsDataSchema>;
