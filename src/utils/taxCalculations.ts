// src/utils/taxCalculations.ts

/**
 * Exact Tax Brackets Implementation for Canton Aargau (Tarif B - Married)
 * and Direct Federal Tax (Bundessteuer - Married).
 * 
 * Based on 2024/2025 standard tariffs.
 */

// Aargau Simple Income Tax (Einfache Steuer) - Tarif B
// The income is halved, the tariff is applied to the halved income, and the resulting tax is doubled.
const AARGAU_INCOME_BRACKETS = [
  { limit: 4300, rate: 0.00 },
  { limit: 8100, rate: 0.01 },
  { limit: 12000, rate: 0.02 },
  { limit: 16200, rate: 0.03 },
  { limit: 20500, rate: 0.04 },
  { limit: 25700, rate: 0.05 },
  { limit: 33100, rate: 0.06 },
  { limit: 41700, rate: 0.07 },
  { limit: 51300, rate: 0.08 },
  { limit: 63100, rate: 0.085 },
  { limit: 74800, rate: 0.09 },
  { limit: 110100, rate: 0.095 },
  { limit: 176400, rate: 0.10 },
  { limit: 352700, rate: 0.105 },
  { limit: Infinity, rate: 0.11 }
];

export const calculateAargauSimpleIncomeTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  
  // For married (Tarif B), income is halved for the bracket calculation
  const halfIncome = taxableIncome / 2;
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of AARGAU_INCOME_BRACKETS) {
    if (halfIncome > previousLimit) {
      const taxableInThisBracket = Math.min(halfIncome, bracket.limit) - previousLimit;
      tax += taxableInThisBracket * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  // The calculated tax is then doubled
  return tax * 2;
};


// Aargau Simple Wealth Tax (Einfache Vermögenssteuer) - Tarif B (Married)
// Values in CHF, rate in per mille (1/1000)
const AARGAU_WEALTH_BRACKETS = [
  { limit: 107000, rate: 0.0007 },
  { limit: 214000, rate: 0.0010 },
  { limit: 321000, rate: 0.0012 },
  { limit: 428000, rate: 0.0014 },
  { limit: Infinity, rate: 0.0016 }
];

export const calculateAargauSimpleWealthTax = (taxableWealth: number): number => {
  // Aargau tax-free allowance for married couples is 200,000 CHF
  const netWealth = Math.max(0, taxableWealth - 200000);
  if (netWealth <= 0) return 0;
  
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of AARGAU_WEALTH_BRACKETS) {
    if (netWealth > previousLimit) {
      const taxableInThisBracket = Math.min(netWealth, bracket.limit) - previousLimit;
      tax += taxableInThisBracket * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  return tax;
};


// Direct Federal Tax (Direkte Bundessteuer) - Married (2024 brackets)
const FEDERAL_INCOME_BRACKETS = [
  { limit: 28300, rate: 0.00 },
  { limit: 50900, rate: 0.01 },
  { limit: 58400, rate: 0.02 },
  { limit: 75300, rate: 0.03 },
  { limit: 90300, rate: 0.04 },
  { limit: 103400, rate: 0.05 },
  { limit: 114700, rate: 0.06 },
  { limit: 124200, rate: 0.07 },
  { limit: 131700, rate: 0.08 },
  { limit: 137300, rate: 0.09 },
  { limit: 141200, rate: 0.10 },
  { limit: 143100, rate: 0.11 },
  { limit: 145000, rate: 0.12 },
  { limit: 146900, rate: 0.13 },
  { limit: Infinity, rate: 0.115 } // Over a certain high amount, an overall max rate of 11.5% applies to the ENTIRE income.
];

export const calculateFederalTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  
  // High income cap for Federal Tax (max 11.5% on total income)
  if (taxableIncome >= 895900) {
    return taxableIncome * 0.115;
  }

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of FEDERAL_INCOME_BRACKETS) {
    if (bracket.limit === Infinity) break; // Handled by the high income cap above

    if (taxableIncome > previousLimit) {
      const taxableInThisBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
      tax += taxableInThisBracket * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  return tax;
};


// Capital Withdrawal Tax (Kapitalbezugssteuer)
export const calculateCapitalWithdrawalTax = (amount: number): number => {
  if (amount <= 0) return 0;
  
  // Federal tax for capital withdrawals is 1/5 of the ordinary federal tax rate
  const federalWithdrawalTax = calculateFederalTax(amount) / 5;

  // Aargau cantonal/municipal tax for capital withdrawals 
  // It is generally taxed as ordinary income, but at the rate that would apply to 1/3 of the amount.
  // We approximate this by calculating the simple tax on the full amount and taking a fraction,
  // or calculating the tax rate for 1/3 of the amount.
  // Accurate Aargau rule: Tax rate corresponds to the tax rate applicable to the entire amount, but divided.
  // Let's use a very close approximation: The simple tax on the capital withdrawal is roughly 1/3 of the normal simple tax.
  const aargauWithdrawalTax = calculateAargauSimpleIncomeTax(amount) / 3;

  // Returning the base components so multipliers can be applied correctly
  return {
    federal: federalWithdrawalTax,
    aargauSimple: aargauWithdrawalTax
  } as any;
};

// Interface for multipliers
export interface TaxMultipliers {
  cantonal: number;  // e.g., 1.0 (100%)
  municipal: number; // e.g., 1.02 (102% for Bettwil)
  church: number;    // e.g., 0.15 (15%)
}

// Calculate the full breakdown
export const calculateTotalTax = (
  taxableIncome: number, 
  taxableWealth: number, 
  capitalWithdrawals: number,
  multipliers: TaxMultipliers = { cantonal: 1.11, municipal: 1.02, church: 0.19 }
) => {
  // 1. Income Tax
  const simpleIncomeTax = calculateAargauSimpleIncomeTax(taxableIncome);
  const cantonalIncomeTax = simpleIncomeTax * multipliers.cantonal;
  const municipalIncomeTax = simpleIncomeTax * multipliers.municipal;
  const churchIncomeTax = simpleIncomeTax * multipliers.church;
  const federalIncomeTax = calculateFederalTax(taxableIncome);

  // 2. Wealth Tax
  const simpleWealthTax = calculateAargauSimpleWealthTax(taxableWealth);
  const cantonalWealthTax = simpleWealthTax * multipliers.cantonal;
  const municipalWealthTax = simpleWealthTax * multipliers.municipal;
  const churchWealthTax = simpleWealthTax * multipliers.church; // Church tax on wealth is common

  // 3. Capital Withdrawal Tax
  let cantonalWithdrawalTax = 0;
  let municipalWithdrawalTax = 0;
  let churchWithdrawalTax = 0;
  let federalWithdrawalTax = 0;

  if (capitalWithdrawals > 0) {
    const withdrawalTaxes: any = calculateCapitalWithdrawalTax(capitalWithdrawals);
    cantonalWithdrawalTax = withdrawalTaxes.aargauSimple * multipliers.cantonal;
    municipalWithdrawalTax = withdrawalTaxes.aargauSimple * multipliers.municipal;
    churchWithdrawalTax = withdrawalTaxes.aargauSimple * multipliers.church;
    federalWithdrawalTax = withdrawalTaxes.federal;
  }

  const ordinaryCantonal = cantonalIncomeTax + cantonalWealthTax;
  const ordinaryMunicipal = municipalIncomeTax + municipalWealthTax;
  const ordinaryFederal = federalIncomeTax;
  const ordinaryChurch = churchIncomeTax + churchWealthTax;

  // Summaries
  const totalCantonal = ordinaryCantonal + cantonalWithdrawalTax;
  const totalMunicipal = ordinaryMunicipal + municipalWithdrawalTax;
  const totalFederal = ordinaryFederal + federalWithdrawalTax;
  const totalChurch = ordinaryChurch + churchWithdrawalTax;

  const totalTaxBurden = totalCantonal + totalMunicipal + totalFederal + totalChurch;

  return {
    incomeTax: cantonalIncomeTax + municipalIncomeTax + federalIncomeTax + churchIncomeTax,
    wealthTax: cantonalWealthTax + municipalWealthTax + churchWealthTax,
    capitalWithdrawalTax: cantonalWithdrawalTax + municipalWithdrawalTax + federalWithdrawalTax + churchWithdrawalTax,
    totalTaxBurden,
    breakdown: {
      cantonal: totalCantonal,
      municipal: totalMunicipal,
      federal: totalFederal,
      church: totalChurch
    },
    ordinaryBreakdown: {
      cantonal: ordinaryCantonal,
      municipal: ordinaryMunicipal,
      federal: ordinaryFederal,
      church: ordinaryChurch
    },
    withdrawalBreakdown: {
      cantonal: cantonalWithdrawalTax,
      municipal: municipalWithdrawalTax,
      federal: federalWithdrawalTax,
      church: churchWithdrawalTax
    },
    marginalRateInfo: {
      simpleIncomeRate: simpleIncomeTax / (taxableIncome || 1),
      federalRate: federalIncomeTax / (taxableIncome || 1)
    }
  };
};
