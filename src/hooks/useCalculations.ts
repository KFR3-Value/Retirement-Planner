import { useMemo } from 'react';
import { usePlanning, type YearKey, YEARS, type PlanningState, defaultState } from '../context/PlanningContext';

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
  actualGrossIncome: number;
  stressGrossIncome: number;
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

function resolveVal(state: PlanningState, path: string): any {
  const parts = path.split('.');
  
  // Helper to safely get nested value
  const getNested = (obj: any, pathParts: string[]): any => {
    let curr = obj;
    for (const part of pathParts) {
      if (curr === null || curr === undefined) return undefined;
      curr = curr[part];
    }
    return curr;
  };

  // 1. Try ScenarioOverrides
  const valOverrides = getNested(state.scenarioOverrides, parts);
  if (valOverrides !== undefined) return valOverrides;

  // 2. Try ClientBaseline
  const valBaseline = getNested(state.clientBaseline, parts);
  if (valBaseline !== undefined) return valBaseline;

  // 3. Try GlobalAssumptions
  const valAssumptions = getNested(state.globalAssumptions, parts);
  if (valAssumptions !== undefined) return valAssumptions;

  // 4. Try flat fallback on any level if parts has length > 1
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if ((state.scenarioOverrides as any)[lastPart] !== undefined) return (state.scenarioOverrides as any)[lastPart];
    if ((state.clientBaseline as any)[lastPart] !== undefined) return (state.clientBaseline as any)[lastPart];
    if ((state.globalAssumptions as any)[lastPart] !== undefined) return (state.globalAssumptions as any)[lastPart];
  }

  return undefined;
}

const resolveNum = (state: PlanningState, path: string, fallback: number): number => {
  const v = resolveVal(state, path);
  if (v === undefined || v === null) return fallback;
  const num = Number(v);
  return isNaN(num) ? fallback : num;
};

const resolveBool = (state: PlanningState, path: string, fallback: boolean): boolean => {
  const v = resolveVal(state, path);
  if (v === undefined || v === null) return fallback;
  return Boolean(v);
};

const resolveStr = (state: PlanningState, path: string, fallback: string): string => {
  const v = resolveVal(state, path);
  if (v === undefined || v === null) return fallback;
  return String(v);
};

