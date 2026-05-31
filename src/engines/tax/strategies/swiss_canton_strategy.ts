/**
 * Swiss Canton Tax Strategy - Config-Driven
 * 
 * A generic tax strategy that works for any Swiss canton by reading
 * deduction rules from deductions.json via the TaxDeductionEngine.
 * 
 * This replaces the hardcoded Aargau2025Strategy with a flexible,
 * data-driven approach.
 */

import type { TaxStrategy, CivilStatus, ExpenseProfile, DeductionResult, TaxBracket } from '../tax_calculator.js';
import { TaxDeductionEngine } from '../TaxDeductionEngine.js';
import type { DeductionsData } from '../deduction.schema.js';
import { TAX_DATA } from '@budget-family/shared';

const DEDUCTIONS_DATA = TAX_DATA.deductions;
const TARIFFS_DATA = TAX_DATA.tariffs;

// Federal constants (not yet in JSON)
import {
    FEDERAL_TARIFF_A, FEDERAL_TARIFF_B,
    FED_MAX_DEDUCTION_TRANSPORT, FED_MAX_DEDUCTION_MEAL,
    FED_MAX_DEDUCTION_CHILD, FED_MAX_DEDUCTION_CHILDCARE,
    FED_INSURANCE_CAP_SINGLE_BASE, FED_INSURANCE_CAP_MARRIED_BASE, FED_INSURANCE_CAP_CHILD_ADDON,
    FED_DUAL_INCOME_MIN, FED_DUAL_INCOME_MAX, FED_DUAL_INCOME_RATE
} from '@budget-family/shared';

function calculateTaxFromTariff(income: number, tariff: TaxBracket[]): number {
    let remaining = income;
    let tax = 0;
    for (const bracket of tariff) {
        if (remaining <= 0) break;
        const amount = Math.min(remaining, bracket.limit);
        tax += amount * bracket.rate;
        remaining -= amount;
    }
    return tax;
}

export interface CantonConfig {
    code: string;      // e.g., 'AG', 'ZH', 'BE'
    year: number;      // e.g., 2025
    name?: string;     // e.g., 'Aargau 2025'
}

/**
 * Generic Swiss Canton Tax Strategy
 * 
 * Reads deduction rules from deductions.json and tariffs from tariffs.json.
 * Can be instantiated for any canton.
 */
export class SwissCantonStrategy implements TaxStrategy {
    readonly name: string;
    readonly year: number;
    readonly region: string;

    private engine: TaxDeductionEngine;
    private deductionsData: DeductionsData;

    static isSupported(cantonCode: string): boolean {
        const tariffs = TARIFFS_DATA as any;
        const deductions = DEDUCTIONS_DATA as any;
        return !!tariffs[cantonCode] && !!deductions[cantonCode];
    }

    constructor(config: CantonConfig) {
        this.region = config.code;
        this.year = config.year;
        this.name = config.name || `${config.code} ${config.year}`;
        this.engine = new TaxDeductionEngine();
        this.deductionsData = DEDUCTIONS_DATA as DeductionsData;
    }

    /**
     * Helper to get deduction value for current canton
     */
    getDeductionValue(key: string, type: 'amount' | 'max' | 'percent' | 'min' = 'max'): number {
        return this.engine.getDeductionValue(this.region, this.deductionsData, key, type);
    }

