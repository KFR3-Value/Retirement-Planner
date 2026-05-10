import { useMemo } from 'react';
import { usePlanning, type YearKey, YEARS } from '../context/PlanningContext';

export interface YearData {
  year: YearKey;

  // Income
  ahvIncome: number;
  pkRenteIncome: number;
  salaryIncome: number;
  wealthYieldIncome: number; // calculated dynamically
  otherIncome: number;
  eigenmietwert: number; // Fictitious tax income
  totalGrossIncome: number;
  capitalWithdrawalAmount: number; // Exceptional income

  // Expenses (Ausgaben)
  mortgageInterest: number;
  amortisation: number;
  propertyMaintenance: number;
  krankenkasse: number;
  mobilitaet: number;
  variableKosten: number;
  capEx: number;
  deductibleCapEx: number; // For tax deductions
  totalOutflowExclTaxes: number;

  // Taxes
  taxableIncome: number;
  incomeTax: number;
  taxableWealth: number;
  wealthTax: number;
  capitalWithdrawalTax: number;
  totalTaxBurden: number;
  taxBreakdown?: {
    cantonal: number;
    municipal: number;
    federal: number;
    church: number;
  };
  ordinaryBreakdown?: {
    cantonal: number;
    municipal: number;
    federal: number;
    church: number;
  };
  withdrawalBreakdown?: {
    cantonal: number;
    municipal: number;
    federal: number;
    church: number;
  };
  marginalRateInfo?: {
    simpleIncomeRate: number;
    federalRate: number;
  };

  // Totals & Assets
  surplusDeficit: number; // Income - Outflow - Taxes
  liquidWealthEnd: number;
  saeule3aEnd: number;
  fzkEnd: number;
  totalWealthEnd: number;
  efhTaxValue: number;
  mortgageDebt: number;
  wealthTaxableBase: { liquid: number, pillar3a: number };

  // Dashboard Metrics
  fixedCosts: number;
  guaranteedIncome: number;
  coverageRatio: number;
}

