import React from 'react';
import type { PlanningState } from '../../context/PlanningContext';
import { Plus, Trash2 } from 'lucide-react';

interface StepProps {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState> | ((prev: PlanningState) => PlanningState)) => void;
}

const MONTH_OPTIONS = [
  { value: 0, label: 'Januar' },
  { value: 1, label: 'Februar' },
  { value: 2, label: 'März' },
  { value: 3, label: 'April' },
  { value: 4, label: 'Mai' },
  { value: 5, label: 'Juni' },
  { value: 6, label: 'Juli' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'Oktober' },
  { value: 10, label: 'November' },
  { value: 11, label: 'Dezember' },
];

const YEAR_OPTIONS = Array.from({ length: 2060 - 2026 + 1 }, (_, i) => 2026 + i);

export const Step2Income: React.FC<StepProps> = ({ state, updateState }) => {
  const handleSalaryChange = (index: number, field: string, value: any) => {
    updateState(prev => {
      const newStreams = [...prev.clientBaseline.salaryStreams];
      newStreams[index] = { ...newStreams[index], [field]: value };
      return {
        ...prev,
        clientBaseline: {
          ...prev.clientBaseline,
          salaryStreams: newStreams
        }
      };
    });
  };

  const addSalaryStream = () => {
    updateState(prev => ({
      ...prev,
      clientBaseline: {
        ...prev.clientBaseline,
        salaryStreams: [
          ...prev.clientBaseline.salaryStreams,
          {
            id: `salary-${Date.now()}`,
            description: 'Neuer Lohn',
            inputType: 'netto',
            amount: 5000,
            deductions: {
              ahv: 0, ahvBasis: 0, alv: 0, nbuv: 0, nubvBasis: 0, ktg: 0, ktgBasis: 0, bvg: 0, other: 0
            },
            startYear: new Date().getFullYear(),
            startMonth: 0,
            endYear: new Date().getFullYear() + 10,
            endMonth: 11,
            owner: 'Gemeinsam'
          }
        ]
      }
    }));
  };

  const removeSalaryStream = (index: number) => {
    updateState(prev => {
      const newStreams = [...prev.clientBaseline.salaryStreams];
      newStreams.splice(index, 1);
      return {
        ...prev,
        clientBaseline: {
          ...prev.clientBaseline,
          salaryStreams: newStreams
        }
      };
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Aktuelles Einkommen</h3>
        <p className="text-slate-400 mt-2">
          Erfassen Sie Ihre primären Lohnströme. Detaillierte Abzüge können Sie später im Haupt-Dashboard anpassen.
        </p>
      </div>

      <div className="space-y-4">
        {state.clientBaseline.salaryStreams.map((stream, index) => (
          <div key={stream.id} className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/80 shadow-sm relative group">
            <button
              onClick={() => removeSalaryStream(index)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beschreibung</label>
                <input
                  type="text"
                  value={stream.description}
                  onChange={e => handleSalaryChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Monatsbetrag (CHF)</label>
                <input
                  type="number"
                  value={stream.amount}
                  onChange={e => handleSalaryChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Besitzer</label>
                <select
                  value={stream.owner || 'Gemeinsam'}
                  onChange={e => handleSalaryChange(index, 'owner', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                >
                  <option value="Markus">Markus</option>
                  <option value="Monique">Monique</option>
                  <option value="Gemeinsam">Gemeinsam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Typ</label>
                <select
                  value={stream.inputType}
                  onChange={e => handleSalaryChange(index, 'inputType', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                >
                  <option value="netto">Netto</option>
                  <option value="brutto">Brutto</option>
                </select>
              </div>

              {/* Start Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Startmonat</label>
                  <select
                    value={stream.startMonth}
                    onChange={e => handleSalaryChange(index, 'startMonth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Startjahr</label>
                  <select
                    value={stream.startYear}
                    onChange={e => handleSalaryChange(index, 'startYear', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    {YEAR_OPTIONS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Endmonat</label>
                  <select
                    value={stream.endMonth}
                    onChange={e => handleSalaryChange(index, 'endMonth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Endjahr</label>
                  <select
                    value={stream.endYear}
                    onChange={e => handleSalaryChange(index, 'endYear', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    {YEAR_OPTIONS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addSalaryStream}
          className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-800/80 hover:bg-emerald-950/20 transition-all flex items-center justify-center font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Lohnstrom hinzufügen
        </button>
      </div>
    </div>
  );
};
