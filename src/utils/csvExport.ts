import { type PlanningState, YEARS } from '../context/PlanningContext';
import { runProjection } from '../hooks/useCalculations';

const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  // Replace double quotes with escaped double quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
};

export const generateAnalystCSV = (state: PlanningState): string => {
  const { data: yearDataMap } = runProjection(state);
  const rows: string[][] = [];

  // 1. Title Block
  rows.push(['# FINANZPLANUNG FAMILIE FREY - BERICHT FÜR FINANZANALYSTEN']);
  rows.push([`# Generiert am: ${new Date().toLocaleDateString('de-CH')} um ${new Date().toLocaleTimeString('de-CH')}`]);
  rows.push(['# HINWEIS: Alle Beträge in CHF, Zinssätze und Steuern in %']);
  rows.push([]);

  // 2. Assumptions & Parameters Block
  rows.push(['# 1. ANNAHMEN & PARAMETER']);
  rows.push(['Kategorie', 'Parameter', 'Wert', 'Einheit', 'Beschreibung']);

  const ga = state.globalAssumptions;
  const cb = state.clientBaseline;
  const so = state.scenarioOverrides;

  // Global Assumptions
  rows.push(['Wirtschaft', 'Inflationsrate', String(ga.inflationRate), '%', 'Erwartete jährliche Inflation']);
  rows.push(['Wirtschaft', 'Inflation auf Ausgaben anwenden', ga.applyInflation ? 'Ja' : 'Nein', '', 'Ob Inflation ab 2031 auf Lebenshaltungs- und Gesundheitskosten angewendet wird']);
  rows.push(['Wirtschaft', 'Rendite flüssige Mittel', String(ga.liquidYieldRate), '%', 'Rendite auf freien Ersparnissen']);
  rows.push(['Wirtschaft', 'Wohnort', 'Bettwil (AG)', '', 'Steuerlicher Wohnsitz']);
  rows.push(['Steuerfüsse', 'Kanton', String(ga.taxMultiplierCanton * 100), '%', 'Kantonssteuerfuss']);
  rows.push(['Steuerfüsse', 'Gemeinde', String(ga.taxMultiplierCommune * 100), '%', 'Gemeindesteuerfuss Bettwil']);
  rows.push(['Steuerfüsse', 'Kirche', String(ga.taxMultiplierChurch * 100), '%', 'Kirchensteuerfuss']);
  rows.push(['Pensionskasse', 'UWS Markus (Basis)', String(ga.baseUmwandlungssatzMarkus), '%', 'Basis-Umwandlungssatz Markus']);
  rows.push(['Pensionskasse', 'UWS Monique (Basis)', String(ga.baseUmwandlungssatzMonique), '%', 'Basis-Umwandlungssatz Monique']);

  // Assets starting values
  rows.push(['Vermögenswerte', 'Startguthaben Liquidität', String(cb.assets.startingLiquidWealth), 'CHF', 'Freies Vermögen (Startwert 2026)']);
  rows.push(['Vermögenswerte', 'Säule 3a Anfangssaldo', String(cb.assets.saeule3a.balance), 'CHF', 'Anfangssaldo Säule 3a']);
  rows.push(['Vermögenswerte', 'Säule 3a Auszahlungsjahr', cb.assets.saeule3a.withdrawalYear, '', 'Geplantes Jahr für den Bezug der Säule 3a']);
  rows.push(['Vermögenswerte', 'FZK Anfangssaldo', String(cb.assets.freizuegigkeitskonto.balance), 'CHF', 'Anfangssaldo Freizügigkeitskonto']);
  rows.push(['Vermögenswerte', 'FZK Auszahlungsjahr', cb.assets.freizuegigkeitskonto.withdrawalYear, '', 'Geplantes Jahr für den Bezug des Freizügigkeitskontos']);

  // Pensionskasse
  rows.push(['Pensionskasse Markus', 'Vorsorgekapital', String(so.pensionskasseMarkus.totalCapital), 'CHF', 'Aktuelles/erwartetes PK-Kapital']);
  rows.push(['Pensionskasse Markus', 'Rentenbezug Split', String(so.pensionskasseMarkus.renteSplit), '%', 'Anteil des PK-Guthabens, der als lebenslange Rente bezogen wird']);
  rows.push(['Pensionskasse Markus', 'Umwandlungssatz (Szenario)', String(so.pensionskasseMarkus.umwandlungssatz), '%', 'Effektiver Umwandlungssatz']);
  rows.push(['Pensionskasse Markus', 'Rentenstart Jahr', String(so.pensionskasseMarkus.startYear), '', 'Jahr des Rentenantritts']);
  rows.push(['Pensionskasse Markus', 'Rentenstart Monat', String(so.pensionskasseMarkus.startMonth + 1), '', 'Monat des Rentenantritts (1-12)']);

  rows.push(['Pensionskasse Monique', 'Vorsorgekapital', String(so.pensionskasseMonique.totalCapital), 'CHF', 'Aktuelles/erwartetes PK-Kapital']);
  rows.push(['Pensionskasse Monique', 'Rentenbezug Split', String(so.pensionskasseMonique.renteSplit), '%', 'Anteil des PK-Guthabens, der als Rente bezogen wird']);
  rows.push(['Pensionskasse Monique', 'Umwandlungssatz (Szenario)', String(so.pensionskasseMonique.umwandlungssatz), '%', 'Effektiver Umwandlungssatz']);
  rows.push(['Pensionskasse Monique', 'Rentenstart Jahr', String(so.pensionskasseMonique.startYear), '', 'Jahr des Rentenantritts']);
  rows.push(['Pensionskasse Monique', 'Rentenstart Monat', String(so.pensionskasseMonique.startMonth + 1), '', 'Monat des Rentenantritts (1-12)']);

  // Housing
  rows.push(['Liegenschaft', 'Eigenmietwert', String(cb.housing.eigenmietwert), 'CHF', 'Steuerbarer Eigenmietwert']);
  rows.push(['Liegenschaft', 'Steuerwert EFH', String(cb.housing.efhTaxValue), 'CHF', 'Steuerwert des Eigenheims']);
  rows.push(['Liegenschaft', 'Verkehrswert (Bank)', String(cb.housing.bankLendingValue), 'CHF', 'Verkehrswert des Eigenheims']);
  rows.push(['Liegenschaft', 'SARON Hypothek', String(cb.housing.saronAmount), 'CHF', 'Tranche SARON Hypothek']);
  rows.push(['Liegenschaft', 'SARON Zinssatz', String(cb.housing.saronRate), '%', 'SARON Zinssatz']);
  rows.push(['Liegenschaft', 'Festhypothek', String(cb.housing.festAmount), 'CHF', 'Tranche Festhypothek']);
  rows.push(['Liegenschaft', 'Festzinssatz', String(cb.housing.festRate), '%', 'Zinssatz Festhypothek']);
  rows.push(['Liegenschaft', 'Unterhaltsrate', String(cb.housing.unterhaltRate), '%', 'Jährlicher Unterhalt in % des Verkehrswerts']);
  rows.push(['Liegenschaft', 'Heizung & Strom', String(cb.housing.stromHeizung), 'CHF', 'Jährliche Nebenkosten']);
  rows.push(['Liegenschaft', 'Amortisation', String(cb.housing.amortisation), 'CHF', 'Jährliche Amortisation']);

  // AHV Scenario selected
  const ahvSelected = cb.ahv.scenarios.find(s => s.id === cb.ahv.selectedScenarioId) || cb.ahv.scenarios[0];
  rows.push(['AHV-Szenario', 'Ausgewähltes Szenario', ahvSelected.name, '', 'Aktiviertes AHV Renten-Szenario']);

  // Death Scenario Overrides
  if (so.survivor) {
    rows.push(['Todesfall-Simulation', 'Simulierter Todesfall', so.survivor.deceasedPartner, '', 'Simuliertes Ableben des Partners ("Keiner" / "Markus" / "Monique")']);
    rows.push(['Todesfall-Simulation', 'Todesjahr', String(so.survivor.deathYear), '', 'Jahr des Ablebens']);
    rows.push(['Todesfall-Simulation', 'Ausgaben-Reduktionsfaktor', String(so.survivor.expenseReductionFactor), '%', 'Reduktionsfaktor der Lebenshaltungskosten für den Hinterbliebenen']);
    rows.push(['Todesfall-Simulation', 'PK-Hinterlassenenrente-Quote', String(so.survivor.pkSurvivorRate), '%', 'Prozentsatz der PK-Rente für den Hinterbliebenen']);
  }

  rows.push([]);

  // 3. Current Salary Streams
  rows.push(['# 2. AKTIVE LOHNSTRÖME']);
  rows.push(['Beschreibung', 'Eigentümer', 'Typ', 'Monatsbetrag', 'Start-Jahr', 'Start-Monat', 'End-Jahr', 'End-Monat']);
  cb.salaryStreams.forEach(s => {
    rows.push([
      s.description,
      s.owner || 'Gemeinsam',
      s.inputType,
      String(s.amount),
      String(s.startYear),
      String(s.startMonth + 1),
      String(s.endYear),
      String(s.endMonth + 1)
    ]);
  });
  rows.push([]);

  // 4. Other Income Streams
  rows.push(['# 3. WEITERE EINKÜNFTE']);
  rows.push(['Beschreibung', 'Eigentümer', 'Monatsbetrag', 'Start-Jahr', 'Start-Monat', 'End-Jahr', 'End-Monat']);
  if (cb.otherIncomeEvents && cb.otherIncomeEvents.length > 0) {
    cb.otherIncomeEvents.forEach(o => {
      rows.push([
        o.description,
        o.owner || 'Gemeinsam',
        String(o.monthlyAmount),
        String(o.startYear),
        String(o.startMonth + 1),
        String(o.endYear),
        String(o.endMonth + 1)
      ]);
    });
  } else {
    rows.push(['Keine']);
  }
  rows.push([]);

  // 5. CapEx Events
  rows.push(['# 4. GEPLANTE INVESTITIONEN (CAPEX)']);
  rows.push(['Beschreibung', 'Kategorie', 'Betrag', 'Jahr', 'Steuerlich abziehbar']);
  if (so.capExEvents && so.capExEvents.length > 0) {
    so.capExEvents.forEach(c => {
      rows.push([
        c.description,
        c.category || 'living',
        String(c.amount),
        String(c.year),
        c.isTaxDeductible ? 'Ja' : 'Nein'
      ]);
    });
  } else {
    rows.push(['Keine']);
  }
  rows.push([]);

  // 6. Timeline Raw Figures Table
  rows.push(['# 5. DETAILPROJEKTION - JÄHRLICHE ROHDATEN (2026 - 2060)']);

  const headers = [
    'Jahr',
    'Alter Markus',
    'Alter Monique',
    // Incomes
    'Netto-Lohn',
    'AHV-Renteneinkommen',
    'PK-Renteneinkommen',
    'Vermögenserträge (Liquide)',
    'Sonstige Einkünfte',
    'Eigenmietwert',
    'Total Ordentliche Bruttoeinkünfte',
    'Tatsächliches Bruttoeinkommen',
    'Tragbarkeit Bruttoeinkommen (Stress)',
    'Kapitalbezüge (PK / Säule 3a)',
    // Housing Expenses
    'Hypothekarzinsen',
    'Amortisation',
    'Liegenschaftsunterhalt',
    'Strom & Heizung (Nebenkosten)',
    'Liegenschafts-Investitionen (CapEx)',
    'Total Wohnen & Liegenschaft',
    // Health Expenses
    'Krankenkasse',
    'Zahnarzt & Optiker',
    'Diverses & Reserve',
    'Gesundheits-CapEx',
    'Total Gesundheit & Diverses',
    // Living Expenses
    'Haushalt & Essen',
    'Mobilität',
    'Telefon, Handy & Medien',
    'Kleider & Freizeit',
    'Ferien & Reisen',
    'Versicherungen (Sonstige)',
    'Konsum-Investitionen (CapEx)',
    'Total Lebenshaltung',
    // Totals Outflow
    'Variable Kosten',
    'CapEx Total',
    'Ausgaben vor Steuern',
    // Taxes
    'Steuerbares Einkommen (Kanton)',
    'Einkommenssteuer',
    'Steuerbares Vermögen',
    'Vermögenssteuer',
    'Sondersteuern auf Kapitalbezüge',
    'Total Steuerbelastung',
    // Wealth
    'Überschuss / Defizit',
    'Flüssiges Vermögen (Ende)',
    'Säule 3a (Ende)',
    'Freizügigkeitskonto (Ende)',
    'Pensionskasse Guthaben (Ende)',
    'Immobilien Eigenkapital (Verkehrswert - Hypothek)',
    'Total Reinvermögen',
    // KPIs
    'Fixe Kosten',
    'Garantierte Einnahmen',
    'Deckungsgrad (%)',
    'Tragbarkeit (%)'
  ];

  rows.push(headers);

  const MARKUS_BIRTH_YEAR = 1961;
  const MONIQUE_BIRTH_YEAR = 1965; // Estimated from regular AHV start in 2030

  YEARS.forEach(yearKey => {
    const y = parseInt(yearKey);
    const data = yearDataMap[yearKey];

    if (!data) return;

    const ageMarkus = y - MARKUS_BIRTH_YEAR;
    const ageMonique = y - MONIQUE_BIRTH_YEAR;

    const row = [
      String(y),
      String(ageMarkus),
      String(ageMonique),
      // Incomes
      String(data.salaryIncome),
      String(data.ahvIncome),
      String(data.pkRenteIncome),
      String(data.wealthYieldIncome),
      String(data.otherIncome),
      String(data.eigenmietwert),
      String(data.totalGrossIncome),
      String(data.actualGrossIncome),
      String(data.stressGrossIncome),
      String(data.capitalWithdrawalAmount),
      // Housing Expenses
      String(data.mortgageInterest),
      String(data.amortisation),
      String(data.propertyMaintenance),
      String(data.stromHeizung),
      String(data.housingCapEx),
      String(data.housingTotal),
      // Health Expenses
      String(data.krankenkasse),
      String(data.zahnarztOptiker),
      String(data.diversesReserve),
      String(data.healthCapEx),
      String(data.healthTotal),
      // Living Expenses
      String(data.haushaltEssen),
      String(data.mobilitaet),
      String(data.telefonHandyMedien),
      String(data.kleiderFreizeit),
      String(data.ferienReisen),
      String(data.versicherungenSonstige),
      String(data.livingCapEx),
      String(data.livingTotal),
      // Totals Outflow
      String(data.variableKosten),
      String(data.capEx),
      String(data.totalOutflowExclTaxes),
      // Taxes
      String(data.taxableIncome),
      String(data.incomeTax),
      String(data.taxableWealth),
      String(data.wealthTax),
      String(data.capitalWithdrawalTax),
      String(data.totalTaxBurden),
      // Wealth
      String(data.surplusDeficit),
      String(data.liquidWealthEnd),
      String(data.saeule3aEnd),
      String(data.fzkEnd),
      String(data.pensionskasseCapitalEnd),
      String(data.bankLendingValue - data.mortgageDebt),
      String(data.totalWealthEnd),
      // KPIs
      String(data.fixedCosts),
      String(data.guaranteedIncome),
      String(data.coverageRatio.toFixed(2)),
      String(data.affordabilityRatio.toFixed(2))
    ];

    rows.push(row);
  });

  // Convert to CSV string using comma delimiter and properly escaping text fields
  return rows.map(r => r.map(escapeCSV).join(',')).join('\n');
};
