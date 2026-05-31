/**
 * Aargau Tax Strategy 2025
 */

import type { TaxStrategy, CivilStatus, ExpenseProfile, DeductionResult, TaxBracket } from '../tax_calculator';
import { TAX_DATA } from '@budget-family/shared';
const DEDUCTIONS_DATA = TAX_DATA.deductions;
const TARIFFS_DATA = TAX_DATA.tariffs;

// Federal constants still imported as they are not in the parsed files
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
        // console.log(`Bracket: limit ${bracket.limit}, rate ${bracket.rate}, amount ${amount}, tax ${amount * bracket.rate}`);
        remaining -= amount;
    }
    return tax;
}

export class Aargau2025Strategy implements TaxStrategy {
    name = 'Aargau 2025';
    year = 2025;
    region = 'AG';

    // Helper to get deduction object from list by name
    getDedEntry(key: string): { amount?: number, max?: number } | undefined {
        const agDed = (DEDUCTIONS_DATA as any).AG?.Einkommen as any[];
        if (!agDed) return undefined;
        return agDed.find(d => d.name === key);
    }

    // Helper to get deduction value (max or fixed amount)
    getDedVal(key: string, type: 'max' | 'amount' = 'max'): number {
        const entry = this.getDedEntry(key);
        if (!entry) return 0;
        return (type === 'max' ? entry.max : entry.amount) || 0;
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

        // Constants from JSON (German Keys)
        const AG_MAX_DEDUCTION_TRANSPORT = this.getDedVal('Abzug für Fahrkosten Haupterwerb', 'max');
        const AG_MAX_DEDUCTION_MEAL = this.getDedVal('Abzug Mehrkosten der Verpflegung ohne Verbilligung', 'max');

        // Insurance Caps
        // AG 2025 keys per new JSON
        const AG_INSURANCE_CAP_SINGLE_LINKED = this.getDedVal('Abzug Versicherungsprämien und Sparzinsen, alleinstehende Personen mit Beiträgen Säule 2/3a', 'max');
        const AG_INSURANCE_CAP_MARRIED_LINKED = this.getDedVal('Abzug Versicherungsprämien und Sparzinsen, Verheiratete mit  Beiträgen Säule 2/3a', 'max');

        // Defaults if missing (though they should exist now)
        const AG_INS_CAP_S = AG_INSURANCE_CAP_SINGLE_LINKED || 2200;
        const AG_INS_CAP_M = AG_INSURANCE_CAP_MARRIED_LINKED || 4400;

        const AG_DUAL_INCOME_MAX = this.getDedVal('Zweitverdienerabzug', 'max');

        const AG_DEDUCTION_CHILD_U14 = this.getDedVal('Kinderabzug, Alter unter 14', 'amount');
        const AG_DEDUCTION_CHILD_14_17 = this.getDedVal('Kinderabzug, Alter zwischen 14 und 17', 'amount');
        const AG_DEDUCTION_CHILD_ADULT = this.getDedVal('Kinderabzug, volljährige Kinder', 'amount');

        const AG_MAX_DEDUCTION_CHILDCARE = this.getDedVal('Abzug Kinderdrittbetreuungskosten', 'max');

        // Initialize sum variables
        let totalTransportCanton = 0;
        let totalTransportFederal = 0;
        let totalMealCanton = 0;
        let totalMealFederal = 0;
        let totalProfCanton = 0;
        let totalProfFederal = 0;

        let totalDebt = 0;
        let totalMaintenance = 0;
        let totalPillar3a = 0;
        let totalPillar2Buyin = 0;
        let totalAlimony = 0;
        let totalDonations = 0;
        let totalWealthMgmt = 0;
        let totalOthers = 0;
        let totalInsurance = 0;
        let totalChildcare = 0;

        const memberItems: Record<string, { canton: number; federal: number }>[] = [];

        for (const person of memberExpenses) {
            const mTransC = Math.min(person.transport, AG_MAX_DEDUCTION_TRANSPORT);
            const mTransF = Math.min(person.transport, FED_MAX_DEDUCTION_TRANSPORT);

            const mMealC = Math.min(person.meal, AG_MAX_DEDUCTION_MEAL);
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
        const insuranceCapCanton = status === 'married' ? AG_INS_CAP_M : AG_INS_CAP_S;
        const insuranceCapFederal = (status === 'married' ? FED_INSURANCE_CAP_MARRIED_BASE : FED_INSURANCE_CAP_SINGLE_BASE) + (childCount * FED_INSURANCE_CAP_CHILD_ADDON);

        items['insurance'] = {
            canton: Math.min(totalInsurance, insuranceCapCanton),
            federal: Math.min(totalInsurance, insuranceCapFederal)
        };

        // Dual Income
        let dualCanton = 0;
        let dualFederal = 0;
        if (status === 'married') {
            const activeIncomes = earnedIncomes.filter(inc => inc > 0);
            if (activeIncomes.length >= 2) {
                const lower = Math.min(...activeIncomes);
                // Aargau: Flat deduction from JSON
                dualCanton = AG_DUAL_INCOME_MAX;
                // Federal: 50%...
                dualFederal = Math.min(Math.max(lower * FED_DUAL_INCOME_RATE, FED_DUAL_INCOME_MIN), FED_DUAL_INCOME_MAX);
            }
        }
        items['dual_income'] = { canton: dualCanton, federal: dualFederal };

        // Children
        let cantonChildSum = 0;
        for (const age of childAges) {
            if (age < 14) cantonChildSum += AG_DEDUCTION_CHILD_U14;
            else if (age < 18) cantonChildSum += AG_DEDUCTION_CHILD_14_17; // Use 14-17 key based on JSON
            else cantonChildSum += AG_DEDUCTION_CHILD_ADULT; // Adult/Edu
        }

        items['children'] = {
            canton: cantonChildSum,
            federal: childCount * FED_MAX_DEDUCTION_CHILD
        };

        // Childcare
        items['childcare'] = {
            canton: Math.min(totalChildcare, childCount * AG_MAX_DEDUCTION_CHILDCARE),
            federal: Math.min(totalChildcare, childCount * FED_MAX_DEDUCTION_CHILDCARE)
        };

        // Add additional items to breakdown
        items['debtInterest'] = { canton: totalDebt, federal: totalDebt };
        items['maintenance'] = { canton: totalMaintenance, federal: totalMaintenance };
        items['alimony'] = { canton: totalAlimony, federal: totalAlimony };
        items['donations'] = { canton: totalDonations, federal: totalDonations };
        items['others'] = { canton: totalOthers, federal: totalOthers };

        // Summing up
        let totalCanton = 0;
        let totalFederal = 0;
        Object.values(items).forEach(val => {
            totalCanton += val.canton;
            totalFederal += val.federal;
        });

        const rest = totalPillar3a + totalPillar2Buyin + totalWealthMgmt;
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
        // Use Generated Tariffs
        const tariffsAG = (TARIFFS_DATA as any).AG;
        const tariffsBund = (TARIFFS_DATA as any).CH;

        console.log('DEBUG: Tariff Keys:', Object.keys(TARIFFS_DATA));
        console.log('DEBUG: AG Keys:', tariffsAG ? Object.keys(tariffsAG) : 'undefined');
        if (tariffsAG?.income) console.log('DEBUG: AG Income Keys:', Object.keys(tariffsAG.income));
        console.log('DEBUG: CH Keys:', tariffsBund ? Object.keys(tariffsBund) : 'undefined');
        if (tariffsBund?.income) console.log('DEBUG: CH Income Keys:', Object.keys(tariffsBund.income));


        const tariffIncAG = status === 'married' ?
            tariffsAG?.income?.married :
            tariffsAG?.income?.single;

        const tariffWealthAG = tariffsAG?.wealth?.default || tariffsAG?.wealth?.single; // Wealth is often 'Alle' -> default or specific

        // Splitting Logic for Married (Canton)
        const splittingFactor = tariffsAG?.splittingFactor || 2;

        let simpleIncomeCanton = 0;
        if (status === 'married') {
            // Note: If we have a specific 'married' tariff, splitting might already be baked in or not needed?
            // Usually, if 'married' tariff exists, it's the "Verheiratetentarif".
            // But some cantons use Splitting on the base tariff.
            // Aargau: "Tarif B" vs Splitting? 
            // Our Mock/API returns distinct tables. If we use the "married" table, we likely don't need splitting factor on top?
            // Let's check generated JSON structure. 'Splitting: 1.9' was in Mock.

            // Standard Swiss Logic:
            // If explicit Married tariff exists, use it directly.
            // If only one tariff + splitting, use splitting.

            if (tariffIncAG) {
                simpleIncomeCanton = calculateTaxFromTariff(taxableIncomeCanton, tariffIncAG);
            } else {
                // Fallback to splitting if no specific married tariff found (but we generated one)
                const splitIncome = taxableIncomeCanton / splittingFactor;
                const baseTariff = tariffsAG?.income?.default || tariffsAG?.income?.single;
                const splitTax = baseTariff ? calculateTaxFromTariff(splitIncome, baseTariff) : 0;
                simpleIncomeCanton = splitTax * splittingFactor;
            }
        } else {
            simpleIncomeCanton = tariffIncAG ? calculateTaxFromTariff(taxableIncomeCanton, tariffIncAG) : 0;
        }

        // Wealth Tax
        let simpleWealthCanton = 0;
        if (tariffWealthAG && tariffWealthAG.length > 0) {
            simpleWealthCanton = calculateTaxFromTariff(taxableWealth, tariffWealthAG);
        } else {
            // Fallback to old linear rate if no tariff found?
            simpleWealthCanton = (taxableWealth / 1000) * 0.85;
        }

        // Federal Tax (Bund)
        let federalTax = 0;
        const tariffFed = status === 'married' ?
            (tariffsBund?.income?.married || FEDERAL_TARIFF_B) :
            (tariffsBund?.income?.single || FEDERAL_TARIFF_A);

        federalTax = calculateTaxFromTariff(taxableIncomeFederal, tariffFed);

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
