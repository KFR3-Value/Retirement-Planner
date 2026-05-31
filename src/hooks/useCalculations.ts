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
  stromHeizung: number;
  housingCapEx: number;
  housingTotal: number;

  krankenkasse: number;
  zahnarztOptiker: number;
  diversesReserve: number;
  healthCapEx: number;
  healthTotal: number;

  haushaltEssen: number;
  mobilitaet: number;
  telefonHandyMedien: number;
  kleiderFreizeit: number;
  ferienReisen: number;
  versicherungenSonstige: number;
  livingCapEx: number;
  livingTotal: number;

  variableKosten: number; // Sum of living running costs + health running costs (except insurance)
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
  deductionsBreakdown?: any;
  actualDeductionsCanton: number;
  actualDeductionsFederal: number;

  // Dashboard Metrics
  fixedCosts: number;
  guaranteedIncome: number;
  coverageRatio: number;
  affordabilityRatio: number;
}

import { Aargau2025Strategy } from '../engines/tax/strategies/aargau_strategy';
import type { ExpenseProfile } from '../engines/tax/tax_calculator';
import multipliersData from '../data/multipliers_2024.json';
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
      // AHV Calculation based on Scenarios
      let ahvIncome = 0;
      const activeScenario = state.ahv.scenarios.find(s => s.id === state.ahv.selectedScenarioId) || state.ahv.scenarios[0];

      for (let m = 0; m < 12; m++) {
        for (const stream of activeScenario.streams) {
          const isStarted = stream.startYear < yearNum || (stream.startYear === yearNum && stream.startMonth <= m);
          const isEnded = stream.endYear < yearNum || (stream.endYear === yearNum && stream.endMonth < m);
          
          if (isStarted && !isEnded) {
            ahvIncome += stream.markusAmount + stream.moniqueAmount;
          }
        }
      }

      const calcPkForYear = (startYear: number, startMonth: number) => {
        if (yearNum < startYear) return 0;
        if (yearNum > startYear) return pkRenteFullYear;
        // Prorated year
        const monthsActive = 12 - startMonth;
        return pkRenteFullYear * (monthsActive / 12);
      };

      const pkRenteIncome = calcPkForYear(state.pensionskasse.startYear, state.pensionskasse.startMonth);
      
      const calcMonthsActive = (y: number, sYear: number, sMonth: number, eYear: number, eMonth: number) => {
        if (y < sYear || y > eYear) return 0;
        if (y === sYear && y === eYear) {
          return eMonth - sMonth + 1; // inclusive
        } else if (y === sYear) {
          return 12 - sMonth;
        } else if (y === eYear) {
          return eMonth + 1;
        } else {
          return 12; // full year
        }
      };

      const calcSalaryForYear = () => {
        let totalNet = 0;
        for (const stream of state.salaryStreams || []) {
          const activeMonths = calcMonthsActive(yearNum, stream.startYear, stream.startMonth, stream.endYear, stream.endMonth);
          if (activeMonths > 0) {
            if (stream.inputType === 'brutto') {
              const d = stream.deductions;
              const totalDeduction =
                (d?.ahvBasis ?? stream.amount) * (d?.ahv || 0) / 100 +
                (d?.alvBasis ?? stream.amount) * (d?.alv || 0) / 100 +
                (d?.nubvBasis ?? stream.amount) * (d?.nbuv || 0) / 100 +
                (d?.ktgBasis  ?? stream.amount) * (d?.ktg  || 0) / 100 +
                (d?.bvgBasis  ?? stream.amount) * (d?.bvg  || 0) / 100 +
                (d?.otherBasis?? stream.amount) * (d?.other|| 0) / 100;
              totalNet += activeMonths * (stream.amount - totalDeduction);
            } else {
              totalNet += activeMonths * stream.amount;
            }
          }
        }
        return Math.max(0, totalNet);
      };
      const salaryIncome = calcSalaryForYear();

      const wealthYieldIncome = currentLiquidWealth * (state.baseline.liquidYieldRate / 100);
      
      const otherIncome = state.otherIncomeEvents.reduce((sum, event) => {
        const activeMonths = calcMonthsActive(yearNum, event.startYear, event.startMonth, event.endYear, event.endMonth);
        return sum + (activeMonths * event.monthlyAmount);
      }, 0);

      // Banking Standard Assumption: Deemed yield of 4.0% on liquid assets for dynamic income calculation.
      const deemedYield = currentLiquidWealth * 0.04;
      const actualGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + wealthYieldIncome + otherIncome;
      const totalGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + deemedYield + otherIncome;
      
      // Eigenmietwert only up until 2028 (inclusive)
      const isUpTo2028 = ['2026', '2027', '2028'].includes(yearKey);
      const eigenmietwert = isUpTo2028 ? (Number(state.housing.eigenmietwert) || 0) : 0;

      // --- EXPENSES ---
      const mortgageInterest =
        (Number(state.housing.saronAmount) || 0) * ((Number(state.housing.saronRate) || 0) / 100) +
        (Number(state.housing.festAmount) || 0) * ((Number(state.housing.festRate) || 0) / 100);

      const amortisation = Number(state.housing.amortisation) || 0;
      const propertyMaintenance = (Number(state.housing.efhTaxValue) || 0) * ((Number(state.housing.unterhaltRate) || 0) / 100);

      // Banking Standard Assumptions for Affordability Stress Test:
      // Deemed imputed interest rate of 5.0% on the total mortgage debt, and deemed maintenance of 1.0% on the bank lending value.
      const bankLendingValue = Number(state.housing.bankLendingValue) || 1000000;
      const mortgageDebt = (Number(state.housing.saronAmount) || 0) + (Number(state.housing.festAmount) || 0);
      const imputedCosts = (mortgageDebt * 0.05) + (bankLendingValue * 0.01) + amortisation;
      const affordabilityRatio = totalGrossIncome > 0 ? (imputedCosts / totalGrossIncome) * 100 : 0;

      // Krankenkasse age increase (3% per year starting from 2027)
      let krankenkasse = Number(state.health.krankenkasseBase) || 0;
      if (state.health.applyAgeIncrease && index > 0) {
        krankenkasse = krankenkasse * Math.pow(1 + ((Number(state.health.ageIncreaseRate) || 0) / 100), index);
      }

      const stromHeizung = Number(state.housing.stromHeizung) || 0;
      
      const haushaltEssen = Number(state.living.haushaltEssen) || 0;
      const mobilitaet = Number(state.living.mobilitaet) || 0;
      const telefonHandyMedien = Number(state.living.telefonHandyMedien) || 0;
      const kleiderFreizeit = Number(state.living.kleiderFreizeit) || 0;
      const ferienReisen = Number(state.living.ferienReisen) || 0;
      const versicherungenSonstige = Number(state.living.versicherungenSonstige) || 0;
      
      const zahnarztOptiker = Number(state.health.zahnarztOptiker) || 0;
      const diversesReserve = Number(state.health.diversesReserve) || 0;

      const variableKosten = haushaltEssen + kleiderFreizeit + ferienReisen + zahnarztOptiker + diversesReserve;

      // Categorized CapEx
      const housingCapEx = state.capExEvents
        .filter(event => event.year === yearKey && (event.category === 'housing' || (!event.category && (event.description.toLowerCase().includes('renovation') || event.description.toLowerCase().includes('garten')))))
        .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

      const healthCapEx = state.capExEvents
        .filter(event => event.year === yearKey && event.category === 'health')
        .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

      const livingCapEx = state.capExEvents
        .filter(event => event.year === yearKey && (event.category === 'living' || (!event.category && !event.description.toLowerCase().includes('renovation') && !event.description.toLowerCase().includes('garten'))))
        .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

      const capEx = housingCapEx + livingCapEx + healthCapEx;

      // Domain Totals
      const housingTotal = (mortgageInterest + amortisation + propertyMaintenance + stromHeizung) * inflationFactor + housingCapEx;
      const livingTotal = (haushaltEssen + mobilitaet + telefonHandyMedien + kleiderFreizeit + ferienReisen + versicherungenSonstige) * inflationFactor + livingCapEx;
      const healthTotal = (krankenkasse + zahnarztOptiker + diversesReserve) * inflationFactor + healthCapEx;

      const totalOutflowExclTaxes = housingTotal + livingTotal + healthTotal;

      const fixedCosts = (mortgageInterest + amortisation + propertyMaintenance + krankenkasse + stromHeizung + mobilitaet + telefonHandyMedien + versicherungenSonstige) * inflationFactor;

      // --- WITHDRAWALS & TAXES ---
      let capitalWithdrawalAmount = 0;

      // Capital withdrawal logic (support withdrawal years >= 2031 in '2031+' column)
      const isPensionskasseWithdrawal = () => {
        if (pkCapitalWithdrawn || pkCapital <= 0) return false;
        if (yearKey === '2031+') {
          return state.pensionskasse.startYear >= 2031;
        }
        return yearNum === state.pensionskasse.startYear;
      };

      if (isPensionskasseWithdrawal()) {
        currentLiquidWealth += pkCapital;
        capitalWithdrawalAmount += pkCapital;
        pkCapitalWithdrawn = true;
      }

      const isSaeule3aWithdrawal = () => {
        const wYear = state.assets.saeule3a.withdrawalYear;
        if (!wYear || current3a <= 0) return false;
        if (yearKey === '2031+') {
          const parsed = parseInt(wYear);
          return !isNaN(parsed) && parsed >= 2031;
        }
        return wYear === yearKey;
      };

      if (isSaeule3aWithdrawal()) {
        currentLiquidWealth += current3a;
        capitalWithdrawalAmount += current3a;
        current3a = 0;
      }

      const isFzkWithdrawal = () => {
        const wYear = state.assets.freizuegigkeitskonto.withdrawalYear;
        if (!wYear || currentFzk <= 0) return false;
        if (yearKey === '2031+') {
          const parsed = parseInt(wYear);
          return !isNaN(parsed) && parsed >= 2031;
        }
        return wYear === yearKey;
      };

      if (isFzkWithdrawal()) {
        currentLiquidWealth += currentFzk;
        capitalWithdrawalAmount += currentFzk;
        currentFzk = 0;
      }

      // Income Tax
      // Deductions: Krankenkasse, Schuldzinsen (mortgage interest), deductible CapEx
      const deductibleCapEx = state.capExEvents
        .filter(event => event.year === yearKey && event.isTaxDeductible)
        .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

      // Initialize the Aargau strategy
      const strategy = new Aargau2025Strategy();

      // Look up multipliers for Bettwil dynamically
      const bettwilMultiplier = (multipliersData.response as any).find(
        (m: any) => m.Location && m.Location.City === 'Bettwil'
      );
      const cantonMultiplier = bettwilMultiplier ? bettwilMultiplier.IncomeRateCanton / 100 : 1.11;
      const municipalMultiplier = bettwilMultiplier ? bettwilMultiplier.IncomeRateCity / 100 : 1.02;
      const churchMultiplier = bettwilMultiplier 
        ? (bettwilMultiplier.IncomeRateRoman + bettwilMultiplier.IncomeRateProtestant) / 200 
        : 0.19;

      const multipliers = {
        cantonal: cantonMultiplier,
        municipal: municipalMultiplier,
        church: churchMultiplier
      };

      const yearlyDeductions = state.taxDeductions?.[yearKey] || {
        transport: 0,
        meal: 0,
        professional: 0,
        childcare: 0,
        alimony: 0,
        donations: 0,
        education: 0,
        other: 0
      };

      const insuranceVal = (yearlyDeductions.insuranceOverride !== undefined && yearlyDeductions.insuranceOverride > 0)
        ? yearlyDeductions.insuranceOverride
        : krankenkasse;

      // Construct ExpenseProfile for the deduction engine
      const memberExpenses: ExpenseProfile[] = [{
        transport: Number(yearlyDeductions.transport) || 0,
        meal: Number(yearlyDeductions.meal) || 0,
        professional: Number(yearlyDeductions.professional) || 0,
        debtInterest: mortgageInterest,
        maintenance: propertyMaintenance,
        pillar3a: 0,
        pillar2Buyin: 0,
        insurance: insuranceVal,
        childcare: Number(yearlyDeductions.childcare) || 0,
        alimony: Number(yearlyDeductions.alimony) || 0,
        donations: Number(yearlyDeductions.donations) || 0,
        wealthManagement: 0,
        others: deductibleCapEx + (Number(yearlyDeductions.education) || 0) + (Number(yearlyDeductions.other) || 0)
      }];

      // Run TaxDeductionEngine via strategy
      const deductionsResult = strategy.calculateDeductions(
        actualGrossIncome + eigenmietwert,
        'married',
        [], // childAges (no children modeled in state yet)
        memberExpenses,
        [salaryIncome]
      );

      // Taxable Income (Canton vs Federal)
      const taxableIncome = Math.max(0, actualGrossIncome + eigenmietwert - deductionsResult.canton);
      const taxableIncomeFederal = Math.max(0, actualGrossIncome + eigenmietwert - deductionsResult.federal);

      // Wealth Tax (Aargau married tax-free allowance of 200,000 CHF is subtracted)
      const efhTaxValue = Number(state.housing.efhTaxValue) || 0;
      const taxableWealth = Math.max(0, currentLiquidWealth + current3a + efhTaxValue - mortgageDebt);
      const netWealth = Math.max(0, taxableWealth - 200000);

      // Calculate Simple Tax (100% basis)
      const simpleTaxes = strategy.calculateSimpleTax(
        taxableIncome,
        taxableIncomeFederal,
        netWealth,
        'married'
      );

      // Apply Multipliers for Canton, Commune, and Church for ordinary taxes
      const cantonalIncomeTax = simpleTaxes.simpleIncomeCanton * multipliers.cantonal;
      const municipalIncomeTax = simpleTaxes.simpleIncomeCanton * multipliers.municipal;
      const churchIncomeTax = simpleTaxes.simpleIncomeCanton * multipliers.church;
      const federalIncomeTax = simpleTaxes.federalTax;

      const cantonalWealthTax = simpleTaxes.simpleWealthCanton * multipliers.cantonal;
      const municipalWealthTax = simpleTaxes.simpleWealthCanton * multipliers.municipal;
      const churchWealthTax = simpleTaxes.simpleWealthCanton * multipliers.church;

      // Capital Withdrawal Tax
      let cantonalWithdrawalTax = 0;
      let municipalWithdrawalTax = 0;
      let churchWithdrawalTax = 0;
      let federalWithdrawalTax = 0;

      if (capitalWithdrawalAmount > 0) {
        const capitalSimpleTaxes = strategy.calculateSimpleTax(capitalWithdrawalAmount, 0, 0, 'married');
        
        // Canton Aargau (AG): 30% of simple income tax, min 1% of the gross capital amount
        const agWithdrawalTaxSimple = Math.max(
          capitalWithdrawalAmount * 0.01,
          capitalSimpleTaxes.simpleIncomeCanton * 0.30
        );

        // Federal (CH): 20% (1/5) of federal tax, min 2% of the gross capital amount
        const federalWithdrawalTaxCalculated = Math.max(
          capitalWithdrawalAmount * 0.02,
          capitalSimpleTaxes.federalTax * 0.20
        );

        cantonalWithdrawalTax = agWithdrawalTaxSimple * multipliers.cantonal;
        municipalWithdrawalTax = agWithdrawalTaxSimple * multipliers.municipal;
        churchWithdrawalTax = agWithdrawalTaxSimple * multipliers.church;
        federalWithdrawalTax = federalWithdrawalTaxCalculated;
      }

      // Ordinary Tax Summaries
      const ordinaryCantonal = cantonalIncomeTax + cantonalWealthTax;
      const ordinaryMunicipal = municipalIncomeTax + municipalWealthTax;
      const ordinaryFederal = federalIncomeTax;
      const ordinaryChurch = churchIncomeTax + churchWealthTax;

      // Total Tax Summaries (including withdrawal taxes)
      const totalCantonal = ordinaryCantonal + cantonalWithdrawalTax;
      const totalMunicipal = ordinaryMunicipal + municipalWithdrawalTax;
      const totalFederal = ordinaryFederal + federalWithdrawalTax;
      const totalChurch = ordinaryChurch + churchWithdrawalTax;

      const incomeTax = cantonalIncomeTax + municipalIncomeTax + federalIncomeTax + churchIncomeTax;
      const wealthTax = cantonalWealthTax + municipalWealthTax + churchWealthTax;
      const capitalWithdrawalTax = cantonalWithdrawalTax + municipalWithdrawalTax + federalWithdrawalTax + churchWithdrawalTax;
      const totalTaxBurden = totalCantonal + totalMunicipal + totalFederal + totalChurch;

      const taxResult = {
        incomeTax,
        wealthTax,
        capitalWithdrawalTax,
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
          simpleIncomeRate: simpleTaxes.simpleIncomeCanton / (taxableIncome || 1),
          federalRate: simpleTaxes.federalTax / (taxableIncomeFederal || 1)
        }
      };

      // --- SURPLUS & WEALTH UPDATE ---
      // Cash flow must use actualGrossIncome
      const surplusDeficit = actualGrossIncome - totalOutflowExclTaxes - totalTaxBurden;
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
        stromHeizung,
        housingCapEx,
        housingTotal,
        krankenkasse,
        zahnarztOptiker,
        diversesReserve,
        healthCapEx,
        healthTotal,
        haushaltEssen,
        mobilitaet,
        telefonHandyMedien,
        kleiderFreizeit,
        ferienReisen,
        versicherungenSonstige,
        livingCapEx,
        livingTotal,
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
        deductionsBreakdown: deductionsResult.items,
        actualDeductionsCanton: deductionsResult.canton,
        actualDeductionsFederal: deductionsResult.federal,
        fixedCosts,
        guaranteedIncome,
        coverageRatio,
        affordabilityRatio
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
    const mortgageDebt = (Number(state.housing.saronAmount) || 0) + (Number(state.housing.festAmount) || 0);
    const realEstateEquity = (Number(state.housing.efhTaxValue) || 0) - mortgageDebt; // using tax value for equity approximation

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