import { calculateTotalTax } from '../utils/taxCalculations';
export const useCalculations = () => {
  const { state } = usePlanning();

  const data = useMemo(() => {
    const result: Record<YearKey, YearData> = {} as any;

    let currentLiquidWealth = state.assets.startingLiquidWealth;
    let current3a = state.assets.saeule3a.balance;
    let currentFzk = state.assets.freizuegigkeitskonto.balance;
    let pkCapitalWithdrawn = false; // assumes we withdraw all in 2026 for now, or just track it

    // Calculate PK Rente (Full Year)
    const pkRenteFullYear = state.pensionskasse.totalCapital * (state.pensionskasse.renteSplit / 100) * (state.pensionskasse.umwandlungssatz / 100);
    const pkCapital = state.pensionskasse.totalCapital * ((100 - state.pensionskasse.renteSplit) / 100);

    YEARS.forEach((yearKey, index) => {
      const yearNum = yearKey === '2031+' ? 2031 : parseInt(yearKey);

      // Calculate Inflation Factor (applied to expenses from 2031+)
      let inflationFactor = 1.0;
      if (yearKey === '2031+' && state.baseline.applyInflation) {
         // Apply one step of inflation or continuous? The prompt mentions 2031+ as baseline.
         // We will just apply a flat rate for the 2031+ "steady state" column, or let the user see the 2031 state with 1 year of inflation.
         inflationFactor = 1 + (state.baseline.inflationRate / 100);
      }

      // --- INCOME ---
      // Function to calculate prorated income given start/end dates and 1-indexed months
      const calculateProratedMonths = (startYear: number, startMonth: number, endYear: number, endMonth: number) => {
        if (yearNum < startYear || yearNum > endYear) return 0;

        let activeMonths;
        if (yearNum === startYear && yearNum === endYear) {
          // Both start and end in the same year
          // +1 because both are inclusive. e.g. start=1, end=3 -> months 1, 2, 3 -> 3 active months (3 - 1 + 1 = 3)
          activeMonths = endMonth - startMonth + 1;
        } else if (yearNum === startYear) {
          // Starts in this year, ends later
          // e.g. start=10 (Oct) -> months 10, 11, 12 -> 3 active months (12 - 10 + 1 = 3)
          activeMonths = 12 - startMonth + 1;
        } else if (yearNum === endYear) {
          // Started earlier, ends in this year
          // e.g. end=2 (Feb) -> months 1, 2 -> 2 active months
          activeMonths = endMonth;
        } else {
          // Full year active
          activeMonths = 12;
        }

        return Math.max(0, Math.min(12, activeMonths)); // Ensure it's between 0 and 12
      };

      // AHV Proration
      let ahvIncome = 0;
      const markusAhvMonths = calculateProratedMonths(state.ahv.markusStartYear, state.ahv.markusStartMonth, state.ahv.markusEndYear, state.ahv.markusEndMonth);
      ahvIncome += (state.ahv.fullPensionCouple / 2) * (markusAhvMonths / 12);

      const moniqueAhvMonths = calculateProratedMonths(state.ahv.moniqueStartYear, state.ahv.moniqueStartMonth, state.ahv.moniqueEndYear, state.ahv.moniqueEndMonth);
      ahvIncome += (state.ahv.fullPensionCouple / 2) * (moniqueAhvMonths / 12);

      // PK Rente Proration
      const pkMonths = calculateProratedMonths(state.pensionskasse.startYear, state.pensionskasse.startMonth, state.pensionskasse.endYear, state.pensionskasse.endMonth);
      const pkRenteIncome = pkRenteFullYear * (pkMonths / 12);

      // Salary Proration
      const calcSalaryForYear = () => {
        const { startYear, startMonth, endYear, endMonth, monthlyGross, deductionRate } = state.salary;
        const activeMonths = calculateProratedMonths(startYear, startMonth, endYear, endMonth);
        const grossAnnual = activeMonths * monthlyGross;
        const netAnnual = grossAnnual * (1 - (deductionRate / 100));
        return Math.max(0, netAnnual);
      };
      const salaryIncome = calcSalaryForYear();

      const wealthYieldIncome = currentLiquidWealth * (state.baseline.liquidYieldRate / 100);
      const otherIncome = state.otherIncome[yearKey] || 0;

      const totalGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + wealthYieldIncome + otherIncome;
      
      // Eigenmietwert only up until 2028 (inclusive)
      const isUpTo2028 = ['2026', '2027', '2028'].includes(yearKey);
      const eigenmietwert = isUpTo2028 ? (Number(state.immobilie.eigenmietwert) || 0) : 0;

      // --- EXPENSES ---
      const mortgageInterest =
        (Number(state.immobilie.hypothek.saronAmount) || 0) * ((Number(state.immobilie.hypothek.saronRate) || 0) / 100) +
        (Number(state.immobilie.hypothek.festAmount) || 0) * ((Number(state.immobilie.hypothek.festRate) || 0) / 100);

      const amortisation = Number(state.fixeKosten.amortisation) || 0;
      const propertyMaintenance = (Number(state.immobilie.efhTaxValue) || 0) * ((Number(state.immobilie.unterhaltRate) || 0) / 100);

      // Krankenkasse age increase (3% per year starting from 2027)
      let krankenkasse = Number(state.fixeKosten.krankenkasse.base) || 0;
      if (state.fixeKosten.krankenkasse.applyAgeIncrease && index > 0) {
        krankenkasse = krankenkasse * Math.pow(1 + ((Number(state.fixeKosten.krankenkasse.ageIncreaseRate) || 0) / 100), index);
      }

      const mobilitaet = Number(state.fixeKosten.mobilitaet) || 0;
      const variableKosten = Number(state.variableKosten) || 0;
      const capEx = state.capExEvents
        .filter(event => event.year === yearKey)
        .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

      // Apply inflation to 2031+ expenses
      const totalOutflowExclTaxes = (
        mortgageInterest +
        amortisation +
        propertyMaintenance +
        krankenkasse +
        mobilitaet +
        variableKosten
      ) * inflationFactor + capEx; // capEx in 2031+ acts as an annualized reserve

      const fixedCosts = (mortgageInterest + amortisation + propertyMaintenance + krankenkasse + mobilitaet) * inflationFactor;

      // --- WITHDRAWALS & TAXES ---
      let capitalWithdrawalAmount = 0;

      // Capital withdrawal logic (simplified for 2026 or designated year)
      if (yearNum === state.pensionskasse.startYear && pkCapital > 0 && !pkCapitalWithdrawn) {
        currentLiquidWealth += pkCapital;
        capitalWithdrawalAmount += pkCapital;
        pkCapitalWithdrawn = true;
      }

      if (state.assets.saeule3a.withdrawalYear === yearKey) {
        currentLiquidWealth += current3a;
        capitalWithdrawalAmount += current3a;
        current3a = 0;
      }

      if (state.assets.freizuegigkeitskonto.withdrawalYear === yearKey) {
        currentLiquidWealth += currentFzk;
        capitalWithdrawalAmount += currentFzk;
        currentFzk = 0;
      }

      // Income Tax
      // Deductions: Krankenkasse, Schuldzinsen (mortgage interest), deductible CapEx
      const deductibleCapEx = state.capExEvents
        .filter(event => event.year === yearKey && event.isTaxDeductible)
        .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

      const taxableIncome = Math.max(0, totalGrossIncome + eigenmietwert - krankenkasse - mortgageInterest - propertyMaintenance - deductibleCapEx);

      // Wealth Tax
      const mortgageDebt = (Number(state.immobilie.hypothek.saronAmount) || 0) + (Number(state.immobilie.hypothek.festAmount) || 0);
      const efhTaxValue = Number(state.immobilie.efhTaxValue) || 0;
      const taxableWealth = Math.max(0, currentLiquidWealth + current3a + efhTaxValue - mortgageDebt);

      // Calculate taxes using exact Aargau Tarif B logic (Bettwil Steuerfuss)
      // Assuming multipliers: Canton 1.11, Bettwil 1.02, Church 0.19 (average)
      const taxResult = calculateTotalTax(taxableIncome, taxableWealth, capitalWithdrawalAmount, { cantonal: 1.11, municipal: 1.02, church: 0.19 });
      
      const incomeTax = taxResult.incomeTax;
      const wealthTax = taxResult.wealthTax;
      const capitalWithdrawalTax = taxResult.capitalWithdrawalTax;
      const totalTaxBurden = taxResult.totalTaxBurden;

      // --- SURPLUS & WEALTH UPDATE ---
      const surplusDeficit = totalGrossIncome - totalOutflowExclTaxes - totalTaxBurden;
      currentLiquidWealth += surplusDeficit;

      // Calculate ratios
      const guaranteedIncome = ahvIncome + pkRenteIncome;
      const coverageRatio = fixedCosts > 0 ? (guaranteedIncome / fixedCosts) * 100 : 0;

      result[yearKey] = {
        year: yearKey,
        ahvIncome,
        pkRenteIncome,
        salaryIncome,
        wealthYieldIncome,
        otherIncome,
        eigenmietwert,
        totalGrossIncome,
        capitalWithdrawalAmount,
        mortgageInterest,
        amortisation,
        propertyMaintenance,
        krankenkasse,
        mobilitaet,
        variableKosten,
        capEx,
        deductibleCapEx,
        totalOutflowExclTaxes,
        taxableIncome,
        incomeTax,
        taxableWealth,
        wealthTax,
        capitalWithdrawalTax,
        totalTaxBurden,
        taxBreakdown: taxResult.breakdown,
        ordinaryBreakdown: taxResult.ordinaryBreakdown,
        withdrawalBreakdown: taxResult.withdrawalBreakdown,
        marginalRateInfo: taxResult.marginalRateInfo,
        surplusDeficit,
        liquidWealthEnd: currentLiquidWealth,
        saeule3aEnd: current3a,
        fzkEnd: currentFzk,
        totalWealthEnd: currentLiquidWealth + current3a + currentFzk + (efhTaxValue - mortgageDebt),
        efhTaxValue,
        mortgageDebt,
        wealthTaxableBase: { liquid: currentLiquidWealth, pillar3a: current3a },
        fixedCosts,
        guaranteedIncome,
        coverageRatio
      };
    });

    return result;
  }, [state]);

  // Generate trajectory up to 2045
  const trajectory = useMemo(() => {
    const points = [];
    let currentWealth = data['2031+'].liquidWealthEnd;
    const current3a = data['2031+'].saeule3aEnd;
    const currentFzk = data['2031+'].fzkEnd;
    const mortgageDebt = (Number(state.immobilie.hypothek.saronAmount) || 0) + (Number(state.immobilie.hypothek.festAmount) || 0);
    const realEstateEquity = (Number(state.immobilie.efhTaxValue) || 0) - mortgageDebt; // using tax value for equity approximation

    // Base surplus logic for 2031+ onwards
    const annualSurplus = data['2031+'].surplusDeficit;

    // Add 2026-2030 exact points
    YEARS.filter(y => y !== '2031+').forEach(year => {
       points.push({
         year: parseInt(year),
         liquidWealth: data[year].liquidWealthEnd + data[year].saeule3aEnd + data[year].fzkEnd,
         realEstateEquity,
         totalWealth: data[year].totalWealthEnd
       });
    });

    // Project 2031 to 2045
    for (let y = 2031; y <= 2045; y++) {
      currentWealth += annualSurplus; // simplified: apply the 2031+ steady state surplus/deficit

      points.push({
         year: y,
         liquidWealth: currentWealth + current3a + currentFzk,
         realEstateEquity,
         totalWealth: currentWealth + current3a + currentFzk + realEstateEquity
      });
    }

    return points;
  }, [data, state]);

  // Calculate Cumulative KPIs
  const cumulativeKPIs = useMemo(() => {
    let totalTaxPaid = 0;
    let totalSavings = 0;
    
    // Sum explicit years 2026-2030
    YEARS.filter(y => y !== '2031+').forEach(year => {
      totalTaxPaid += data[year].totalTaxBurden;
      totalSavings += data[year].surplusDeficit;
    });

    // Sum projection period 2031-2045 (15 years)
    const projectedYears = 15;
    totalTaxPaid += data['2031+'].totalTaxBurden * projectedYears;
    totalSavings += data['2031+'].surplusDeficit * projectedYears;

    const netWealth2045 = trajectory[trajectory.length - 1]?.totalWealth || 0;

    return {
      totalTaxPaid,
      totalSavings,
      netWealth2045
    };
  }, [data, trajectory]);

  return { data, trajectory, cumulativeKPIs };
};