export function runProjection(state: PlanningState, pkRenteSplitOverride?: number, liquidYieldRateOverride?: number) {
  const result: Record<YearKey, YearData> = {} as any;
  const yearResults: Record<number, YearData> = {};
  const trajectory: any[] = [];

  let currentLiquidWealth = resolveNum(state, 'assets.startingLiquidWealth', defaultState.clientBaseline.assets.startingLiquidWealth);
  let current3a = resolveNum(state, 'assets.saeule3a.balance', defaultState.clientBaseline.assets.saeule3a.balance);
  let currentFzk = resolveNum(state, 'assets.freizuegigkeitskonto.balance', defaultState.clientBaseline.assets.freizuegigkeitskonto.balance);
  let pkCapitalWithdrawnMarkus = false;
  let pkCapitalWithdrawnMonique = false;

  const renteSplitMarkus = pkRenteSplitOverride !== undefined 
    ? pkRenteSplitOverride 
    : resolveNum(state, 'pensionskasseMarkus.renteSplit', defaultState.scenarioOverrides.pensionskasseMarkus.renteSplit);
  const renteSplitMonique = pkRenteSplitOverride !== undefined 
    ? pkRenteSplitOverride 
    : resolveNum(state, 'pensionskasseMonique.renteSplit', defaultState.scenarioOverrides.pensionskasseMonique.renteSplit);

  const totalCapitalMarkus = resolveNum(state, 'pensionskasseMarkus.totalCapital', defaultState.scenarioOverrides.pensionskasseMarkus.totalCapital);
  const totalCapitalMonique = resolveNum(state, 'pensionskasseMonique.totalCapital', defaultState.scenarioOverrides.pensionskasseMonique.totalCapital);

  const umwandlungssatzMarkus = resolveVal(state, 'pensionskasseMarkus.umwandlungssatz') 
    ?? resolveVal(state, 'baseUmwandlungssatzMarkus') 
    ?? defaultState.scenarioOverrides.pensionskasseMarkus.umwandlungssatz;
  const umwandlungssatzMonique = resolveVal(state, 'pensionskasseMonique.umwandlungssatz') 
    ?? resolveVal(state, 'baseUmwandlungssatzMonique') 
    ?? defaultState.scenarioOverrides.pensionskasseMonique.umwandlungssatz;

  const pkRenteFullYearMarkus = totalCapitalMarkus * (renteSplitMarkus / 100) * (Number(umwandlungssatzMarkus) / 100);
  const pkRenteFullYearMonique = totalCapitalMonique * (renteSplitMonique / 100) * (Number(umwandlungssatzMonique) / 100);

  const pkCapitalMarkus = totalCapitalMarkus * ((100 - renteSplitMarkus) / 100);
  const pkCapitalMonique = totalCapitalMonique * ((100 - renteSplitMonique) / 100);

  const deceasedPartner = resolveStr(state, 'survivor.deceasedPartner', defaultState.scenarioOverrides.survivor?.deceasedPartner ?? 'Keiner');
  const deathYear = resolveNum(state, 'survivor.deathYear', defaultState.scenarioOverrides.survivor?.deathYear ?? 2035);

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

    // Calculate Inflation Factor
    const applyInflation = resolveBool(state, 'applyInflation', defaultState.globalAssumptions.applyInflation);
    const inflationRate = resolveNum(state, 'inflationRate', defaultState.globalAssumptions.inflationRate);
    let inflationFactor = 1.0;
    if (applyInflation) {
       inflationFactor = Math.pow(1 + (inflationRate / 100), y - 2026);
    }

    const isDeceased = deceasedPartner !== 'Keiner' && y >= deathYear;
    const civilStatus = isDeceased ? 'single' : 'married';

    // --- INCOME ---
    let ahvIncome = 0;
    const ahvState = resolveVal(state, 'ahv') ?? defaultState.clientBaseline.ahv;
    const activeScenario = ahvState.scenarios.find((s: any) => s.id === ahvState.selectedScenarioId) || ahvState.scenarios[0];

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
    const pkStartYearMarkus = resolveNum(state, 'pensionskasseMarkus.startYear', defaultState.scenarioOverrides.pensionskasseMarkus.startYear);
    const pkStartMonthMarkus = resolveNum(state, 'pensionskasseMarkus.startMonth', defaultState.scenarioOverrides.pensionskasseMarkus.startMonth);
    const pkEndYearMarkus = resolveVal(state, 'pensionskasseMarkus.endYear') !== undefined 
      ? resolveNum(state, 'pensionskasseMarkus.endYear', 2099) 
      : (defaultState.scenarioOverrides.pensionskasseMarkus.endYear ?? 2099);
    const pkEndMonthMarkus = resolveVal(state, 'pensionskasseMarkus.endMonth') !== undefined 
      ? resolveNum(state, 'pensionskasseMarkus.endMonth', 11) 
      : (defaultState.scenarioOverrides.pensionskasseMarkus.endMonth ?? 11);

    const pkStartYearMonique = resolveNum(state, 'pensionskasseMonique.startYear', defaultState.scenarioOverrides.pensionskasseMonique.startYear);
    const pkStartMonthMonique = resolveNum(state, 'pensionskasseMonique.startMonth', defaultState.scenarioOverrides.pensionskasseMonique.startMonth);
    const pkEndYearMonique = resolveVal(state, 'pensionskasseMonique.endYear') !== undefined 
      ? resolveNum(state, 'pensionskasseMonique.endYear', 2099) 
      : (defaultState.scenarioOverrides.pensionskasseMonique.endYear ?? 2099);
    const pkEndMonthMonique = resolveVal(state, 'pensionskasseMonique.endMonth') !== undefined 
      ? resolveNum(state, 'pensionskasseMonique.endMonth', 11) 
      : (defaultState.scenarioOverrides.pensionskasseMonique.endMonth ?? 11);

    for (let m = 0; m < 12; m++) {
      // 1. Markus PK Rente Contribution
      let rentMarkus = 0;
      const isRetiredMarkus = y > pkStartYearMarkus || (y === pkStartYearMarkus && m >= pkStartMonthMarkus);
      const isActiveMarkus = isRetiredMarkus && (y < pkEndYearMarkus || (y === pkEndYearMarkus && m <= pkEndMonthMarkus));
      if (isActiveMarkus) {
        if (deceasedPartner === 'Markus' && y >= deathYear) {
          const pkSurvivorRate = resolveNum(state, 'survivor.pkSurvivorRate', defaultState.scenarioOverrides.survivor?.pkSurvivorRate ?? 60);
          rentMarkus = (pkRenteFullYearMarkus / 12) * (pkSurvivorRate / 100);
        } else {
          rentMarkus = pkRenteFullYearMarkus / 12;
        }
      }

      // 2. Monique PK Rente Contribution
      let rentMonique = 0;
      const isRetiredMonique = y > pkStartYearMonique || (y === pkStartYearMonique && m >= pkStartMonthMonique);
      const isActiveMonique = isRetiredMonique && (y < pkEndYearMonique || (y === pkEndYearMonique && m <= pkEndMonthMonique));
      if (isActiveMonique) {
        if (deceasedPartner === 'Monique' && y >= deathYear) {
          const pkSurvivorRate = resolveNum(state, 'survivor.pkSurvivorRate', defaultState.scenarioOverrides.survivor?.pkSurvivorRate ?? 60);
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
      const salaryStreams = resolveVal(state, 'salaryStreams') ?? defaultState.clientBaseline.salaryStreams;
      for (const stream of salaryStreams || []) {
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
    const liquidYieldRate = resolveNum(state, 'liquidYieldRate', defaultState.globalAssumptions.liquidYieldRate);
    const yieldRate = liquidYieldRateOverride !== undefined ? liquidYieldRateOverride : liquidYieldRate;
    const taxableYieldRate = Math.min(1.5, yieldRate);
    const taxFreeYieldRate = Math.max(0, yieldRate - taxableYieldRate);
    
    const wealthYieldIncome = currentLiquidWealth * (taxableYieldRate / 100);
    const taxFreeAppreciation = currentLiquidWealth * (taxFreeYieldRate / 100);

    // --- OTHER INCOME ---
    const otherIncomeEvents = resolveVal(state, 'otherIncomeEvents') ?? defaultState.clientBaseline.otherIncomeEvents;
    const otherIncome = (otherIncomeEvents || []).reduce((sum: number, event: any) => {
      if (isDeceased && event.owner === deceasedPartner) {
        return sum; // Deceased other income drops to 0 starting from the year of death
      }
      const activeMonths = calcMonthsActive(y, event.startYear, event.startMonth, event.endYear, event.endMonth);
      return sum + (activeMonths * event.monthlyAmount);
    }, 0);

    const deemedYield = currentLiquidWealth * 0.04;
    const actualGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + wealthYieldIncome + otherIncome;
    const totalGrossIncome = actualGrossIncome;
    const stressGrossIncome = salaryIncome + ahvIncome + pkRenteIncome + deemedYield + otherIncome;
    
    const isUpTo2028 = y <= 2028;
    const eigenmietwertVal = resolveNum(state, 'housing.eigenmietwert', defaultState.clientBaseline.housing.eigenmietwert);
    const eigenmietwert = isUpTo2028 ? eigenmietwertVal : 0;

    // --- EXPENSES ---
    const housingSaronAmount = resolveNum(state, 'housing.saronAmount', defaultState.clientBaseline.housing.saronAmount);
    const housingSaronRate = resolveNum(state, 'housing.saronRate', defaultState.clientBaseline.housing.saronRate);
    const housingFestAmount = resolveNum(state, 'housing.festAmount', defaultState.clientBaseline.housing.festAmount);
    const housingFestRate = resolveNum(state, 'housing.festRate', defaultState.clientBaseline.housing.festRate);

    const mortgageInterest =
      (housingSaronAmount * (housingSaronRate / 100)) +
      (housingFestAmount * (housingFestRate / 100));

    const amortisation = resolveNum(state, 'housing.amortisation', defaultState.clientBaseline.housing.amortisation);
    
    // Apply inflation universally to individual expense lines (except mortgage interest and amortisation)
    const housingEfhTaxValue = resolveNum(state, 'housing.efhTaxValue', defaultState.clientBaseline.housing.efhTaxValue);
    const housingUnterhaltRate = resolveNum(state, 'housing.unterhaltRate', defaultState.clientBaseline.housing.unterhaltRate);
    const propertyMaintenance = housingEfhTaxValue * (housingUnterhaltRate / 100) * inflationFactor;
    
    const housingStromHeizung = resolveNum(state, 'housing.stromHeizung', defaultState.clientBaseline.housing.stromHeizung);
    const stromHeizung = housingStromHeizung * inflationFactor;

    const bankLendingValue = resolveNum(state, 'housing.bankLendingValue', defaultState.clientBaseline.housing.bankLendingValue);
    const mortgageDebt = housingSaronAmount + housingFestAmount;
    const imputedCosts = (mortgageDebt * 0.05) + (bankLendingValue * 0.01) + amortisation;
    const affordabilityRatio = stressGrossIncome > 0 ? (imputedCosts / stressGrossIncome) * 100 : 0;

    // Krankenkasse premium drops to 50% for single survivor
    const healthKrankenkasseBase = resolveNum(state, 'health.krankenkasseBase', defaultState.clientBaseline.health.krankenkasseBase);
    const healthApplyAgeIncrease = resolveBool(state, 'health.applyAgeIncrease', defaultState.clientBaseline.health.applyAgeIncrease);
    const healthAgeIncreaseRate = resolveNum(state, 'health.ageIncreaseRate', defaultState.clientBaseline.health.ageIncreaseRate);

    let krankenkasse = healthKrankenkasseBase;
    if (isDeceased) {
      krankenkasse = krankenkasse * 0.5;
    }
    if (healthApplyAgeIncrease && index > 0) {
      krankenkasse = krankenkasse * Math.pow(1 + (healthAgeIncreaseRate / 100), index);
    }
    krankenkasse = krankenkasse * inflationFactor;

    // Apply expense reduction factor to variable expenses
    const expenseReductionFactor = resolveNum(state, 'survivor.expenseReductionFactor', defaultState.scenarioOverrides.survivor?.expenseReductionFactor ?? 70);
    const expenseReduction = isDeceased ? (expenseReductionFactor / 100) : 1.0;
    
    const livingHaushaltEssen = resolveNum(state, 'living.haushaltEssen', defaultState.clientBaseline.living.haushaltEssen);
    const livingMobilitaet = resolveNum(state, 'living.mobilitaet', defaultState.clientBaseline.living.mobilitaet);
    const livingTelefonHandyMedien = resolveNum(state, 'living.telefonHandyMedien', defaultState.clientBaseline.living.telefonHandyMedien);
    const livingKleiderFreizeit = resolveNum(state, 'living.kleiderFreizeit', defaultState.clientBaseline.living.kleiderFreizeit);
    const livingFerienReisen = resolveNum(state, 'living.ferienReisen', defaultState.clientBaseline.living.ferienReisen);
    const livingVersicherungenSonstige = resolveNum(state, 'living.versicherungenSonstige', defaultState.clientBaseline.living.versicherungenSonstige);

    const haushaltEssen = livingHaushaltEssen * expenseReduction * inflationFactor;
    const mobilitaet = livingMobilitaet * inflationFactor;
    const telefonHandyMedien = livingTelefonHandyMedien * inflationFactor;
    const kleiderFreizeit = livingKleiderFreizeit * expenseReduction * inflationFactor;
    const ferienReisen = livingFerienReisen * expenseReduction * inflationFactor;
    const versicherungenSonstige = livingVersicherungenSonstige * inflationFactor;
    
    const healthZahnarztOptiker = resolveNum(state, 'health.zahnarztOptiker', defaultState.clientBaseline.health.zahnarztOptiker);
    const healthDiversesReserve = resolveNum(state, 'health.diversesReserve', defaultState.clientBaseline.health.diversesReserve);

    const zahnarztOptiker = healthZahnarztOptiker * expenseReduction * inflationFactor;
    const diversesReserve = healthDiversesReserve * expenseReduction * inflationFactor;

    const variableKosten = haushaltEssen + kleiderFreizeit + ferienReisen + zahnarztOptiker + diversesReserve;

    const capExEvents = resolveVal(state, 'capExEvents') ?? defaultState.scenarioOverrides.capExEvents;

    const housingCapEx = capExEvents
      .filter((event: any) => event.year === yearKey && (event.category === 'housing' || (!event.category && (event.description.toLowerCase().includes('renovation') || event.description.toLowerCase().includes('garten')))))
      .reduce((sum: number, event: any) => sum + (Number(event.amount) || 0), 0);

    const healthCapEx = capExEvents
      .filter((event: any) => event.year === yearKey && event.category === 'health')
      .reduce((sum: number, event: any) => sum + (Number(event.amount) || 0), 0);

    const livingCapEx = capExEvents
      .filter((event: any) => event.year === yearKey && (event.category === 'living' || (!event.category && !event.description.toLowerCase().includes('renovation') && !event.description.toLowerCase().includes('garten'))))
      .reduce((sum: number, event: any) => sum + (Number(event.amount) || 0), 0);

    const capEx = housingCapEx + livingCapEx + healthCapEx;

    const housingTotal = mortgageInterest + amortisation + propertyMaintenance + stromHeizung + housingCapEx;
    const livingTotal = haushaltEssen + mobilitaet + telefonHandyMedien + kleiderFreizeit + ferienReisen + versicherungenSonstige + livingCapEx;
    const healthTotal = krankenkasse + zahnarztOptiker + diversesReserve + healthCapEx;

    const totalOutflowExclTaxes = housingTotal + livingTotal + healthTotal;
    const fixedCosts = mortgageInterest + amortisation + propertyMaintenance + krankenkasse + stromHeizung + mobilitaet + telefonHandyMedien + versicherungenSonstige;

    // --- WITHDRAWALS & TAXES ---
    let capitalWithdrawalAmount = 0;

    // Markus PK Payout
    if (!pkCapitalWithdrawnMarkus && pkCapitalMarkus > 0) {
      const isMarkusDeceased = deceasedPartner === 'Markus' && y >= deathYear;
      const markusDiedPreRetirement = deceasedPartner === 'Markus' && deathYear < pkStartYearMarkus;
      
      let shouldPayMarkus = false;
      if (isMarkusDeceased) {
        if (markusDiedPreRetirement) {
          shouldPayMarkus = y === deathYear;
        } else {
          shouldPayMarkus = y >= 2031 ? (pkStartYearMarkus >= 2031) : (y === pkStartYearMarkus);
        }
      } else {
        shouldPayMarkus = y >= 2031 ? (pkStartYearMarkus >= 2031) : (y === pkStartYearMarkus);
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
      const moniqueDiedPreRetirement = deceasedPartner === 'Monique' && deathYear < pkStartYearMonique;

      let shouldPayMonique = false;
      if (isMoniqueDeceased) {
        if (moniqueDiedPreRetirement) {
          shouldPayMonique = y === deathYear;
        } else {
          shouldPayMonique = y >= 2031 ? (pkStartYearMonique >= 2031) : (y === pkStartYearMonique);
        }
      } else {
        shouldPayMonique = y >= 2031 ? (pkStartYearMonique >= 2031) : (y === pkStartYearMonique);
      }

      if (shouldPayMonique) {
        currentLiquidWealth += pkCapitalMonique;
        capitalWithdrawalAmount += pkCapitalMonique;
        pkCapitalWithdrawnMonique = true;
      }
    }

    const saeule3aWithdrawalYear = resolveStr(state, 'assets.saeule3a.withdrawalYear', defaultState.clientBaseline.assets.saeule3a.withdrawalYear);
    const freizuegigkeitskontoWithdrawalYear = resolveStr(state, 'assets.freizuegigkeitskonto.withdrawalYear', defaultState.clientBaseline.assets.freizuegigkeitskonto.withdrawalYear);

    const isSaeule3aWithdrawal = () => {
      const wYear = saeule3aWithdrawalYear;
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
      const wYear = freizuegigkeitskontoWithdrawalYear;
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

    const deductibleCapEx = capExEvents
      .filter((event: any) => event.year === yearKey && event.isTaxDeductible)
      .reduce((sum: number, event: any) => sum + (Number(event.amount) || 0), 0);

    const strategy = new Aargau2025Strategy();

    const bettwilMultiplier = (multipliersData.response as any).find(
      (m: any) => m.Location && m.Location.City === 'Bettwil'
    );
    const cantonMultiplier = resolveNum(state, 'taxMultiplierCanton', bettwilMultiplier ? bettwilMultiplier.IncomeRateCanton / 100 : 1.11);
    const municipalMultiplier = resolveNum(state, 'taxMultiplierCommune', bettwilMultiplier ? bettwilMultiplier.IncomeRateCity / 100 : 1.02);
    const churchMultiplier = resolveNum(state, 'taxMultiplierChurch', bettwilMultiplier 
      ? (bettwilMultiplier.IncomeRateRoman + bettwilMultiplier.IncomeRateProtestant) / 200 
      : 0.19);

    const multipliers = {
      cantonal: cantonMultiplier,
      municipal: municipalMultiplier,
      church: churchMultiplier
    };

    const taxDeductions = resolveVal(state, 'taxDeductions') ?? defaultState.scenarioOverrides.taxDeductions;
    const yearlyDeductions = taxDeductions?.[yearKey] || {
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

    let deductionMortgageInterest = mortgageInterest;
    let deductionPropertyMaintenance = propertyMaintenance;
    if (y > 2028) {
      deductionPropertyMaintenance = 0;
      deductionMortgageInterest = Math.min(mortgageInterest, wealthYieldIncome);
    }

    const memberExpenses: ExpenseProfile[] = [{
      transport: Number(yearlyDeductions.transport) || 0,
      meal: Number(yearlyDeductions.meal) || 0,
      professional: Number(yearlyDeductions.professional) || 0,
      debtInterest: deductionMortgageInterest,
      maintenance: deductionPropertyMaintenance,
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

    const taxableWealth = Math.max(0, currentLiquidWealth + current3a + housingEfhTaxValue - mortgageDebt);
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
    currentLiquidWealth += surplusDeficit + taxFreeAppreciation;

    const guaranteedIncome = ahvIncome + pkRenteIncome;
    const coverageRatio = fixedCosts > 0 ? (guaranteedIncome / fixedCosts) * 100 : 0;

    let capMarkus = 0;
    if (!pkCapitalWithdrawnMarkus) {
      if (deceasedPartner === 'Markus' && y >= deathYear) {
        if (y < Math.min(pkStartYearMarkus, deathYear)) {
          capMarkus = totalCapitalMarkus;
        }
      } else {
        if (y < pkStartYearMarkus) {
          capMarkus = totalCapitalMarkus;
        }
      }
    }

    let capMonique = 0;
    if (!pkCapitalWithdrawnMonique) {
      if (deceasedPartner === 'Monique' && y >= deathYear) {
        if (y < Math.min(pkStartYearMonique, deathYear)) {
          capMonique = totalCapitalMonique;
        }
      } else {
        if (y < pkStartYearMonique) {
          capMonique = totalCapitalMonique;
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
      actualGrossIncome,
      stressGrossIncome,
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
      totalWealthEnd: currentLiquidWealth + current3a + currentFzk + pensionskasseCapitalEnd + (housingEfhTaxValue - mortgageDebt),
      efhTaxValue: housingEfhTaxValue,
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
      realEstateEquity: housingEfhTaxValue - mortgageDebt,
      totalWealth: currentLiquidWealth + current3a + currentFzk + pensionskasseCapitalEnd + (housingEfhTaxValue - mortgageDebt)
    });
  }

  // Populate planning columns (2026 to 2060)
  YEARS.forEach(yearKey => {
    const yearNum = parseInt(yearKey);
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
  
  const startingWealth = resolveNum(state, 'assets.startingLiquidWealth', defaultState.clientBaseline.assets.startingLiquidWealth);
  const detResults = runProjection(state, renteSplit, liquidYieldRateOverride);
  const { yearResults } = detResults;
  
  const renteSplitMarkus = renteSplit;
  const renteSplitMonique = renteSplit;

  const totalCapitalMarkus = resolveNum(state, 'pensionskasseMarkus.totalCapital', defaultState.scenarioOverrides.pensionskasseMarkus.totalCapital);
  const totalCapitalMonique = resolveNum(state, 'pensionskasseMonique.totalCapital', defaultState.scenarioOverrides.pensionskasseMonique.totalCapital);

  const pkCapitalMarkus = totalCapitalMarkus * ((100 - renteSplitMarkus) / 100);
  const pkCapitalMonique = totalCapitalMonique * ((100 - renteSplitMonique) / 100);

  const deceasedPartner = resolveStr(state, 'survivor.deceasedPartner', defaultState.scenarioOverrides.survivor?.deceasedPartner ?? 'Keiner');
  const deathYear = resolveNum(state, 'survivor.deathYear', defaultState.scenarioOverrides.survivor?.deathYear ?? 2035);

  const randomNormal = (mean: number, stdDev: number) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
  };
  
  const strategy = new Aargau2025Strategy();
  const bettwilMultiplier = (multipliersData.response as any).find(
    (m: any) => m.Location && m.Location.City === 'Bettwil'
  );
  const cantonMultiplier = resolveNum(state, 'taxMultiplierCanton', bettwilMultiplier ? bettwilMultiplier.IncomeRateCanton / 100 : 1.11);
  const municipalMultiplier = resolveNum(state, 'taxMultiplierCommune', bettwilMultiplier ? bettwilMultiplier.IncomeRateCity / 100 : 1.02);
  const churchMultiplier = resolveNum(state, 'taxMultiplierChurch', bettwilMultiplier 
    ? (bettwilMultiplier.IncomeRateRoman + bettwilMultiplier.IncomeRateProtestant) / 200 
    : 0.19);

  const multipliers = {
    cantonal: cantonMultiplier,
    municipal: municipalMultiplier,
    church: churchMultiplier
  };
  
  for (let r = 0; r < runs; r++) {
    let cash = startingWealth;
    let active3a = resolveNum(state, 'assets.saeule3a.balance', defaultState.clientBaseline.assets.saeule3a.balance);
    let activeFzk = resolveNum(state, 'assets.freizuegigkeitskonto.balance', defaultState.clientBaseline.assets.freizuegigkeitskonto.balance);
    
    let pkCapitalWithdrawnMarkus = false;
    let pkCapitalWithdrawnMonique = false;

    let droppedBelowStarting = false;
    let depleted = false;
    
    const pkStartYearMarkus = resolveNum(state, 'pensionskasseMarkus.startYear', defaultState.scenarioOverrides.pensionskasseMarkus.startYear);
    const pkStartYearMonique = resolveNum(state, 'pensionskasseMonique.startYear', defaultState.scenarioOverrides.pensionskasseMonique.startYear);
    
    const saeule3aWithdrawalYear = resolveStr(state, 'assets.saeule3a.withdrawalYear', defaultState.clientBaseline.assets.saeule3a.withdrawalYear);
    const freizuegigkeitskontoWithdrawalYear = resolveStr(state, 'assets.freizuegigkeitskonto.withdrawalYear', defaultState.clientBaseline.assets.freizuegigkeitskonto.withdrawalYear);

    for (let year = 2026; year <= 2060; year++) {
      const detYear = yearResults[year];
      if (!detYear) continue;
      
      // Markus PK Payout
      if (!pkCapitalWithdrawnMarkus && pkCapitalMarkus > 0) {
        const isMarkusDeceased = deceasedPartner === 'Markus' && year >= deathYear;
        const markusDiedPreRetirement = deceasedPartner === 'Markus' && deathYear < pkStartYearMarkus;
        
        let shouldPayMarkus = false;
        if (isMarkusDeceased) {
          if (markusDiedPreRetirement) {
            shouldPayMarkus = year === deathYear;
          } else {
            shouldPayMarkus = year === pkStartYearMarkus;
          }
        } else {
          shouldPayMarkus = year === pkStartYearMarkus;
        }

        if (shouldPayMarkus) {
          cash += pkCapitalMarkus;
          pkCapitalWithdrawnMarkus = true;
        }
      }

      // Monique PK Payout
      if (!pkCapitalWithdrawnMonique && pkCapitalMonique > 0) {
        const isMoniqueDeceased = deceasedPartner === 'Monique' && year >= deathYear;
        const moniqueDiedPreRetirement = deceasedPartner === 'Monique' && deathYear < pkStartYearMonique;

        let shouldPayMonique = false;
        if (isMoniqueDeceased) {
          if (moniqueDiedPreRetirement) {
            shouldPayMonique = year === deathYear;
          } else {
            shouldPayMonique = year === pkStartYearMonique;
          }
        } else {
          shouldPayMonique = year === pkStartYearMonique;
        }

        if (shouldPayMonique) {
          cash += pkCapitalMonique;
          pkCapitalWithdrawnMonique = true;
        }
      }

      const parsed3a = parseInt(saeule3aWithdrawalYear);
      if (parsed3a === year || (year >= 2031 && parsed3a >= 2031 && active3a > 0)) {
        cash += active3a;
        active3a = 0;
      }
      const parsedFzk = parseInt(freizuegigkeitskontoWithdrawalYear);
      if (parsedFzk === year || (year >= 2031 && parsedFzk >= 2031 && activeFzk > 0)) {
        cash += activeFzk;
        activeFzk = 0;
      }
      
      // 2. Base Cash Flow (deterministic items except yield and wealth tax)
      const baseCashFlow = detYear.surplusDeficit - detYear.wealthYieldIncome + detYear.wealthTax;
      
      // 3. Volatile Yield (mean = baseline yield, stdDev = 5.5% volatility)
      const liquidYieldRate = resolveNum(state, 'liquidYieldRate', defaultState.globalAssumptions.liquidYieldRate);
      const meanYield = (liquidYieldRateOverride !== undefined ? liquidYieldRateOverride : liquidYieldRate) / 100;
      const stdDev = 0.055;
      const randomYield = randomNormal(meanYield, stdDev); // no floor at -15%
      const randomYieldIncome = cash * randomYield;
      
      // Recalculate stochastic wealth tax
      const isDeceased = deceasedPartner !== 'Keiner' && year >= deathYear;
      const civilStatus = isDeceased ? 'single' : 'married';
      const efhTaxValue = resolveNum(state, 'housing.efhTaxValue', defaultState.clientBaseline.housing.efhTaxValue);
      const housingSaronAmount = resolveNum(state, 'housing.saronAmount', defaultState.clientBaseline.housing.saronAmount);
      const housingFestAmount = resolveNum(state, 'housing.festAmount', defaultState.clientBaseline.housing.festAmount);
      const mortgageDebt = housingSaronAmount + housingFestAmount;
      const taxableWealth = Math.max(0, cash + active3a + efhTaxValue - mortgageDebt);
      const netWealth = Math.max(0, taxableWealth - (civilStatus === 'married' ? 200000 : 100000));
      
      const simpleTaxes = strategy.calculateSimpleTax(0, 0, netWealth, civilStatus);
      const stochasticWealthTax = (simpleTaxes.simpleWealthCanton * multipliers.cantonal) +
                                  (simpleTaxes.simpleWealthCanton * multipliers.municipal) +
                                  (simpleTaxes.simpleWealthCanton * multipliers.church);
      
      // 4. Update Cash
      cash += baseCashFlow + randomYieldIncome - stochasticWealthTax;
      
      // Ensure the cash balance floors at zero
      if (cash < 0) {
        cash = 0;
      }
      
      if (cash < startingWealth) {
        droppedBelowStarting = true;
      }
      if (cash <= 0) {
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


