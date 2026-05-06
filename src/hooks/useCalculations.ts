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
  totalGrossIncome: number;

  // Expenses (Ausgaben)
  mortgageInterest: number;
  amortisation: number;
  propertyMaintenance: number;
  krankenkasse: number;
  mobilitaet: number;
  variableKosten: number;
  capEx: number;
  totalOutflowExclTaxes: number;

  // Taxes
  taxableIncome: number;
  incomeTax: number;
  taxableWealth: number;
  wealthTax: number;
  capitalWithdrawalTax: number;
  totalTaxBurden: number;

  // Totals & Assets
  surplusDeficit: number; // Income - Outflow - Taxes
  liquidWealthEnd: number;
  saeule3aEnd: number;
  totalWealthEnd: number;

  // Dashboard Metrics
  fixedCosts: number;
  guaranteedIncome: number;
  coverageRatio: number;
}

// Simple tax approximations for Aargau (Bettwil)
const calculateIncomeTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  // Very rough approximation of a progressive curve
  if (taxableIncome < 50000) return taxableIncome * 0.05;
  if (taxableIncome < 100000) return 2500 + (taxableIncome - 50000) * 0.12;
  return 8500 + (taxableIncome - 100000) * 0.18;
};

const calculateWealthTax = (taxableWealth: number): number => {
  if (taxableWealth <= 100000) return 0;
  // Simplified Aargau wealth tax
  return (taxableWealth - 100000) * 0.003;
};

const calculateCapitalWithdrawalTax = (amount: number): number => {
  if (amount <= 0) return 0;
  // Special reduced rate for capital withdrawals
  return amount * 0.05;
};

