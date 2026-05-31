/**
 * Exhaustive mapping of German deduction keys → internal types
 * 
 * IMPORTANT: Every key in deductions.json MUST have an entry here.
 * The build-time validator will fail if any key is missing.
 * 
 * Total unique keys: 107
 */
import type { DeductionMapping } from './deduction.types';

export const TAX_DEDUCTION_MAPPING: Record<string, DeductionMapping> = {
    // ═══════════════════════════════════════════════════════════════════════════
    // WORK EXPENSES (Berufsauslagen)
    // ═══════════════════════════════════════════════════════════════════════════

    'Abzug für Fahrkosten Haupterwerb': {
        field: 'transport',
        logic: 'StandardCap',
        scope: 'per_person',
        description: 'Commuting costs main employment',
    },
    'Pauschalabzug Berufsauslagen Nebenerwerb': {
        field: 'professional',
        logic: 'PercentWithCap',
        scope: 'per_person',
        description: 'Secondary employment expenses (flat rate)',
    },
    'Pauschalabzug übrige Berufskosten': {
        field: 'professional',
        logic: 'PercentWithCap',
        scope: 'per_person',
        description: 'Other professional expenses (flat rate)',
    },
    'Abzug Mehrkosten der Verpflegung ohne Verbilligung': {
        field: 'meal',
        logic: 'StandardCap',
        scope: 'per_person',
        description: 'Meal expenses (no subsidy)',
    },
    'Abzug Mehrkosten der Verpflegung mit Verbilligung': {
        field: 'meal',
        logic: 'StandardCap',
        scope: 'per_person',
        description: 'Meal expenses (with subsidy)',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INSURANCE & SAVINGS (Versicherungsprämien und Sparzinsen)
    // ═══════════════════════════════════════════════════════════════════════════

    // -- Married --
    'Abzug Versicherungsprämien und Sparzinsen, Verheiratete mit  Beiträgen Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums, married, with pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, Verheiratete ohne Beiträge Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums, married, without pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, Verheiratete': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums, married (generic)',
    },
    'Abzug Versicherungsprämien und Sparzinsen, Verheiratete, beide mit Beiträgen Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums, married, both with pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, Verheiretete, eine Person ohne Beiträge Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums, married, one without pillar 2/3a',
    },
    'Abzug Versicherungspärmien und Sparzinsen, Verheiratete, beide ohne Beiträge Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums, married, both without pillar 2/3a',
    },
    'Abzug Versicherungsprämien, Verheiratete': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Insurance premiums only, married',
    },

    // -- Single --
    'Abzug Versicherungsprämien und Sparzinsen, alleinstehende Personen mit Beiträgen Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Insurance premiums, single, with pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, alleinstehende Personen ohne Beiträge Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Insurance premiums, single, without pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, alleinstehende Personen': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Insurance premiums, single (generic)',
    },
    'Abzug Versicherungsprämien, alleinstehende Personen': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Insurance premiums only, single',
    },

    // -- Children --
    'Abzug Versicherungsprämien und Sparzinsen, Kind': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Insurance premiums, child (generic)',
    },
    'Abzug Versicherungsprämien und Sparzinsen, Kind, mit  Beiträgen Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Insurance premiums, child, with pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, Kind, ohne Beiträgen Säule 2/3a': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Insurance premiums, child, without pillar 2/3a',
    },
    'Abzug Versicherungsprämien und Sparzinsen, minderj. Kind': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        eligibility: 'if_child_minor',
        description: 'Insurance premiums, minor child',
    },
    'Abzug Versicherungsprämien und Sparzinsen, vollj. Kind': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        eligibility: 'if_child_adult',
        description: 'Insurance premiums, adult child',
    },
    'Abzug Versicherungsprämien, Kind': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Insurance premiums only, child',
    },

    // -- Savings (Sparzinsen) --
    'Abzug Sparzinsen, Verheiratete': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Savings interest deduction, married',
    },
    'Abzug Sparzinsen, alleinstehende Personen': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Savings interest deduction, single',
    },
    'Abzug Sparzinsen pro Kind': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Savings interest deduction per child',
    },

    // -- Private insurance (separate from combined) --
    'Abzug private Versicherungen, Verheiratete': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Private insurance deduction, married',
    },
    'Abzug private Versicherungen, alleinstehende Personen': {
        field: 'insurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Private insurance deduction, single',
    },

    // -- Health insurance (Krankenkasse) --
    'Abzug Krankenkassenprämien, Verheiratete': {
        field: 'healthInsurance',
        logic: 'StandardCap',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Health insurance premiums, married',
    },
    'Abzug Krankenkassenprämien, alleinstehende Personen': {
        field: 'healthInsurance',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Health insurance premiums, single',
    },
    'Abzug Krankenkassenprämien, minderj. Kind': {
        field: 'healthInsurance',
        logic: 'StandardCap',
        scope: 'per_child',
        eligibility: 'if_child_minor',
        description: 'Health insurance premiums, minor child',
    },
    'Abzug Krankenkassenprämien, vollj. Kind in Ausbildung': {
        field: 'healthInsurance',
        logic: 'StandardCap',
        scope: 'per_child',
        eligibility: 'if_child_in_education',
        description: 'Health insurance premiums, adult child in education',
    },
    'Krankenkasse Durchschnittsprämie Erwachsene': {
        field: 'reference',
        logic: 'Reference',
        scope: 'per_household',
        description: 'Average health insurance premium adults (reference)',
    },
    'Krankenkasse Durchschnittsprämie für Minderjährige': {
        field: 'reference',
        logic: 'Reference',
        scope: 'per_child',
        description: 'Average health insurance premium minors (reference)',
    },
    'Krankenkasse Durchschnittsprämie junge Erwachsene': {
        field: 'reference',
        logic: 'Reference',
        scope: 'per_person',
        description: 'Average health insurance premium young adults (reference)',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PILLAR 3A (Säule 3a)
    // ═══════════════════════════════════════════════════════════════════════════

    'Maximalabzug Säule 3a mit Vorsorgelösung': {
        field: 'pillar3a',
        logic: 'StandardCap',
        scope: 'per_person',
        eligibility: 'if_has_pillar2',
        description: 'Pillar 3a max deduction (with pension plan)',
    },
    'Maximalabzug Säule 3a ohne Vorsorgelösung': {
        field: 'pillar3a',
        logic: 'StandardCap',
        scope: 'per_person',
        description: 'Pillar 3a max deduction (without pension plan)',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CHILD DEDUCTIONS (Kinderabzüge)
    // ═══════════════════════════════════════════════════════════════════════════

    'Kinderabzug': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Child deduction (general)',
    },
    'Kinderabzug, 1. und 2. Kind': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Child deduction, 1st and 2nd child',
    },
    'Kinderabzug ab dem 3. Kind': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Child deduction, 3rd+ child',
    },
    'Zusätzlicher Kinderabzug ab 3 Kinder': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_household',
        description: 'Additional child deduction for 3+ children',
    },

    // -- Age-based child deductions --
    'Kinderabzug, Alter unter 4': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, under 4',
    },
    'Kinderabzug, Alter unter 5': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, under 5',
    },
    'Kinderabzug, Alter unter 7': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, under 7',
    },
    'Kinderabzug, Alter unter 14': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, under 14',
    },
    'Kinderabzug, Alter unter 15': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, under 15',
    },
    'Kinderabzug, Alter zwischen 4 und 13': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, age 4-13',
    },
    'Kinderabzug, Alter zwischen 5 und 15': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, age 5-15',
    },
    'Kinderabzug, Alter zwischen 7 und 16': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, age 7-16',
    },
    'Kinderabzug, Alter zwischen 14 und 17': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, age 14-17',
    },
    'Kinderabzug, Alter über 6': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, over 6',
    },
    'Kinderabzug, Alter über 14': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, over 14',
    },
    'Kinderabzug, Alter über 15': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, over 15',
    },
    'Kinderabzug, Alter über 19': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        eligibility: 'if_child_in_education',
        description: 'Child deduction, over 19 (in education)',
    },
    'Kinderabzug, Alter 17': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, age 17',
    },
    'Kinderabzug, Alter 18 oder 19': {
        field: 'childDeduction',
        logic: 'AgeBasedChild',
        scope: 'per_child_age',
        description: 'Child deduction, age 18-19',
    },
    'Kinderabzug, minderjährige Kinder': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        eligibility: 'if_child_minor',
        description: 'Child deduction, minor children',
    },
    'Kinderabzug, volljährige Kinder': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        eligibility: 'if_child_adult',
        description: 'Child deduction, adult children',
    },
    'Kinderabzug, volljährige Kinder ausser Haus': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        eligibility: 'if_child_adult',
        description: 'Child deduction, adult children living elsewhere',
    },
    'Unterstützungsabzug für volljährige Kinder': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        eligibility: 'if_child_adult',
        description: 'Support deduction for adult children',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CHILDCARE (Kinderbetreuung)
    // ═══════════════════════════════════════════════════════════════════════════

    'Abzug Kinderdrittbetreuungskosten': {
        field: 'childcare',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Third-party childcare costs',
    },
    'Abzug Eigenbetreuung der Kinder': {
        field: 'selfCareChildcare',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Self-care childcare deduction',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // EDUCATION COSTS (Ausbildungskosten)
    // ═══════════════════════════════════════════════════════════════════════════

    'Abzug Kinderausbildungskosten': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Child education costs (generic)',
    },
    'Abzug Kinderausbildungskosten für auswärtige Ausbildung': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Child education costs for external education',
    },
    'Abzug Kinderausbildungskosten, auswärtige Ausbildung mit Wochenaufenthalt': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, external with weekly stay',
    },
    'Abzug Kinderausbildungskosten, auswärtige Ausbildung mit Wochenaufenthalt erstes Kind': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, external weekly stay, 1st child',
    },
    'Abzug Kinderausbildungskosten, auswärtige Ausbildung mit Wochenaufenthalt ab dem 2. Kind': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, external weekly stay, 2nd+ child',
    },
    'Abzug Kinderausbildungskosten, auswärtige Ausbildung mit Wochenaufenthalt innerhalb des Kantons': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, weekly stay within canton',
    },
    'Abzug Kinderausbildungskosten, für auswärtige Ausbildung mit Wochenaufenthalt ausserhalb des Kantons': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, weekly stay outside canton',
    },
    'Abzug Kinderausbildungskosten, auswärtige Ausbildung ohne Wochenaufenthalt': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, external without weekly stay',
    },
    'Abzug Kinderausbildungskosten, auswärtige Ausbildung ohne Wochenaufenthalt ausserhalb des Kantons': {
        field: 'educationCosts',
        logic: 'StandardCap',
        scope: 'per_child',
        description: 'Education costs, no weekly stay, outside canton',
    },
    'Kinderausbildungskosten Eigenbeitrag': {
        field: 'reference',
        logic: 'Reference',
        scope: 'per_child',
        description: 'Education costs own contribution (reference)',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // FAMILY STATUS DEDUCTIONS (Familienabzüge)
    // ═══════════════════════════════════════════════════════════════════════════

    'Verheiratetenabzug': {
        field: 'marriedDeduction',
        logic: 'FixedAmount',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Married couple deduction',
    },
    'Zweitverdienerabzug': {
        field: 'dualIncomeDeduction',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_dual_income',
        description: 'Dual income deduction',
    },
    'Abzug für Alleinerzieher': {
        field: 'singleParentDeduction',
        logic: 'FixedAmount',
        scope: 'per_household',
        eligibility: 'if_single_parent',
        description: 'Single parent deduction',
    },
    'Abzug für Alleinstehende mit Kindern': {
        field: 'singleParentDeduction',
        logic: 'FixedAmount',
        scope: 'per_household',
        eligibility: 'if_single_parent',
        description: 'Single with children deduction',
    },
    'Abzug für ledige Steuerpflichtige': {
        field: 'singlePersonDeduction',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Single taxpayer deduction',
    },
    'Abzug für Alleinstehende mit eigenem Haushalt': {
        field: 'singlePersonDeduction',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Single with own household deduction',
    },
    'Abzug für Alleinstehende über 65 Jährige': {
        field: 'retiredDeduction',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_over_65',
        description: 'Single over 65 deduction',
    },
    'Abzug für AHV-/IV-Rentner': {
        field: 'retiredDeduction',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_retired',
        description: 'AHV/IV pensioner deduction',
    },
    'Abzug für ledige AHV-/IV-Rentner, Alleinstehend ohne Kind': {
        field: 'retiredDeduction',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_retired',
        description: 'Single AHV/IV pensioner without children',
    },
    'Zusätzlicher Sozialabzug': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_household',
        description: 'Additional social deduction',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // MODEST INCOME RELIEF (Sozialabzug)
    // ═══════════════════════════════════════════════════════════════════════════

    'Sozialabzug bescheidene Einkommen': {
        field: 'modestIncomeRelief',
        logic: 'PercentWithCap',
        scope: 'per_household',
        description: 'Modest income social deduction',
    },
    'Sozialabzug bescheidene Einkommen ledig': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Modest income deduction, single',
    },
    'Sozialabzug bescheidene Einkommen verheiratet': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Modest income deduction, married',
    },
    'Sozialabzug bescheidene Einkommen Kind': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Modest income deduction per child',
    },
    'Sozialabzug bescheidene Einkommen alleinerziehend mit Kind': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_household',
        eligibility: 'if_single_parent',
        description: 'Modest income deduction, single parent',
    },
    'Sozialabzug bescheidenes Vermögen Rentner geringes Einkommen': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_retired',
        description: 'Modest wealth deduction, retired low income',
    },
    'Sozialabzug bescheidenes Vermögen Rentner mittleres Einkommen': {
        field: 'modestIncomeRelief',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_retired',
        description: 'Modest wealth deduction, retired medium income',
    },
    'Steuerermässigung pro Kind': {
        field: 'childDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Tax reduction per child',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PROPERTY (Liegenschaften)
    // ═══════════════════════════════════════════════════════════════════════════

    'Pauschalabzug Unterhaltskosten Liegenschaften mit Alter bis 10 Jahren': {
        field: 'maintenance',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_property_new',
        description: 'Property maintenance (< 10 years)',
    },
    'Pauschale Unterhaltskosten von Liegenschaften mit Alter über 10 Jahren': {
        field: 'maintenance',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_property_old',
        description: 'Property maintenance (> 10 years)',
    },
    'Pauschalabzug Unterhaltskosten von selbstbewohnten Liegenschaften mit Alter bis 20 Jahren': {
        field: 'maintenance',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_property_new',
        description: 'Owner-occupied property maintenance (< 20 years)',
    },
    'Pauschale Unterhaltskosten von selbstbewohnten Liegenschaften mit Alter über 20 Jahren': {
        field: 'maintenance',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_property_old',
        description: 'Owner-occupied property maintenance (> 20 years)',
    },
    'Pauschalabzug Unterhaltskosten von vermieteten Liegenschaften mit Alter bis 20 Jahren': {
        field: 'maintenance',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_property_rented',
        description: 'Rented property maintenance (< 20 years)',
    },
    'Pauschalabzug Unterhaltskosten von vermieteten Liegenschaften mit Alter über 20 Jahren': {
        field: 'maintenance',
        logic: 'PercentWithCap',
        scope: 'per_household',
        eligibility: 'if_property_rented',
        description: 'Rented property maintenance (> 20 years)',
    },
    'Abzug vom Eigenmietwert': {
        field: 'imputedRentDeduction',
        logic: 'PercentWithCap',
        scope: 'per_household',
        description: 'Imputed rental value deduction',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // RENTAL (Miete)
    // ═══════════════════════════════════════════════════════════════════════════

    'Maximalabzug Miete': {
        field: 'rentalDeduction',
        logic: 'StandardCap',
        scope: 'per_household',
        description: 'Maximum rent deduction',
    },
    'Pauschalabzug Miete Ledige': {
        field: 'rentalDeduction',
        logic: 'FixedAmount',
        scope: 'per_person',
        eligibility: 'if_single',
        description: 'Flat rent deduction, single',
    },
    'Pauschalabzug Miete Verheiratete': {
        field: 'rentalDeduction',
        logic: 'FixedAmount',
        scope: 'per_household',
        eligibility: 'if_married',
        description: 'Flat rent deduction, married',
    },
    'Pauschalabzug Miete je Kind': {
        field: 'rentalDeduction',
        logic: 'FixedAmount',
        scope: 'per_child',
        description: 'Flat rent deduction per child',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // WEALTH MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    'Abzug Vermögensverwaltungskosten': {
        field: 'wealthManagement',
        logic: 'PercentWithCap',
        scope: 'per_household',
        description: 'Wealth management costs',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // THRESHOLDS & REFERENCE VALUES (not applied as deductions)
    // ═══════════════════════════════════════════════════════════════════════════

    'Maximaler technischer Zinssatz Einmaleinlage in CHF FINMA': {
        field: 'reference',
        logic: 'Reference',
        scope: 'per_household',
        description: 'FINMA technical interest rate (reference only)',
    },
    'Entlastungsabzug Alleinstehende Schwellwert': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_household',
        description: 'Income threshold for single relief',
    },
    'Entlastungsabzug Verheiratete Schwellwert': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_household',
        description: 'Income threshold for married relief',
    },
    'Entlastungsabzug Kind Schwellwert': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_child',
        description: 'Income threshold per child relief',
    },
    'Schwellwert für Abzug AHV-/IV-Rentner': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_person',
        description: 'Income threshold for retired deduction',
    },
    'Schwellwert für Abzug ledige AHV-/IV-Rentner, Alleinstehend ohne Kind': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_person',
        description: 'Income threshold for single retired deduction',
    },
    'Familien Sozialabzug Schwellwert Austritt 1': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_household',
        description: 'Family social deduction threshold 1',
    },
    'Familien Sozialabzug Schwellwert Austritt 2': {
        field: 'threshold',
        logic: 'Threshold',
        scope: 'per_household',
        description: 'Family social deduction threshold 2',
    },
    'Faktor PrivVers/Sparzinsen Verheiratete beide ohne Beiträge an die 2. und 3. Säule': {
        field: 'factor',
        logic: 'Reference',
        scope: 'per_household',
        description: 'Factor for married both without pillar 2/3',
    },
    'Faktor PrivVers/Sparzinsen Verheiratete eine Person ohne Beiträge an die 2. und 3. Säule': {
        field: 'factor',
        logic: 'Reference',
        scope: 'per_household',
        description: 'Factor for married one without pillar 2/3',
    },
    'Faktor Versicherungsprämien und Sparzinsen, alleinstehende Personen ohne Beiträge Säule 2/3a': {
        field: 'factor',
        logic: 'Reference',
        scope: 'per_person',
        description: 'Factor for single without pillar 2/3a',
    },
} as const;

/**
 * Type-safe accessor for known keys
 */
export type KnownDeductionKey = keyof typeof TAX_DEDUCTION_MAPPING;

/**
 * Get all mapped German keys
 */
export const getMappedKeys = (): string[] => Object.keys(TAX_DEDUCTION_MAPPING);