    calculateDeductions(
        _income: number,
        status: CivilStatus,
        childAges: number[],
        memberExpenses: ExpenseProfile[],
        earnedIncomes: number[]
    ): DeductionResult {
        const items: DeductionResult['items'] = {};
        const childCount = childAges.length;

        // Get canton-specific caps from JSON via engine
        const CANTON_MAX_TRANSPORT = this.getDeductionValue('Abzug für Fahrkosten Haupterwerb', 'max');
        const CANTON_MAX_MEAL = this.getDeductionValue('Abzug Mehrkosten der Verpflegung ohne Verbilligung', 'max');
        const CANTON_MAX_CHILDCARE = this.getDeductionValue('Abzug Kinderdrittbetreuungskosten', 'max');
        const CANTON_DUAL_INCOME_MAX = this.getDeductionValue('Zweitverdienerabzug', 'max');

        // Insurance caps based on status
        const CANTON_INS_CAP_SINGLE = this.getDeductionValue(
            'Abzug Versicherungsprämien und Sparzinsen, alleinstehende Personen mit Beiträgen Säule 2/3a', 'max'
        ) || 2200;
        const CANTON_INS_CAP_MARRIED = this.getDeductionValue(
            'Abzug Versicherungsprämien und Sparzinsen, Verheiratete mit  Beiträgen Säule 2/3a', 'max'
        ) || 4400;

        // Child deductions by age tier
        const CHILD_U14 = this.getDeductionValue('Kinderabzug, Alter unter 14', 'amount')
            || this.getDeductionValue('Kinderabzug', 'amount');
        const CHILD_14_17 = this.getDeductionValue('Kinderabzug, Alter zwischen 14 und 17', 'amount')
            || this.getDeductionValue('Kinderabzug', 'amount');
        const CHILD_ADULT = this.getDeductionValue('Kinderabzug, volljährige Kinder', 'amount')
            || this.getDeductionValue('Kinderabzug', 'amount');

        // Process member expenses
        let totalTransportCanton = 0, totalTransportFederal = 0;
        let totalMealCanton = 0, totalMealFederal = 0;
        let totalProfCanton = 0, totalProfFederal = 0;
        let totalDebt = 0, totalMaintenance = 0, totalPillar3a = 0;
        let totalPillar2Buyin = 0, totalAlimony = 0, totalDonations = 0;
        let totalWealthMgmt = 0, totalOthers = 0;
        let totalInsurance = 0, totalChildcare = 0;

        const memberItems: Record<string, { canton: number; federal: number }>[] = [];

        for (const person of memberExpenses) {
            const mTransC = Math.min(person.transport, CANTON_MAX_TRANSPORT);
            const mTransF = Math.min(person.transport, FED_MAX_DEDUCTION_TRANSPORT);
            const mMealC = Math.min(person.meal, CANTON_MAX_MEAL);
            const mMealF = Math.min(person.meal, FED_MAX_DEDUCTION_MEAL);
            const mProfC = person.professional;
            const mProfF = person.professional;

            memberItems.push({
                transport: { canton: mTransC, federal: mTransF },
                meal: { canton: mMealC, federal: mMealF },
                professional: { canton: mProfC, federal: mProfF },
                insurance: { canton: person.insurance, federal: person.insurance },
                debtInterest: { canton: person.debtInterest, federal: person.debtInterest },
                maintenance: { canton: person.maintenance, federal: person.maintenance },
                pillar3a: { canton: person.pillar3a, federal: person.pillar3a },
                pillar2Buyin: { canton: person.pillar2Buyin, federal: person.pillar2Buyin },
                alimony: { canton: person.alimony, federal: person.alimony },
                donations: { canton: person.donations, federal: person.donations },
                wealthManagement: { canton: person.wealthManagement, federal: person.wealthManagement },
                others: { canton: person.others, federal: person.others },
                childcare: { canton: person.childcare, federal: person.childcare }
            });

            totalTransportCanton += mTransC;
            totalTransportFederal += mTransF;
            totalMealCanton += mMealC;
            totalMealFederal += mMealF;
            totalProfCanton += mProfC;
            totalProfFederal += mProfF;
            totalDebt += person.debtInterest;
            totalMaintenance += person.maintenance;
            totalPillar3a += person.pillar3a;
            totalPillar2Buyin += person.pillar2Buyin;
            totalAlimony += person.alimony;
            totalDonations += person.donations;
            totalWealthMgmt += person.wealthManagement;
            totalOthers += person.others;
            totalInsurance += person.insurance;
            totalChildcare += person.childcare;
        }

        items['transport'] = { canton: totalTransportCanton, federal: totalTransportFederal };
        items['meal'] = { canton: totalMealCanton, federal: totalMealFederal };
        items['professional'] = { canton: totalProfCanton, federal: totalProfFederal };

        // Insurance (Family Cap)
        const insuranceCapCanton = status === 'married' ? CANTON_INS_CAP_MARRIED : CANTON_INS_CAP_SINGLE;
        const insuranceCapFederal = (status === 'married' ? FED_INSURANCE_CAP_MARRIED_BASE : FED_INSURANCE_CAP_SINGLE_BASE)
            + (childCount * FED_INSURANCE_CAP_CHILD_ADDON);

        items['insurance'] = {
            canton: Math.min(totalInsurance, insuranceCapCanton),
            federal: Math.min(totalInsurance, insuranceCapFederal)
        };

        // Dual Income
        let dualCanton = 0, dualFederal = 0;
        if (status === 'married') {
            const activeIncomes = earnedIncomes.filter(inc => inc > 0);
            if (activeIncomes.length >= 2) {
                const lower = Math.min(...activeIncomes);
                dualCanton = CANTON_DUAL_INCOME_MAX;
                dualFederal = Math.min(Math.max(lower * FED_DUAL_INCOME_RATE, FED_DUAL_INCOME_MIN), FED_DUAL_INCOME_MAX);
            }
        }
        items['dual_income'] = { canton: dualCanton, federal: dualFederal };

        // Children (age-based)
        let cantonChildSum = 0;
        for (const age of childAges) {
            if (age < 14) cantonChildSum += CHILD_U14;
            else if (age < 18) cantonChildSum += CHILD_14_17;
            else cantonChildSum += CHILD_ADULT;
        }
        items['children'] = {
            canton: cantonChildSum,
            federal: childCount * FED_MAX_DEDUCTION_CHILD
        };

        // Childcare
        items['childcare'] = {
            canton: Math.min(totalChildcare, childCount * CANTON_MAX_CHILDCARE),
            federal: Math.min(totalChildcare, childCount * FED_MAX_DEDUCTION_CHILDCARE)
        };

        // Sum totals
        let totalCanton = 0, totalFederal = 0;
        Object.values(items).forEach(val => {
            totalCanton += val.canton;
            totalFederal += val.federal;
        });

        const rest = totalDebt + totalMaintenance + totalPillar3a + totalPillar2Buyin
            + totalAlimony + totalDonations + totalWealthMgmt + totalOthers;
        totalCanton += rest;
        totalFederal += rest;

        return { canton: totalCanton, federal: totalFederal, items, memberItems };
    }

