// Approximate Aargau Tax Brackets for Married Couples (Doppelverdiener/Verheiratetentarif)
// These are BASE amounts (einfache Kantonssteuer). 
// The final tax is calculated by multiplying the base tax by the specific multiplier.

export interface TaxDeductions {
  healthInsurance: number;
  otherInsurances: number;
  thirdPillar: number;
  professionalExpenses: number;
  otherDeductions: number;
}

// Total multiplier for Bettwil (Katholisch):
// Kanton: 109%
// Gemeinde: 102%
// Kirche (Röm.-Kath.): 16%
// Total: 227% = 2.27 multiplier
export const BETTWIL_MULTIPLIER = 2.27;

export function calculateBaseIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 15000) return 0;
  
  let tax = 0;
  let remaining = taxableIncome;

  const brackets = [
    { limit: 15000, rate: 0.00 },
    { limit: 30000, rate: 0.015 },
    { limit: 50000, rate: 0.035 },
    { limit: 80000, rate: 0.055 },
    { limit: 120000, rate: 0.075 },
    { limit: 200000, rate: 0.095 },
    { limit: Infinity, rate: 0.110 }
  ];

  let previousLimit = 0;
  for (const bracket of brackets) {
    if (remaining > previousLimit) {
      const taxableInThisBracket = Math.min(remaining, bracket.limit) - previousLimit;
      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * bracket.rate;
      }
    }
    previousLimit = bracket.limit;
  }

  return tax;
}

export function calculateBaseWealthTax(taxableWealth: number): number {
  if (taxableWealth <= 200000) return 0; // Exemption for married

  let tax = 0;
  let remaining = taxableWealth;

  const brackets = [
    { limit: 200000, rate: 0.000 },
    { limit: 500000, rate: 0.0015 },
    { limit: 1000000, rate: 0.0025 },
    { limit: Infinity, rate: 0.0035 }
  ];

  let previousLimit = 0;
  for (const bracket of brackets) {
    if (remaining > previousLimit) {
      const taxableInThisBracket = Math.min(remaining, bracket.limit) - previousLimit;
      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * bracket.rate;
      }
    }
    previousLimit = bracket.limit;
  }

  return tax;
}

export function calculateFederalIncomeTax(taxableIncome: number): number {
  // Approximate Direkte Bundessteuer for Married couples
  if (taxableIncome <= 29000) return 0;
  
  let tax = 0;
  let remaining = taxableIncome;

  const brackets = [
    { limit: 29000, rate: 0.00 },
    { limit: 50000, rate: 0.01 },
    { limit: 75000, rate: 0.02 },
    { limit: 100000, rate: 0.04 },
    { limit: 135000, rate: 0.06 },
    { limit: 170000, rate: 0.08 },
    { limit: Infinity, rate: 0.115 } // Max fed rate
  ];

  let previousLimit = 0;
  for (const bracket of brackets) {
    if (remaining > previousLimit) {
      const taxableInThisBracket = Math.min(remaining, bracket.limit) - previousLimit;
      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * bracket.rate;
      }
    }
    previousLimit = bracket.limit;
  }

  return tax;
}

export function calculateCapitalWithdrawalTax(lumpSum: number): number {
  if (lumpSum <= 0) return 0;
  
  // 1. Kanton Aargau & Gemeinde (Vorsorgetarif)
  const simulatedBaseTaxForLumpSum = calculateBaseIncomeTax(lumpSum);
  const effectiveBaseRate = simulatedBaseTaxForLumpSum / lumpSum;
  
  let vorsorgeRate = effectiveBaseRate * 0.3;
  if (vorsorgeRate < 0.01) {
    vorsorgeRate = 0.01; // Minimum 1% base rate
  }

  const kantonBaseTax = lumpSum * vorsorgeRate;
  const totalKantonsGemeindeSteuer = kantonBaseTax * BETTWIL_MULTIPLIER;

  // 2. Direkte Bundessteuer (1/5 of ordinary tariff)
  const simulatedFederalTax = calculateFederalIncomeTax(lumpSum);
  const federalCapitalTax = simulatedFederalTax * 0.2; // 1/5th

  return totalKantonsGemeindeSteuer + federalCapitalTax;
}

export function calculateAnnualTaxes(grossIncome: number, wealth: number, deductions: TaxDeductions) {
  const totalDeductions = 
    deductions.healthInsurance + 
    deductions.otherInsurances + 
    deductions.thirdPillar + 
    deductions.professionalExpenses + 
    deductions.otherDeductions;

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const taxableWealth = Math.max(0, wealth);

  // Kantons- und Gemeindesteuer
  const baseIncomeTax = calculateBaseIncomeTax(taxableIncome);
  const baseWealthTax = calculateBaseWealthTax(taxableWealth);
  const finalIncomeTaxCantonal = baseIncomeTax * BETTWIL_MULTIPLIER;
  const finalWealthTaxCantonal = baseWealthTax * BETTWIL_MULTIPLIER;

  // Direkte Bundessteuer
  const finalFederalTax = calculateFederalIncomeTax(taxableIncome);

  const totalIncomeTax = finalIncomeTaxCantonal + finalFederalTax;

  return {
    taxableIncome,
    taxableWealth,
    totalDeductions,
    finalIncomeTax: totalIncomeTax,
    finalWealthTax: finalWealthTaxCantonal,
    totalAnnualTax: totalIncomeTax + finalWealthTaxCantonal
  };
}
