export interface RetirementState {
  // Guaranteed Inflows
  ahvAnnual: number;
  pkCapital: number;
  conversionRate: number; // Percentage (e.g. 5.0)
  lumpSumPercentage: number; // Percentage (0 to 100)
  expectedMarketReturn: number; // Percentage (e.g. 3.0)
  otherWealth: number; // Freely available wealth

  // Housing Module (EFH in Bettwil)
  propertyValue: number; // Default 1,400,000
  propertyTaxValue: number; // Tax value of the property
  mortgageAmount: number;
  mortgageInterestRate: number; // Percentage (e.g. 1.5)
  annualAmortization: number;
  maintenanceReserveRate: number; // Percentage (e.g. 0.5)
  utilitiesEstimates: number; // Default 4000

  // Outflows (Fixed & Variable Budget Baseline)
  variableHaushalt: number; // 19680
  personalAuslagen: number; // 8640
  diverses: number; // 7440
  rueckstellungen: number; // 12000
  festeVerpflichtungen: number; // 4320
  krankenkasse: number; // 14400
  mobilitaet: number; // 7200

  // Tax Deductions
  taxDeductionHealth: number;
  taxDeductionInsurances: number;
  taxDeduction3a: number;
  taxDeductionOther: number;
}

export interface CalculatedOutputs {
  // Inflows
  pkAnnuity: number;
  withdrawnLumpSum: number;
  totalGuaranteedIncome: number;
  expectedAnnualYield: number; // Yield from withdrawn lump sum
  
  // Housing Costs
  annualMortgageInterest: number;
  annualMaintenance: number;
  totalHousingCosts: number;

  // Taxes
  grossTaxableIncome: number;
  grossTaxableWealth: number;
  taxableIncome: number;
  taxableWealth: number;
  estimatedIncomeTax: number;
  estimatedWealthTax: number;
  totalEstimatedTaxes: number;
  capitalWithdrawalTax: number;

  // Budget
  totalFixedCosts: number; 
  totalVariableCosts: number; 
  totalCosts: number; 

  // Results
  annualShortfall: number; // Deficit/Surplus after all costs including taxes
  coverageRatio: number; // Guaranteed Income / Fixed Costs (including basic taxes and housing)
}