    calculateSimpleTax(
        taxableIncomeCanton: number,
        taxableIncomeFederal: number,
        taxableWealth: number,
        status: CivilStatus
    ) {
        const tariffsCanton = (TARIFFS_DATA as any)[this.region];
        const tariffsBund = (TARIFFS_DATA as any).CH;
        const tariffInc = (status === 'married' ?
            tariffsCanton?.income?.married :
            tariffsCanton?.income?.single) || tariffsCanton?.income?.default;

        const tariffWealth = tariffsCanton?.wealth?.default || tariffsCanton?.wealth?.single;
        const splittingFactor = tariffsCanton?.splittingFactor || 2;

        // Canton income tax
        let simpleIncomeCanton = 0;
        if (status === 'married') {
            if (tariffInc) {
                simpleIncomeCanton = calculateTaxFromTariff(taxableIncomeCanton, tariffInc);
            } else {
                // Fallback to splitting if no specific married tariff found
                const splitIncome = taxableIncomeCanton / splittingFactor;
                const baseTariff = tariffsCanton?.income?.default || tariffsCanton?.income?.single;
                const splitTax = baseTariff ? calculateTaxFromTariff(splitIncome, baseTariff) : 0;
                simpleIncomeCanton = splitTax * splittingFactor;
            }
        } else {
            simpleIncomeCanton = tariffInc ? calculateTaxFromTariff(taxableIncomeCanton, tariffInc) : 0;
        }

        // Canton wealth tax
        let simpleWealthCanton = 0;
        if (tariffWealth && tariffWealth.length > 0) {
            simpleWealthCanton = calculateTaxFromTariff(taxableWealth, tariffWealth);
        } else {
            simpleWealthCanton = (taxableWealth / 1000) * 0.85; // Fallback
        }

        // Federal tax
        const tariffFed = (status === 'married'
            ? (tariffsBund?.income?.married || FEDERAL_TARIFF_B)
            : (tariffsBund?.income?.single || FEDERAL_TARIFF_A)) || tariffsBund?.income?.default;
        const federalTax = calculateTaxFromTariff(taxableIncomeFederal, tariffFed);

        return { simpleIncomeCanton, simpleWealthCanton, federalTax };
    }

    applyMultipliers(
        simpleIncome: number,
        simpleWealth: number,
        multipliers: { canton: number; commune: number; church: number }
    ) {
        const base = simpleIncome + simpleWealth;
        return {
            cantonTax: base * multipliers.canton,
            communeTax: base * multipliers.commune,
            churchTax: base * multipliers.church
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Pre-configured canton strategies (convenience exports)
// ═══════════════════════════════════════════════════════════════════════════

/** @deprecated Use SwissCantonStrategy with config instead */
export class Aargau2025Strategy extends SwissCantonStrategy {
    constructor() {
        super({ code: 'AG', year: 2025, name: 'Aargau 2025' });
    }
}

/** Zurich 2025 Strategy */
export class Zurich2025Strategy extends SwissCantonStrategy {
    constructor() {
        super({ code: 'ZH', year: 2025, name: 'Zürich 2025' });
    }
}

/** Bern 2025 Strategy */
export class Bern2025Strategy extends SwissCantonStrategy {
    constructor() {
        super({ code: 'BE', year: 2025, name: 'Bern 2025' });
    }
}

/**
 * Factory function to create a strategy for any canton
 */
export function createCantonStrategy(cantonCode: string, year = 2025): SwissCantonStrategy {
    return new SwissCantonStrategy({ code: cantonCode, year });
}
