import { useMemo } from 'react';
import { usePlanning, type YearKey, YEARS, type PlanningState } from '../context/PlanningContext';

export interface YearData {
  year: YearKey;

  // Income
  ahvIncome: number;
  pkRenteIncome: number;
  pensionskasseCapitalEnd: number;
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
export function runProjection(state: PlanningState, pkRenteSplitOverride?: number, liquidYieldRateOverride?: number) {
  const result: Record<YearKey, YearData> = {} as any;
  const yearResults: Record<number, YearData> = {};
  const trajectory: any[] = [];

  let currentLiquidWealth = state.assets.startingLiquidWealth;
  let current3a = state.assets.saeule3a.balance;
  let currentFzk = state.assets.freizuegigkeitskonto.balance;
  let pkCapitalWithdrawnMarkus = false;
  let pkCapitalWithdrawnMonique = false;

  const renteSplitMarkus = pkRenteSplitOverride !== undefined ? pkRenteSplitOverride : state.pensionskasseMarkus.renteSplit;
  const renteSplitMonique = pkRenteSplitOverride !== undefined ? pkRenteSplitOverride : state.pensionskasseMonique.renteSplit;

  const pkRenteFullYearMarkus = state.pensionskasseMarkus.totalCapital * (renteSplitMarkus / 100) * (state.pensionskasseMarkus.umwandlungssatz / 100);
  const pkRenteFullYearMonique = state.pensionskasseMonique.totalCapital * (renteSplitMonique / 100) * (state.pensionskasseMonique.umwandlungssatz / 100);

  const pkCapitalMarkus = state.pensionskasseMarkus.totalCapital * ((100 - renteSplitMarkus) / 100);
  const pkCapitalMonique = state.pensionskasseMonique.totalCapital * ((100 - renteSplitMonique) / 100);

  const deceasedPartner = state.survivor?.deceasedPartner || 'Keiner';
  const deathYear = state.survivor?.deathYear ?? 2035;

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

  // Loop year-by-year from 2026 to 2060
  for (let y = 2026; y <= 2060; y++) {
    const index = y - 2026;
    const yearKey = (y <= 2030 ? String(y) : '2031+') as YearKey;

    // Calculate Inflation Factor (applied to expenses from 2031+)
    let inflationFactor = 1.0;
    if (y >= 2031 && state.baseline.applyInflation) {
       inflationFactor = Math.pow(1 + (state.baseline.inflationRate / 100), y - 2030);
    }

    const isDeceased = deceasedPartner !== 'Keiner' && y >= deathYear;
    const civilStatus = isDeceased ? 'single' : 'married';

    // --- INCOME ---
    let ahvIncome = 0;
    const activeScenario = state.ahv.scenarios.find(s => s.id === state.ahv.selectedScenarioId) || state.ahv.scenarios[0];

    for (let m = 0; m < 12; m++) {
      let markusRent = 0;
      let moniqueRent = 0;
      for (const stream of activeScenario.streams) {
        const isStarted = stream.startYear < y || (stream.startYear === y && stream.startMonth <= m);
        const isEnded = stream.endYear < y || (stream.endYear === y && stream.endMonth < m);
        
        if (isStarted && !isEnded) {
          markusRent = stream.markusAmount;
          moniqueRent = stream.moniqueAmount;
          break;
        }
      }

      if (isDeceased) {
        let survivorOwn = 0;
        let deceasedOwn = 0;
        if (deceasedPartner === 'Markus') {
          survivorOwn = moniqueRent;
          deceasedOwn = markusRent;
        } else {
          survivorOwn = markusRent;
          deceasedOwn = moniqueRent;
        }
        // Widow's pension: Max(survivorOwn * 1.2, deceasedOwn * 0.8), capped at 2450 CHF/month (29400 CHF/year)
        const widowPension = Math.min(2450, Math.max(survivorOwn * 1.2, deceasedOwn * 0.8));
        ahvIncome += widowPension;
      } else {
        ahvIncome += markusRent + moniqueRent;
      }
    }

    // --- PENSIONSKASSE RENTE ---
    let pkRenteIncome = 0;
    const pkEndYearMarkus = state.pensionskasseMarkus.endYear ?? 2099;
    const pkEndMonthMarkus = state.pensionskasseMarkus.endMonth ?? 11;
    const pkEndYearMonique = state.pensionskasseMonique.endYear ?? 2099;
    const pkEndMonthMonique = state.pensionskasseMonique.endMonth ?? 11;

    for (let m = 0; m < 12; m++) {
      // 1. Markus PK Rente Contribution
      let rentMarkus = 0;
      const isRetiredMarkus = y > state.pensionskasseMarkus.startYear || (y === state.pensionskasseMarkus.startYear && m >= state.pensionskasseMarkus.startMonth);
      const isActiveMarkus = isRetiredMarkus && (y < pkEndYearMarkus || (y === pkEndYearMarkus && m <= pkEndMonthMarkus));
      if (isActiveMarkus) {
        if (deceasedPartner === 'Markus' && y >= deathYear) {
          const pkSurvivorRate = state.survivor?.pkSurvivorRate ?? 60;
          rentMarkus = (pkRenteFullYearMarkus / 12) * (pkSurvivorRate / 100);
        } else {
          rentMarkus = pkRenteFullYearMarkus / 12;
        }
      }

      // 2. Monique PK Rente Contribution
      let rentMonique = 0;
      const isRetiredMonique = y > state.pensionskasseMonique.startYear || (y === state.pensionskasseMonique.startYear && m >= state.pensionskasseMonique.startMonth);
      const isActiveMonique = isRetiredMonique && (y < pkEndYearMonique || (y === pkEndYearMonique && m <= pkEndMonthMonique));
      if (isActiveMonique) {
        if (deceasedPartner === 'Monique' && y >= deathYear) {
          const pkSurvivorRate = state.survivor?.pkSurvivorRate ?? 60;
          rentMonique = (pkRenteFullYearMonique / 12) * (pkSurvivorRate / 100);
        } else {
          rentMonique = pkRenteFullYearMonique / 12;
        }
      }

      pkRenteIncome += rentMarkus + rentMonique;
    }

    // --- SALARY INCOME ---
    const calcSalaryForYear = () => {
      let totalNet = 0;
      for (const stream of state.salaryStreams || []) {
        if (isDeceased && stream.owner === deceasedPartner) {
          continue; // Deceased salary drops to 0 starting from the year of death
        }
        const activeMonths = calcMonthsActive(y, stream.startYear, stream.startMonth, stream.endYear, stream.endMonth);
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

    // --- WEALTH YIELD ---
    const yieldRate = liquidYieldRateOverride !== undefined ? liquidYieldRateOverride : state.baseline.liquidYieldRate;
    const wealthYieldIncome = currentLiquidWealth * (yieldRate / 100);

    // --- OTHER INCOME ---
    const otherIncome = state.otherIncomeEvents.reduce((sum, event) => {
      if (isDeceased && event.owner === deceasedPartner) {
        return sum; // Deceased other income drops to 0 starting from the year of death
      }
      const activeMonths = calcMonthsActive(y, event.startYear, event.startMonth, event.endYear, event.endMonth);
      return sum + (activeMonths * event.monthlyAmount);
    }, 0);

    const deemedYield = currentLiquidWealth * 0.04;
    const actualGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + wealthYieldIncome + otherIncome;
    const totalGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + deemedYield + otherIncome;
    
    const isUpTo2028 = y <= 2028;
    const eigenmietwert = isUpTo2028 ? (Number(state.housing.eigenmietwert) || 0) : 0;

    // --- EXPENSES ---
    const mortgageInterest =
      (Number(state.housing.saronAmount) || 0) * ((Number(state.housing.saronRate) || 0) / 100) +
      (Number(state.housing.festAmount) || 0) * ((Number(state.housing.festRate) || 0) / 100);

    const amortisation = Number(state.housing.amortisation) || 0;
    const propertyMaintenance = (Number(state.housing.efhTaxValue) || 0) * ((Number(state.housing.unterhaltRate) || 0) / 100);

    const bankLendingValue = Number(state.housing.bankLendingValue) || 1000000;
    const mortgageDebt = (Number(state.housing.saronAmount) || 0) + (Number(state.housing.festAmount) || 0);
    const imputedCosts = (mortgageDebt * 0.05) + (bankLendingValue * 0.01) + amortisation;
    const affordabilityRatio = totalGrossIncome > 0 ? (imputedCosts / totalGrossIncome) * 100 : 0;

    // Krankenkasse premium drops to 50% for single survivor
    let krankenkasse = Number(state.health.krankenkasseBase) || 0;
    if (isDeceased) {
      krankenkasse = krankenkasse * 0.5;
    }
    if (state.health.applyAgeIncrease && index > 0) {
      krankenkasse = krankenkasse * Math.pow(1 + ((Number(state.health.ageIncreaseRate) || 0) / 100), index);
    }

    const stromHeizung = Number(state.housing.stromHeizung) || 0;

    // Apply expense reduction factor to variable expenses
    const expenseReduction = isDeceased ? (state.survivor?.expenseReductionFactor ?? 70) / 100 : 1.0;
    
    const haushaltEssen = (Number(state.living.haushaltEssen) || 0) * expenseReduction;
    const mobilitaet = Number(state.living.mobilitaet) || 0;
    const telefonHandyMedien = Number(state.living.telefonHandyMedien) || 0;
    const kleiderFreizeit = (Number(state.living.kleiderFreizeit) || 0) * expenseReduction;
    const ferienReisen = (Number(state.living.ferienReisen) || 0) * expenseReduction;
    const versicherungenSonstige = Number(state.living.versicherungenSonstige) || 0;
    
    const zahnarztOptiker = (Number(state.health.zahnarztOptiker) || 0) * expenseReduction;
    const diversesReserve = (Number(state.health.diversesReserve) || 0) * expenseReduction;

    const variableKosten = haushaltEssen + kleiderFreizeit + ferienReisen + zahnarztOptiker + diversesReserve;

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

    const housingTotal = (mortgageInterest + amortisation + propertyMaintenance + stromHeizung) * inflationFactor + housingCapEx;
    const livingTotal = (haushaltEssen + mobilitaet + telefonHandyMedien + kleiderFreizeit + ferienReisen + versicherungenSonstige) * inflationFactor + livingCapEx;
    const healthTotal = (krankenkasse + zahnarztOptiker + diversesReserve) * inflationFactor + healthCapEx;

    const totalOutflowExclTaxes = housingTotal + livingTotal + healthTotal;
    const fixedCosts = (mortgageInterest + amortisation + propertyMaintenance + krankenkasse + stromHeizung + mobilitaet + telefonHandyMedien + versicherungenSonstige) * inflationFactor;

    // --- WITHDRAWALS & TAXES ---
    let capitalWithdrawalAmount = 0;

    // Markus PK Payout
    if (!pkCapitalWithdrawnMarkus && pkCapitalMarkus > 0) {
      const isMarkusDeceased = deceasedPartner === 'Markus' && y >= deathYear;
      const markusDiedPreRetirement = deceasedPartner === 'Markus' && deathYear < state.pensionskasseMarkus.startYear;
      
      let shouldPayMarkus = false;
      if (isMarkusDeceased) {
        if (markusDiedPreRetirement) {
          shouldPayMarkus = y === deathYear;
        } else {
          shouldPayMarkus = y >= 2031 ? (state.pensionskasseMarkus.startYear >= 2031) : (y === state.pensionskasseMarkus.startYear);
        }
      } else {
        shouldPayMarkus = y >= 2031 ? (state.pensionskasseMarkus.startYear >= 2031) : (y === state.pensionskasseMarkus.startYear);
      }

      if (shouldPayMarkus) {
        currentLiquidWealth += pkCapitalMarkus;
        capitalWithdrawalAmount += pkCapitalMarkus;
        pkCapitalWithdrawnMarkus = true;
      }
    }

    // Monique PK Payout
    if (!pkCapitalWithdrawnMonique && pkCapitalMonique > 0) {
      const isMoniqueDeceased = deceasedPartner === 'Monique' && y >= deathYear;
      const moniqueDiedPreRetirement = deceasedPartner === 'Monique' && deathYear < state.pensionskasseMonique.startYear;

      let shouldPayMonique = false;
      if (isMoniqueDeceased) {
        if (moniqueDiedPreRetirement) {
          shouldPayMonique = y === deathYear;
        } else {
          shouldPayMonique = y >= 2031 ? (state.pensionskasseMonique.startYear >= 2031) : (y === state.pensionskasseMonique.startYear);
        }
      } else {
        shouldPayMonique = y >= 2031 ? (state.pensionskasseMonique.startYear >= 2031) : (y === state.pensionskasseMonique.startYear);
      }

      if (shouldPayMonique) {
        currentLiquidWealth += pkCapitalMonique;
        capitalWithdrawalAmount += pkCapitalMonique;
        pkCapitalWithdrawnMonique = true;
      }
    }

    const isSaeule3aWithdrawal = () => {
      const wYear = state.assets.saeule3a.withdrawalYear;
      if (!wYear || current3a <= 0) return false;
      const parsed = parseInt(wYear);
      if (y >= 2031) {
        return !isNaN(parsed) && parsed >= 2031 && current3a > 0;
      }
      return String(y) === wYear;
    };

    if (isSaeule3aWithdrawal()) {
      currentLiquidWealth += current3a;
      capitalWithdrawalAmount += current3a;
      current3a = 0;
    }

    const isFzkWithdrawal = () => {
      const wYear = state.assets.freizuegigkeitskonto.withdrawalYear;
      if (!wYear || currentFzk <= 0) return false;
      const parsed = parseInt(wYear);
      if (y >= 2031) {
        return !isNaN(parsed) && parsed >= 2031 && currentFzk > 0;
      }
      return String(y) === wYear;
    };

    if (isFzkWithdrawal()) {
      currentLiquidWealth += currentFzk;
      capitalWithdrawalAmount += currentFzk;
      currentFzk = 0;
    }

    const deductibleCapEx = state.capExEvents
      .filter(event => event.year === yearKey && event.isTaxDeductible)
      .reduce((sum, event) => sum + (Number(event.amount) || 0), 0);

    const strategy = new Aargau2025Strategy();

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

    const deductionsResult = strategy.calculateDeductions(
      actualGrossIncome + eigenmietwert,
      civilStatus,
      [],
      memberExpenses,
      [salaryIncome]
    );

    const taxableIncome = Math.max(0, actualGrossIncome + eigenmietwert - deductionsResult.canton);
    const taxableIncomeFederal = Math.max(0, actualGrossIncome + eigenmietwert - deductionsResult.federal);

    const efhTaxValue = Number(state.housing.efhTaxValue) || 0;
    const taxableWealth = Math.max(0, currentLiquidWealth + current3a + efhTaxValue - mortgageDebt);
    const netWealth = Math.max(0, taxableWealth - 200000);

    const simpleTaxes = strategy.calculateSimpleTax(
      taxableIncome,
      taxableIncomeFederal,
      netWealth,
      civilStatus
    );

    const cantonalIncomeTax = simpleTaxes.simpleIncomeCanton * multipliers.cantonal;
    const municipalIncomeTax = simpleTaxes.simpleIncomeCanton * multipliers.municipal;
    const churchIncomeTax = simpleTaxes.simpleIncomeCanton * multipliers.church;
    const federalIncomeTax = simpleTaxes.federalTax;

    const cantonalWealthTax = simpleTaxes.simpleWealthCanton * multipliers.cantonal;
    const municipalWealthTax = simpleTaxes.simpleWealthCanton * multipliers.municipal;
    const churchWealthTax = simpleTaxes.simpleWealthCanton * multipliers.church;

    let cantonalWithdrawalTax = 0;
    let municipalWithdrawalTax = 0;
    let churchWithdrawalTax = 0;
    let federalWithdrawalTax = 0;

    if (capitalWithdrawalAmount > 0) {
      const capitalSimpleTaxes = strategy.calculateSimpleTax(capitalWithdrawalAmount, 0, 0, civilStatus);
      
      const agWithdrawalTaxSimple = Math.max(
        capitalWithdrawalAmount * 0.01,
        capitalSimpleTaxes.simpleIncomeCanton * 0.30
      );

      const federalWithdrawalTaxCalculated = Math.max(
        capitalWithdrawalAmount * 0.02,
        capitalSimpleTaxes.federalTax * 0.20
      );

      cantonalWithdrawalTax = agWithdrawalTaxSimple * multipliers.cantonal;
      municipalWithdrawalTax = agWithdrawalTaxSimple * multipliers.municipal;
      churchWithdrawalTax = agWithdrawalTaxSimple * multipliers.church;
      federalWithdrawalTax = federalWithdrawalTaxCalculated;
    }

    const ordinaryCantonal = cantonalIncomeTax + cantonalWealthTax;
    const ordinaryMunicipal = municipalIncomeTax + municipalWealthTax;
    const ordinaryFederal = federalIncomeTax;
    const ordinaryChurch = churchIncomeTax + churchWealthTax;

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

    const surplusDeficit = actualGrossIncome - totalOutflowExclTaxes - totalTaxBurden;
    currentLiquidWealth += surplusDeficit;

    const guaranteedIncome = ahvIncome + pkRenteIncome;
    const coverageRatio = fixedCosts > 0 ? (guaranteedIncome / fixedCosts) * 100 : 0;

    let capMarkus = 0;
    if (!pkCapitalWithdrawnMarkus) {
      if (deceasedPartner === 'Markus' && y >= deathYear) {
        if (y < Math.min(state.pensionskasseMarkus.startYear, deathYear)) {
          capMarkus = state.pensionskasseMarkus.totalCapital;
        }
      } else {
        if (y < state.pensionskasseMarkus.startYear) {
          capMarkus = state.pensionskasseMarkus.totalCapital;
        }
      }
    }

    let capMonique = 0;
    if (!pkCapitalWithdrawnMonique) {
      if (deceasedPartner === 'Monique' && y >= deathYear) {
        if (y < Math.min(state.pensionskasseMonique.startYear, deathYear)) {
          capMonique = state.pensionskasseMonique.totalCapital;
        }
      } else {
        if (y < state.pensionskasseMonique.startYear) {
          capMonique = state.pensionskasseMonique.totalCapital;
        }
      }
    }

    const pensionskasseCapitalEnd = capMarkus + capMonique;

    yearResults[y] = {
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
      pensionskasseCapitalEnd,
      totalWealthEnd: currentLiquidWealth + current3a + currentFzk + pensionskasseCapitalEnd + (efhTaxValue - mortgageDebt),
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

    trajectory.push({
      year: y,
      liquidWealth: currentLiquidWealth,
      pensionWealth: current3a + currentFzk + pensionskasseCapitalEnd,
      realEstateEquity: efhTaxValue - mortgageDebt,
      totalWealth: currentLiquidWealth + current3a + currentFzk + pensionskasseCapitalEnd + (efhTaxValue - mortgageDebt)
    });
  }

  // Populate planning columns (2026, 2027, 2028, 2029, 2030, 2031+)
  YEARS.forEach(yearKey => {
    const yearNum = yearKey === '2031+' ? 2031 : parseInt(yearKey);
    result[yearKey] = yearResults[yearNum];
  });

  // Calculate Cumulative KPIs from yearResults 2026 to 2060
  let totalTaxPaid = 0;
  let totalSavings = 0;
  for (let y = 2026; y <= 2060; y++) {
    totalTaxPaid += yearResults[y].totalTaxBurden;
    totalSavings += yearResults[y].surplusDeficit;
  }

  const netWealth2060 = trajectory[trajectory.length - 1]?.totalWealth || 0;
  const liquidWealth2060 = trajectory[trajectory.length - 1]?.liquidWealth || 0;

  const cumulativeKPIs = {
    totalTaxPaid,
    totalSavings,
    netWealth2060,
    liquidWealth2060
  };

  return { data: result, trajectory, cumulativeKPIs, yearResults };
}

export function runMonteCarlo(state: PlanningState, renteSplit: number, liquidYieldRateOverride?: number, runs = 100) {
  let belowStartingCount = 0;
  let depletedCount = 0;
  
  const startingWealth = state.assets.startingLiquidWealth;
  const detResults = runProjection(state, renteSplit, liquidYieldRateOverride);
  const { yearResults } = detResults;
  
  const renteSplitMarkus = renteSplit;
  const renteSplitMonique = renteSplit;

  const pkCapitalMarkus = state.pensionskasseMarkus.totalCapital * ((100 - renteSplitMarkus) / 100);
  const pkCapitalMonique = state.pensionskasseMonique.totalCapital * ((100 - renteSplitMonique) / 100);

  const deceasedPartner = state.survivor?.deceasedPartner || 'Keiner';
  const deathYear = state.survivor?.deathYear ?? 2035;

  const randomNormal = (mean: number, stdDev: number) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
  };
  
  for (let r = 0; r < runs; r++) {
    let cash = startingWealth;
    let active3a = state.assets.saeule3a.balance;
    let activeFzk = state.assets.freizuegigkeitskonto.balance;
    
    let pkCapitalWithdrawnMarkus = false;
    let pkCapitalWithdrawnMonique = false;

    let droppedBelowStarting = false;
    let depleted = false;
    
    for (let year = 2026; year <= 2060; year++) {
      const detYear = yearResults[year];
      if (!detYear) continue;
      
      // Markus PK Payout
      if (!pkCapitalWithdrawnMarkus && pkCapitalMarkus > 0) {
        const isMarkusDeceased = deceasedPartner === 'Markus' && year >= deathYear;
        const markusDiedPreRetirement = deceasedPartner === 'Markus' && deathYear < state.pensionskasseMarkus.startYear;
        
        let shouldPayMarkus = false;
        if (isMarkusDeceased) {
          if (markusDiedPreRetirement) {
            shouldPayMarkus = year === deathYear;
          } else {
            shouldPayMarkus = year === state.pensionskasseMarkus.startYear;
          }
        } else {
          shouldPayMarkus = year === state.pensionskasseMarkus.startYear;
        }

        if (shouldPayMarkus) {
          cash += pkCapitalMarkus;
          pkCapitalWithdrawnMarkus = true;
        }
      }

      // Monique PK Payout
      if (!pkCapitalWithdrawnMonique && pkCapitalMonique > 0) {
        const isMoniqueDeceased = deceasedPartner === 'Monique' && year >= deathYear;
        const moniqueDiedPreRetirement = deceasedPartner === 'Monique' && deathYear < state.pensionskasseMonique.startYear;

        let shouldPayMonique = false;
        if (isMoniqueDeceased) {
          if (moniqueDiedPreRetirement) {
            shouldPayMonique = year === deathYear;
          } else {
            shouldPayMonique = year === state.pensionskasseMonique.startYear;
          }
        } else {
          shouldPayMonique = year === state.pensionskasseMonique.startYear;
        }

        if (shouldPayMonique) {
          cash += pkCapitalMonique;
          pkCapitalWithdrawnMonique = true;
        }
      }

      if (parseInt(state.assets.saeule3a.withdrawalYear) === year || (year >= 2031 && parseInt(state.assets.saeule3a.withdrawalYear) >= 2031 && active3a > 0)) {
        cash += active3a;
        active3a = 0;
      }
      if (parseInt(state.assets.freizuegigkeitskonto.withdrawalYear) === year || (year >= 2031 && parseInt(state.assets.freizuegigkeitskonto.withdrawalYear) >= 2031 && activeFzk > 0)) {
        cash += activeFzk;
        activeFzk = 0;
      }
      
      // 2. Base Cash Flow (deterministic items except yield)
      const baseCashFlow = detYear.surplusDeficit - detYear.wealthYieldIncome;
      
      // 3. Volatile Yield (mean = baseline yield, stdDev = 5.5% volatility)
      const meanYield = (liquidYieldRateOverride !== undefined ? liquidYieldRateOverride : state.baseline.liquidYieldRate) / 100;
      const stdDev = 0.055;
      const randomYield = Math.max(-0.15, randomNormal(meanYield, stdDev)); // floor at -15%
      const randomYieldIncome = cash * randomYield;
      
      // 4. Update Cash
      cash += baseCashFlow + randomYieldIncome;
      
      if (cash < startingWealth) {
        droppedBelowStarting = true;
      }
      if (cash < 0) {
        depleted = true;
      }
    }
    
    if (droppedBelowStarting) belowStartingCount++;
    if (depleted) depletedCount++;
  }
  
  return {
    riskOfDropping: (belowStartingCount / runs) * 100,
    riskOfDepletion: (depletedCount / runs) * 100
  };
}

export const useCalculations = () => {
  const { state } = usePlanning();

  const results = useMemo(() => {
    return runProjection(state);
  }, [state]);

  return results;
};