export const useCalculations = () => {
  const { state } = usePlanning();

  const data = useMemo(() => {
    const result: Record<YearKey, YearData> = {} as any;

    let currentLiquidWealth = state.assets.startingLiquidWealth;
    let current3a = state.assets.saeule3a.balance;
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
      // AHV Proration
      let ahvIncome = 0;
      const calcAhvForPerson = (startYear: number, startMonth: number) => {
        if (yearNum < startYear) return 0;
        if (yearNum > startYear) return state.ahv.fullPensionCouple / 2;
        // Prorated year
        const monthsActive = 12 - startMonth;
        return (state.ahv.fullPensionCouple / 2) * (monthsActive / 12);
      };

      ahvIncome += calcAhvForPerson(state.ahv.markusStartYear, state.ahv.markusStartMonth);
      ahvIncome += calcAhvForPerson(state.ahv.moniqueStartYear, state.ahv.moniqueStartMonth);

      const calcPkForYear = (startYear: number, startMonth: number) => {
        if (yearNum < startYear) return 0;
        if (yearNum > startYear) return pkRenteFullYear;
        // Prorated year
        const monthsActive = 12 - startMonth;
        return pkRenteFullYear * (monthsActive / 12);
      };

      const pkRenteIncome = calcPkForYear(state.pensionskasse.startYear, state.pensionskasse.startMonth);
      
      const calcSalaryForYear = () => {
        const { startYear, startMonth, endYear, endMonth, monthlyGross, deductionRate } = state.salary;
        if (yearNum < startYear || yearNum > endYear) return 0;

        let activeMonths = 0;
        if (yearNum === startYear && yearNum === endYear) {
          activeMonths = endMonth - startMonth + 1; // inclusive
        } else if (yearNum === startYear) {
          activeMonths = 12 - startMonth;
        } else if (yearNum === endYear) {
          activeMonths = endMonth + 1;
        } else {
          activeMonths = 12; // full year
        }

        const grossAnnual = activeMonths * monthlyGross;
        const netAnnual = grossAnnual * (1 - (deductionRate / 100));
        return Math.max(0, netAnnual);
      };
      const salaryIncome = calcSalaryForYear();

      const wealthYieldIncome = currentLiquidWealth * 0.02; // Assuming a 2% default yield
      const otherIncome = state.otherIncome[yearKey] || 0;

      const totalGrossIncome = ahvIncome + pkRenteIncome + salaryIncome + wealthYieldIncome + otherIncome;

      // --- EXPENSES ---
      const mortgageInterest =
        (state.fixeKosten.hypothek.saronAmount * (state.fixeKosten.hypothek.saronRate / 100)) +
        (state.fixeKosten.hypothek.festAmount * (state.fixeKosten.hypothek.festRate / 100));

      const propertyMaintenance = state.assets.efhTaxValue * (state.fixeKosten.unterhaltRate / 100);

      // Krankenkasse age increase (3% per year starting from 2027)
      let krankenkasse = state.fixeKosten.krankenkasse.base;
      if (state.fixeKosten.krankenkasse.applyAgeIncrease && index > 0) {
        krankenkasse = krankenkasse * Math.pow(1 + (state.fixeKosten.krankenkasse.ageIncreaseRate / 100), index);
      }

      const mobilitaet = state.fixeKosten.mobilitaet;
      const variableKosten = state.variableKosten;
      const capEx = state.capEx[yearKey] || 0;

      // Apply inflation to 2031+ expenses
      const totalOutflowExclTaxes = (
        mortgageInterest +
        state.fixeKosten.amortisation +
        propertyMaintenance +
        krankenkasse +
        mobilitaet +
        variableKosten
      ) * inflationFactor + capEx; // capEx in 2031+ acts as an annualized reserve

      const fixedCosts = (mortgageInterest + state.fixeKosten.amortisation + propertyMaintenance + krankenkasse + mobilitaet) * inflationFactor;

      // --- WITHDRAWALS & TAXES ---
      let capitalWithdrawalTax = 0;

      // Capital withdrawal logic (simplified for 2026 or designated year)
      if (yearNum === state.pensionskasse.startYear && pkCapital > 0 && !pkCapitalWithdrawn) {
        currentLiquidWealth += pkCapital;
        capitalWithdrawalTax += calculateCapitalWithdrawalTax(pkCapital);
        pkCapitalWithdrawn = true;
      }

      if (state.assets.saeule3a.withdrawalYear === yearKey) {
        currentLiquidWealth += current3a;
        capitalWithdrawalTax += calculateCapitalWithdrawalTax(current3a);
        current3a = 0;
      }

      // Income Tax
      // Deductions: Krankenkasse, Schuldzinsen (mortgage interest)
      const taxableIncome = Math.max(0, totalGrossIncome - krankenkasse - mortgageInterest);
      const incomeTax = calculateIncomeTax(taxableIncome);

      // Wealth Tax
      const mortgageDebt = state.fixeKosten.hypothek.saronAmount + state.fixeKosten.hypothek.festAmount;
      const taxableWealth = Math.max(0, currentLiquidWealth + current3a + state.assets.efhTaxValue - mortgageDebt);
      const wealthTax = calculateWealthTax(taxableWealth);

      const totalTaxBurden = incomeTax + wealthTax + capitalWithdrawalTax;

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
        totalGrossIncome,
        mortgageInterest,
        amortisation: state.fixeKosten.amortisation,
        propertyMaintenance,
        krankenkasse,
        mobilitaet,
        variableKosten,
        capEx,
        totalOutflowExclTaxes,
        taxableIncome,
        incomeTax,
        taxableWealth,
        wealthTax,
        capitalWithdrawalTax,
        totalTaxBurden,
        surplusDeficit,
        liquidWealthEnd: currentLiquidWealth,
        saeule3aEnd: current3a,
        totalWealthEnd: currentLiquidWealth + current3a + (state.assets.efhTaxValue - mortgageDebt),
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
    const mortgageDebt = state.fixeKosten.hypothek.saronAmount + state.fixeKosten.hypothek.festAmount;
    const realEstateEquity = state.assets.efhTaxValue - mortgageDebt; // using tax value for equity approximation

    // Base surplus logic for 2031+ onwards
    const annualSurplus = data['2031+'].surplusDeficit;

    // Add 2026-2030 exact points
    YEARS.filter(y => y !== '2031+').forEach(year => {
       points.push({
         year: parseInt(year),
         liquidWealth: data[year].liquidWealthEnd + data[year].saeule3aEnd,
         realEstateEquity,
         totalWealth: data[year].totalWealthEnd
       });
    });

    // Project 2031 to 2045
    for (let y = 2031; y <= 2045; y++) {
      currentWealth += annualSurplus; // simplified: apply the 2031+ steady state surplus/deficit

      points.push({
         year: y,
         liquidWealth: currentWealth + current3a,
         realEstateEquity,
         totalWealth: currentWealth + current3a + realEstateEquity
      });
    }

    return points;
  }, [data, state]);

  return { data, trajectory };
};
