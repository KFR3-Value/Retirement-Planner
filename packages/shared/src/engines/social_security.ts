import {
    AHV_IV_EO_RATE_EMPLOYEE,
    ALV_RATE_EMPLOYEE,
    ALV_UPPER_LIMIT,
    SVA_LOWER_LIMIT,
    SVA_UPPER_LIMIT,
    SVA_LOWER_RATE,
    SVA_UPPER_RATE,
    SVA_MIN_CONTRIBUTION
} from '../constants/statutory/social_security';

export interface SocialDeductions {
    ahv: number;
    alv: number;
    nbuv: number;
    ktg: number;
    total: number;
}

/**
 * Calculates social security deductions for an employee.
 * @param gross Annual gross income
 * @param age Current age
 * @param isRetired Whether the person is over retirement age
 */
export function calculateEmployeeSocialDeductions(
    gross: number,
    _age: number,
    isRetired: boolean = false
): SocialDeductions {
    // AHV/IV/EO starts in the year the person turns 18 (if employed)
    // or 21 (if non-active). 
    // For simplicity, we assume 18+ as per current engine.
    const ahvBase = isRetired ? Math.max(0, gross - 16800) : gross; // 16,800 allowance for retired
    const ahv = ahvBase * (AHV_IV_EO_RATE_EMPLOYEE / 100);

    // ALV stops at retirement age.
    const alv = (!isRetired && gross > 0)
        ? Math.min(gross, ALV_UPPER_LIMIT) * (ALV_RATE_EMPLOYEE / 100)
        : 0;

    // NBUV and KTG are employer-specific but usually around 0.5% and 0.4%
    const nbuv = gross * (0.5 / 100);
    const ktg = gross * (0.4 / 100);

    return {
        ahv,
        alv,
        nbuv,
        ktg,
        total: ahv + alv + nbuv + ktg
    };
}

/**
 * Calculates social security deductions for a self-employed individual.
 * Uses the SVA sliding scale for AHV/IV/EO.
 * @param netIncome Annual net income from self-employment
 */
export function calculateSelfEmployedSocialDeductions(netIncome: number): SocialDeductions {
    let ahvRate: number;

    if (netIncome < SVA_LOWER_LIMIT) {
        // If income is very low, the minimum contribution applies.
        // However, the rate for the calculation of the "taxable" deduction should reflect reality.
        const ahv = SVA_MIN_CONTRIBUTION;
        return { ahv, alv: 0, nbuv: 0, ktg: 0, total: ahv };
    } else if (netIncome >= SVA_UPPER_LIMIT) {
        ahvRate = SVA_UPPER_RATE;
    } else {
        // Sliding scale formula: linear interpolation between rates
        const range = SVA_UPPER_LIMIT - SVA_LOWER_LIMIT;
        const rateRange = SVA_UPPER_RATE - SVA_LOWER_RATE;
        const position = (netIncome - SVA_LOWER_LIMIT) / range;
        ahvRate = SVA_LOWER_RATE + (position * rateRange);
    }

    const ahv = netIncome * ahvRate;

    return {
        ahv,
        alv: 0, // Self-employed usually don't pay ALV unless voluntary/special
        nbuv: 0,
        ktg: 0,
        total: ahv
    };
}
