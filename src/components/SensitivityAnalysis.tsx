import { useState, useMemo } from 'react';
import { usePlanning, type PlanningState, type YearKey } from '../context/PlanningContext';
import { runProjection, runMonteCarlo } from '../hooks/useCalculations';
import { formatCHF, formatPercent } from '../utils/format';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const SensitivityAnalysis = () => {
  const { state, updateState } = usePlanning();
  const [customSplit, setCustomSplit] = useState(state.pensionskasseMarkus.renteSplit);
  const [customYield, setCustomYield] = useState(state.baseline.liquidYieldRate);
  const [chartMode, setChartMode] = useState<'total' | 'liquid'>('total');

  const isApplied = state.pensionskasseMarkus.renteSplit === customSplit && state.pensionskasseMonique.renteSplit === customSplit && state.baseline.liquidYieldRate === customYield;

  // Run projections for all scenarios (applying custom yield sensitivity to all strategies)
  const proj100 = useMemo(() => runProjection(state, 100, customYield), [state, customYield]);
  const proj50 = useMemo(() => runProjection(state, 50, customYield), [state, customYield]);
  const proj0 = useMemo(() => runProjection(state, 0, customYield), [state, customYield]);
  const projCustom = useMemo(() => runProjection(state, customSplit, customYield), [state, customSplit, customYield]);

  // Run Monte Carlo simulations for all scenarios (applying custom yield sensitivity to all strategies)
  const mc100 = useMemo(() => runMonteCarlo(state, 100, customYield, 100), [state, customYield]);
  const mc50 = useMemo(() => runMonteCarlo(state, 50, customYield, 100), [state, customYield]);
  const mc0 = useMemo(() => runMonteCarlo(state, 0, customYield, 100), [state, customYield]);
  const mcCustom = useMemo(() => runMonteCarlo(state, customSplit, customYield, 100), [state, customSplit, customYield]);

  // Helper to extract scenario metrics
  const getMetrics = (proj: any, mc: any) => {
    // Annual rent is pkRenteIncome in representative year 2031+
    const annualRente = proj.data['2031+']?.pkRenteIncome || 0;
    const monthlyRente = annualRente / 12;

    // Total capital withdrawal tax paid
    let totalWithdrawalTax = 0;
    Object.values(proj.data).forEach((yr: any) => {
      totalWithdrawalTax += yr.capitalWithdrawalTax;
    });

    const finalPoint = proj.trajectory[proj.trajectory.length - 1];
    const totalWealth2060 = finalPoint?.totalWealth || 0;
    const liquidWealth2060 = finalPoint?.liquidWealth || 0;

    // First year liquid wealth goes below 0 in deterministic trajectory
    const depletionPoint = proj.trajectory.find((t: any) => t.liquidWealth < 0);
    const depletionYear = depletionPoint ? String(depletionPoint.year) : 'Nie';

    return {
      monthlyRente,
      totalWithdrawalTax,
      totalWealth2060,
      liquidWealth2060,
      drawdownRisk: mc.riskOfDropping,
      depletionRisk: mc.riskOfDepletion,
      depletionYear,
    };
  };

  const metrics100 = useMemo(() => getMetrics(proj100, mc100), [proj100, mc100]);
  const metrics50 = useMemo(() => getMetrics(proj50, mc50), [proj50, mc50]);
  const metrics0 = useMemo(() => getMetrics(proj0, mc0), [proj0, mc0]);
  const metricsCustom = useMemo(() => getMetrics(projCustom, mcCustom), [projCustom, mcCustom]);

  // --- Death Scenario Sensitivities (Markus born 1961) ---
  const MARKUS_BIRTH_YEAR = 1961;
  const deathScenarios = [
    { label: 'Kein Todesfall', age: null, year: null },
    { label: 'Markus † Alter 80', age: 80, year: MARKUS_BIRTH_YEAR + 80 },
    { label: 'Markus † Alter 85', age: 85, year: MARKUS_BIRTH_YEAR + 85 },
    { label: 'Markus † Alter 90', age: 90, year: MARKUS_BIRTH_YEAR + 90 },
  ];

  const makeDeathState = (deathYear: number | null): PlanningState => {
    if (deathYear === null) {
      return {
        ...state,
        survivor: {
          deceasedPartner: 'Keiner',
          deathYear: 2035,
          expenseReductionFactor: state.survivor?.expenseReductionFactor ?? 70,
          pkSurvivorRate: state.survivor?.pkSurvivorRate ?? 60
        }
      };
    }
    return {
      ...state,
      survivor: {
        deceasedPartner: 'Markus',
        deathYear,
        expenseReductionFactor: state.survivor?.expenseReductionFactor ?? 70,
        pkSurvivorRate: state.survivor?.pkSurvivorRate ?? 60
      }
    };
  };

  const deathProjections = useMemo(() => {
    return deathScenarios.map(scenario => {
      const deathState = makeDeathState(scenario.year);
      const proj = runProjection(deathState, customSplit, customYield);
      const finalPoint = proj.trajectory[proj.trajectory.length - 1];
      const depletionPoint = proj.trajectory.find((t: any) => t.liquidWealth < 0);
      return {
        ...scenario,
        proj,
        totalWealth2060: finalPoint?.totalWealth || 0,
        liquidWealth2060: finalPoint?.liquidWealth || 0,
        depletionYear: depletionPoint ? String(depletionPoint.year) : 'Nie',
        annualIncomePost: scenario.year ? proj.yearResults[Math.min(scenario.year + 1, 2060)]?.ahvIncome + proj.yearResults[Math.min(scenario.year + 1, 2060)]?.pkRenteIncome : proj.yearResults[2035]?.ahvIncome + proj.yearResults[2035]?.pkRenteIncome,
      };
    });
  }, [state, customSplit, customYield]);

  const deathChartData = useMemo(() => {
    const baseline = deathProjections[0];
    return baseline.proj.trajectory.map((point: any, index: number) => {
      const row: any = { year: point.year };
      deathProjections.forEach(dp => {
        row[dp.label] = chartMode === 'total'
          ? dp.proj.trajectory[index]?.totalWealth || 0
          : dp.proj.trajectory[index]?.liquidWealth || 0;
      });
      return row;
    });
  }, [deathProjections, chartMode]);

  // Handle applying split and yield rate to main scenario
  const handleApplyScenario = () => {
    updateState('pensionskasseMarkus', { renteSplit: customSplit });
    updateState('pensionskasseMonique', { renteSplit: customSplit });
    updateState('baseline', { liquidYieldRate: customYield });
  };

  // Compile line chart data
  const chartData = useMemo(() => {
    return projCustom.trajectory.map((point, index) => {
      const year = point.year;
      return {
        year,
        '100% Rente': chartMode === 'total' ? proj100.trajectory[index].totalWealth : proj100.trajectory[index].liquidWealth,
        '50/50 Split': chartMode === 'total' ? proj50.trajectory[index].totalWealth : proj50.trajectory[index].liquidWealth,
        '100% Kapital': chartMode === 'total' ? proj0.trajectory[index].totalWealth : proj0.trajectory[index].liquidWealth,
        'Individuell': chartMode === 'total' ? projCustom.trajectory[index].totalWealth : projCustom.trajectory[index].liquidWealth,
      };
    });
  }, [proj100, proj50, proj0, projCustom, chartMode]);

  // Compile income/expense data for custom scenario
  const incomeExpenseData = useMemo(() => {
    const dataList: any[] = [];
    const YEARS_WITHOUT_LATEST = ['2026', '2027', '2028', '2029', '2030'];
    
    YEARS_WITHOUT_LATEST.forEach(year => {
      const yrData = projCustom.data[year as YearKey];
      if (!yrData) return;
      const income = yrData.salaryIncome + yrData.ahvIncome + yrData.pkRenteIncome + yrData.wealthYieldIncome + yrData.otherIncome;
      const expenses = yrData.totalOutflowExclTaxes;
      const taxes = yrData.totalTaxBurden;
      dataList.push({
        year: parseInt(year),
        Einnahmen: Math.round(income),
        Ausgaben: Math.round(expenses),
        Steuern: Math.round(taxes),
        Gesamtausgaben: Math.round(expenses + taxes),
        Nettoüberschuss: Math.round(income - (expenses + taxes))
      });
    });

    const baseData = projCustom.data['2031+'];
    if (baseData) {
      const incomeBase = baseData.salaryIncome + baseData.ahvIncome + baseData.pkRenteIncome + baseData.wealthYieldIncome + baseData.otherIncome;
      const expensesBase = baseData.totalOutflowExclTaxes;
      const taxesBase = baseData.totalTaxBurden;

      for (let y = 2031; y <= 2060; y++) {
        dataList.push({
          year: y,
          Einnahmen: Math.round(incomeBase),
          Ausgaben: Math.round(expensesBase),
          Steuern: Math.round(taxesBase),
          Gesamtausgaben: Math.round(expensesBase + taxesBase),
          Nettoüberschuss: Math.round(incomeBase - (expensesBase + taxesBase))
        });
      }
    }

    return dataList;
  }, [projCustom]);

  // Custom chart tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 shadow-2xl rounded min-w-[200px] text-slate-200 font-mono text-xs">
          <p className="font-bold border-b border-slate-800 pb-1.5 mb-2 text-slate-100 font-sans">Jahr {label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center py-1">
              <span style={{ color: p.color }} className="font-medium">{p.name}:</span>
              <span className="ml-4 text-slate-100 font-bold">{formatCHF(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Title Panel */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">Sensitivitäts-Analyse</h2>
          <p className="text-sm text-slate-400">Vergleich der Pensionskassen-Bezugsstrategien (Rente vs. Kapital)</p>
        </div>
        <div className="text-xs text-slate-400 max-w-md bg-slate-950 border border-slate-800 p-2.5 rounded">
          <span className="font-semibold text-emerald-400">Hinweis:</span> Der Vergleich basiert auf Ihren eingetragenen Vorsorgeständen und simuliert die Vermögensentwicklung bis 2060 unter Berücksichtigung von Renten, Steuern und Anlagerenditen.
        </div>
      </div>

      {/* Control Panel: Sliders & Apply Action */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-md font-bold text-slate-100 mb-4 font-mono border-b border-slate-800 pb-2">Individuelle Sensitivitäts-Parameter</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-6">
            {/* Slider 1: Pensionskasse Bezugsmix */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-medium">1. Pensionskassen-Bezugsmix (Markus & Monique)</span>
                <span className="text-md font-bold text-amber-400 font-mono">
                  {customSplit}% Rente / {100 - customSplit}% Kapital
                </span>
              </div>
              
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={customSplit}
                  onChange={(e) => setCustomSplit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>0% Rente (100% Kapital)</span>
                  <span>50% / 50%</span>
                  <span>100% Rente (0% Kapital)</span>
                </div>
              </div>
            </div>

            {/* Slider 2: Anlagerendite auf Liquidität */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-medium">2. Anlagerendite auf liquides Vermögen (Rendite p.a.)</span>
                <span className="text-md font-bold text-emerald-400 font-mono">
                  {customYield.toFixed(2)}%
                </span>
              </div>
              
              <div className="relative pt-1">
                <input
                  type="range"
                  min="-2.0"
                  max="8.0"
                  step="0.25"
                  value={customYield}
                  onChange={(e) => setCustomYield(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>-2.00% (Realverlust)</span>
                  <span>0.00%</span>
                  <span>3.00% (Historisch mild)</span>
                  <span>8.00% (Aggressives Aktien-Modell)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-3 bg-slate-950/40 p-4 border border-slate-800/80 rounded-md">
            <div className="text-center sm:text-left lg:text-right w-full space-y-1">
              <div className="text-xs text-slate-400">Parameter-Übersicht für Simulation:</div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                Rente: <span className="text-emerald-400">{formatCHF(metricsCustom.monthlyRente * 12)} / Jahr</span> ({formatCHF(metricsCustom.monthlyRente)} / Mon.)
              </div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                Kapitalbezug: <span className="text-indigo-400">{formatCHF((state.pensionskasseMarkus.totalCapital + state.pensionskasseMonique.totalCapital) * ((100 - customSplit) / 100))}</span> einmalig
              </div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                Rendite: <span className="text-amber-400">{customYield.toFixed(2)}% p.a.</span>
              </div>
            </div>

            {isApplied ? (
              <span className="inline-flex justify-center items-center px-4 py-2 rounded text-xs font-semibold bg-emerald-950/50 border border-emerald-800/80 text-emerald-400 font-mono shadow-sm w-full">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
                Als Hauptszenario aktiv
              </span>
            ) : (
              <button
                onClick={handleApplyScenario}
                className="px-4 py-2 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
              >
                In Hauptplanung speichern
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl overflow-x-auto">
        <h3 className="text-md font-bold text-slate-100 mb-4 font-mono border-b border-slate-800 pb-2">Kennzahlen-Vergleich</h3>
        
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 tracking-wider">
              <th className="py-3 px-4">Szenario</th>
              <th className="py-3 px-4 text-right">Monatliche PK-Rente</th>
              <th className="py-3 px-4 text-right">Kapitalbezugssteuer</th>
              <th className="py-3 px-4 text-right">Total-Vermögen 2060</th>
              <th className="py-3 px-4 text-right">Liquides Vermögen 2060</th>
              <th className="py-3 px-4 text-right">Drawdown-Risiko¹</th>
              <th className="py-3 px-4 text-right">Liquiditätserschöpfung²</th>
              <th className="py-3 px-4 text-center">Jahr Erschöpfung</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono divide-y divide-slate-800">
            {/* 100% Rente */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 font-sans font-medium text-blue-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                100% Rente
              </td>
              <td className="py-3.5 px-4 text-right text-slate-200">{formatCHF(metrics100.monthlyRente)}</td>
              <td className="py-3.5 px-4 text-right text-slate-400">{formatCHF(metrics100.totalWithdrawalTax)}</td>
              <td className="py-3.5 px-4 text-right text-slate-200 font-semibold">{formatCHF(metrics100.totalWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatCHF(metrics100.liquidWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatPercent(metrics100.drawdownRisk)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatPercent(metrics100.depletionRisk)}</td>
              <td className={`py-3.5 px-4 text-center ${metrics100.depletionYear !== 'Nie' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>{metrics100.depletionYear}</td>
            </tr>

            {/* 50/50 Split */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 font-sans font-medium text-purple-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                50/50 Split
              </td>
              <td className="py-3.5 px-4 text-right text-slate-200">{formatCHF(metrics50.monthlyRente)}</td>
              <td className="py-3.5 px-4 text-right text-slate-400">{formatCHF(metrics50.totalWithdrawalTax)}</td>
              <td className="py-3.5 px-4 text-right text-slate-200 font-semibold">{formatCHF(metrics50.totalWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatCHF(metrics50.liquidWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatPercent(metrics50.drawdownRisk)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatPercent(metrics50.depletionRisk)}</td>
              <td className={`py-3.5 px-4 text-center ${metrics50.depletionYear !== 'Nie' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>{metrics50.depletionYear}</td>
            </tr>

            {/* 100% Kapital */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 font-sans font-medium text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                100% Kapital
              </td>
              <td className="py-3.5 px-4 text-right text-slate-200">{formatCHF(metrics0.monthlyRente)}</td>
              <td className="py-3.5 px-4 text-right text-slate-400">{formatCHF(metrics0.totalWithdrawalTax)}</td>
              <td className="py-3.5 px-4 text-right text-slate-200 font-semibold">{formatCHF(metrics0.totalWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatCHF(metrics0.liquidWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatPercent(metrics0.drawdownRisk)}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">{formatPercent(metrics0.depletionRisk)}</td>
              <td className={`py-3.5 px-4 text-center ${metrics0.depletionYear !== 'Nie' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>{metrics0.depletionYear}</td>
            </tr>

            {/* Custom Split (Individuell) */}
            <tr className="bg-slate-850/50 border-t-2 border-slate-700 hover:bg-slate-800/50 transition-colors font-bold text-slate-100">
              <td className="py-3.5 px-4 font-sans font-semibold text-amber-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                Individuell ({customSplit}%)
              </td>
              <td className="py-3.5 px-4 text-right text-amber-400">{formatCHF(metricsCustom.monthlyRente)}</td>
              <td className="py-3.5 px-4 text-right text-slate-400 font-normal">{formatCHF(metricsCustom.totalWithdrawalTax)}</td>
              <td className="py-3.5 px-4 text-right text-amber-400">{formatCHF(metricsCustom.totalWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-100">{formatCHF(metricsCustom.liquidWealth2060)}</td>
              <td className="py-3.5 px-4 text-right text-slate-100 font-normal">{formatPercent(metricsCustom.drawdownRisk)}</td>
              <td className="py-3.5 px-4 text-right text-slate-100 font-normal">{formatPercent(metricsCustom.depletionRisk)}</td>
              <td className={`py-3.5 px-4 text-center ${metricsCustom.depletionYear !== 'Nie' ? 'text-red-400 font-bold' : 'text-slate-400 font-normal'}`}>{metricsCustom.depletionYear}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-4 space-y-1 text-[11px] text-slate-500 leading-normal">
          <p>¹ <span className="font-semibold">Drawdown-Risiko:</span> Die stochastische Wahrscheinlichkeit (Monte Carlo, 100 Pfade mit 5.5% Renditevolatilität), dass das liquide Vermögen während des Planungszeitraums unter das Startkapital ({formatCHF(state.assets.startingLiquidWealth)}) fällt.</p>
          <p>² <span className="font-semibold">Liquiditätserschöpfung:</span> Die stochastische Wahrscheinlichkeit, dass das liquide Vermögen während der Pensionierungsjahre komplett aufgezehrt wird (Kontostand &lt; 0 CHF).</p>
        </div>
      </div>

      {/* Trajectory Comparison Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-2 mb-6 gap-3">
          <div>
            <h3 className="text-md font-bold text-slate-100 font-mono">Verlauf der Vermögensentwicklung</h3>
            <p className="text-xs text-slate-400">Vergleich der vier Bezugsszenarien im zeitlichen Verlauf</p>
          </div>
          
          <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-md">
            <button
              onClick={() => setChartMode('total')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                chartMode === 'total'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Total-Vermögen
            </button>
            <button
              onClick={() => setChartMode('liquid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                chartMode === 'liquid'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Liquides Vermögen
            </button>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis
                stroke="#64748b"
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              <Line
                type="monotone"
                dataKey="100% Rente"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeOpacity={0.65}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="50/50 Split"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeOpacity={0.65}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="100% Kapital"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeOpacity={0.65}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Individuell"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeOpacity={1}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
        <div className="border-b border-slate-800 pb-2 mb-6">
          <h3 className="text-md font-bold text-slate-100 font-mono">Einkünfte vs. Gesamtausgaben (Individuelles Szenario)</h3>
          <p className="text-xs text-slate-400">Gegenüberstellung von jährlichen Einnahmen und Ausgaben (inkl. Steuern) für den gewählten Bezugsmix ({customSplit}%) und Rendite ({customYield.toFixed(2)}%)</p>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={incomeExpenseData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis
                stroke="#64748b"
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const surplus = data.Einnahmen - data.Gesamtausgaben;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-3 shadow-2xl rounded min-w-[220px] text-slate-200 font-mono text-xs">
                        <p className="font-bold border-b border-slate-800 pb-1.5 mb-2 text-slate-100 font-sans">Jahr {label}</p>
                        <div className="flex justify-between py-1">
                          <span className="text-emerald-400 font-medium">Einkünfte:</span>
                          <span className="text-slate-100 font-bold">{formatCHF(data.Einnahmen)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-blue-400 font-medium">Ausgaben (Konsum/Wohnen):</span>
                          <span className="text-slate-100 font-bold">{formatCHF(data.Ausgaben)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60 pb-1">
                          <span className="text-rose-400 font-medium">Steuern:</span>
                          <span className="text-slate-100 font-bold">{formatCHF(data.Steuern)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 font-bold text-slate-300">
                          <span>Gesamtausgaben:</span>
                          <span>{formatCHF(data.Gesamtausgaben)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-t border-slate-800 mt-1 font-bold">
                          <span>{surplus >= 0 ? 'Nettoüberschuss:' : 'Fehlbetrag:'}</span>
                          <span className={surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {surplus >= 0 ? '+' : ''}{formatCHF(surplus)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} />
              
              <Bar
                dataKey="Einnahmen"
                name="Jährliche Einkünfte"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
              
              <Bar
                dataKey="Ausgaben"
                name="Lebenshaltung & Wohnen"
                stackId="outflow"
                fill="#3b82f6"
                maxBarSize={45}
              />
              
              <Bar
                dataKey="Steuern"
                name="Steuerbelastung"
                stackId="outflow"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Death Scenario Sensitivity */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
        <div className="border-b border-slate-800 pb-2 mb-6">
          <h3 className="text-md font-bold text-slate-100 font-mono">Ablebensszenario-Sensitivität: Markus</h3>
          <p className="text-xs text-slate-400 mt-1">
            Vergleich der Vermögensentwicklung bei Tod von Markus im Alter 80, 85 oder 90 (Geb. {MARKUS_BIRTH_YEAR}) gegenüber dem Normalverlauf. Bezugsmix: {customSplit}% Rente, Rendite: {customYield.toFixed(2)}%.
          </p>
        </div>

        {/* Death Scenario KPI Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 tracking-wider">
                <th className="py-3 px-4">Szenario</th>
                <th className="py-3 px-4 text-right">Todesjahr</th>
                <th className="py-3 px-4 text-right">AHV+PK nach Tod (p.a.)</th>
                <th className="py-3 px-4 text-right">Total-Vermögen 2060</th>
                <th className="py-3 px-4 text-right">Liquides Vermögen 2060</th>
                <th className="py-3 px-4 text-center">Jahr Erschöpfung</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono divide-y divide-slate-800">
              {deathProjections.map((dp, idx) => {
                const colors = ['text-emerald-400', 'text-blue-400', 'text-purple-400', 'text-rose-400'];
                const dots = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500'];
                return (
                  <tr key={idx} className={`hover:bg-slate-800/30 transition-colors ${idx === 0 ? 'font-semibold' : ''}`}>
                    <td className={`py-3.5 px-4 font-sans font-medium ${colors[idx]} flex items-center gap-2`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${dots[idx]}`}></span>
                      {dp.label}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{dp.year ?? '–'}</td>
                    <td className="py-3.5 px-4 text-right text-slate-200">{dp.annualIncomePost != null ? formatCHF(dp.annualIncomePost) : '–'}</td>
                    <td className="py-3.5 px-4 text-right text-slate-200 font-semibold">{formatCHF(dp.totalWealth2060)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{formatCHF(dp.liquidWealth2060)}</td>
                    <td className={`py-3.5 px-4 text-center ${dp.depletionYear !== 'Nie' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>{dp.depletionYear}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Death Scenario Trajectory Chart */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={deathChartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis
                stroke="#64748b"
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />

              <Line type="monotone" dataKey="Kein Todesfall" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Markus † Alter 80" stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.8} dot={false} />
              <Line type="monotone" dataKey="Markus † Alter 85" stroke="#8b5cf6" strokeWidth={1.5} strokeOpacity={0.8} dot={false} />
              <Line type="monotone" dataKey="Markus † Alter 90" stroke="#f43f5e" strokeWidth={1.5} strokeOpacity={0.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-[11px] text-slate-500 leading-normal">
          <p><span className="font-semibold">Annahmen:</span> Witwenrente AHV = Max(Eigene×1.2, Verstorbene×0.8), gedeckelt bei 2'450 CHF/Mt. PK-Witwenrente = {state.survivor?.pkSurvivorRate ?? 60}% des Verstorbenen-Anteils. Variable Lebenshaltung auf {state.survivor?.expenseReductionFactor ?? 70}% reduziert. Steuertarif wechselt auf Alleinstehend.</p>
        </div>
      </div>

      {/* Strategic Interpretation & Recommendations */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl space-y-4">
        <h3 className="text-md font-bold text-slate-100 font-mono border-b border-slate-800 pb-2">Analysten-Kommentar & Auswertung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2 border-r border-slate-800/80 pr-4">
            <span className="text-xs font-semibold uppercase text-blue-400 font-mono">1. Sicherheits-Perspektive</span>
            <p>
              Ein hoher <strong>Rentenbezug (100% Rente)</strong> garantiert ein lebenslanges regelmässiges Einkommen. Dies eliminiert das Langlebigkeitsrisiko komplett. Aufgrund der relativ tiefen Anlagerendite auf Liquidität ist die stochastische Erschöpfungswahrscheinlichkeit oft am geringsten, solange das Budget ausgeglichen ist.
            </p>
          </div>
          <div className="space-y-2 border-r border-slate-800/80 pr-4">
            <span className="text-xs font-semibold uppercase text-emerald-400 font-mono">2. Vermögens- & Erbschafts-Perspektive</span>
            <p>
              Ein hoher <strong>Kapitalbezug (100% Kapital)</strong> führt steuerlich zu einer einmaligen Sondersteuer, spart jedoch danach Einkommenssteuern auf Renteneinkünften. Das Vermögen bleibt flexibel verfügbar und ist vererbbar. Dafür steigt die Abhängigkeit von Anlagerenditen und das Risiko der vorzeitigen Liquiditätserschöpfung.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-purple-400 font-mono">3. Steuerlicher Mischansatz</span>
            <p>
              Ein <strong>Mischbezug (z.B. 50/50)</strong> bricht die Steuerprogression: Die Rente sichert das Grundbudget für Fixkosten, während das bezogene Kapital die Flexibilität für Sonderausgaben erhöht und das steuerbare Einkommen senkt. Dies ist oft der optimale Kompromiss zwischen Stabilität und Flexibilität.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
