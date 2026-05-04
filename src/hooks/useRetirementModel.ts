import { useState, useMemo, useEffect } from 'react';
import type { RetirementState, CalculatedOutputs } from '../types';
import { calculateAnnualTaxes, calculateCapitalWithdrawalTax } from '../utils/taxCalculator';

const INITIAL_STATE: RetirementState = {
  // Guaranteed Inflows
  ahvAnnual: 48000, // Placeholder (e.g., max married couple AHV)
  pkCapital: 800000, // Placeholder PK Capital
  conversionRate: 5.0, // 5% Umwandlungssatz
  lumpSumPercentage: 50, // 50% Capital, 50% Rente initially
  expectedMarketReturn: 3.0, // 3% real return
  otherWealth: 200000, // 200k other wealth placeholder

  // Housing Module
  propertyValue: 1400000,
  propertyTaxValue: 900000, // Tax value is usually lower
  mortgageAmount: 500000,
  mortgageInterestRate: 1.5,
  annualAmortization: 0,
  maintenanceReserveRate: 0.5,
  utilitiesEstimates: 4000,

  // Budget Baseline
  variableHaushalt: 19680,
  personalAuslagen: 8640,
  diverses: 7440,
  rueckstellungen: 12000,
  festeVerpflichtungen: 4320,
  krankenkasse: 14400,
  mobilitaet: 7200,

  // Tax Deductions
  taxDeductionHealth: 10000,
  taxDeductionInsurances: 5000,
  taxDeduction3a: 0,
  taxDeductionOther: 2000,
};

export function useRetirementModel() {
  const [state, setState] = useState<RetirementState>(() => {
    const saved = localStorage.getItem('retirementState');
    if (saved) {
      try {
        return { ...INITIAL_STATE, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('retirementState', JSON.stringify(state));
  }, [state]);

  const updateState = (key: keyof RetirementState, value: number) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const outputs = useMemo<CalculatedOutputs>(() => {
    // 1. Inflows
    const withdrawnLumpSum = state.pkCapital * (state.lumpSumPercentage / 100);
    const annuityCapital = state.pkCapital - withdrawnLumpSum;
    const pkAnnuity = annuityCapital * (state.conversionRate / 100);
    const totalGuaranteedIncome = state.ahvAnnual + pkAnnuity;
    const expectedAnnualYield = withdrawnLumpSum * (state.expectedMarketReturn / 100);

    // 2. Housing Costs
    const annualMortgageInterest = state.mortgageAmount * (state.mortgageInterestRate / 100);
    const annualMaintenance = state.propertyValue * (state.maintenanceReserveRate / 100);
    const totalHousingCosts = annualMortgageInterest + state.annualAmortization + annualMaintenance + state.utilitiesEstimates;

    // 3. Wealth & Taxes
    const propertyEquityTaxValue = Math.max(0, state.propertyTaxValue - state.mortgageAmount);
    
    // Net Lump Sum after one-off tax
    const capitalWithdrawalTax = calculateCapitalWithdrawalTax(withdrawnLumpSum);
    const netLumpSum = withdrawnLumpSum - capitalWithdrawalTax;
    
    // Taxable Wealth = Other Wealth + Net Lump Sum + (Property Tax Value - Mortgage)
    // Note: If mortgage > propertyTaxValue, the negative equity can offset other wealth.
    const grossTaxableWealth = state.otherWealth + netLumpSum + state.propertyTaxValue;
    const netTaxableWealth = Math.max(0, grossTaxableWealth - state.mortgageAmount);
    
    // Taxable Income
    const grossIncome = state.ahvAnnual + pkAnnuity + expectedAnnualYield; 
    
    const taxResults = calculateAnnualTaxes(grossIncome, netTaxableWealth, {
      healthInsurance: state.taxDeductionHealth,
      otherInsurances: state.taxDeductionInsurances,
      thirdPillar: state.taxDeduction3a,
      professionalExpenses: 0, // Assume 0 for retirees
      otherDeductions: state.taxDeductionOther + annualMortgageInterest // Include mortgage interest as deduction!
    });

    const totalEstimatedTaxes = taxResults.totalAnnualTax;

    // 4. Budget Calculation
    const totalFixedCosts = 
      totalHousingCosts + 
      state.krankenkasse + 
      state.mobilitaet + 
      state.festeVerpflichtungen + 
      totalEstimatedTaxes; // Taxes added as fixed outflow

    const totalVariableCosts = 
      state.variableHaushalt + 
      state.personalAuslagen + 
      state.diverses + 
      state.rueckstellungen;

    const totalCosts = totalFixedCosts + totalVariableCosts;
    
    // 5. Shortfall & Coverage
    const totalInflowWithYield = totalGuaranteedIncome + expectedAnnualYield;
    const annualShortfall = totalInflowWithYield - totalCosts; 
    
    const coverageRatio = totalFixedCosts > 0 ? (totalGuaranteedIncome / totalFixedCosts) : 1;

    return {
      pkAnnuity,
      withdrawnLumpSum,
      totalGuaranteedIncome,
      expectedAnnualYield,
      
      annualMortgageInterest,
      annualMaintenance,
      totalHousingCosts,

      grossTaxableIncome: grossIncome,
      grossTaxableWealth: grossTaxableWealth,
      taxableIncome: taxResults.taxableIncome,
      taxableWealth: taxResults.taxableWealth,
      estimatedIncomeTax: taxResults.finalIncomeTax,
      estimatedWealthTax: taxResults.finalWealthTax,
      totalEstimatedTaxes,
      capitalWithdrawalTax,

      totalFixedCosts,
      totalVariableCosts,
      totalCosts,

      annualShortfall,
      coverageRatio
    };
  }, [state]);

  return { state, updateState, outputs };
}
